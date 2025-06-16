import { type NextRequest, NextResponse } from "next/server"
import { exec } from "child_process"
import { promisify } from "util"
import fs from "fs"
import path from "path"
import { randomUUID } from "crypto"

const execAsync = promisify(exec)

// Production download endpoint using yt-dlp
export async function POST(request: NextRequest) {
  let tempDir: string | null = null
  let outputPath: string | null = null

  try {
    const { url, format, removeWatermark, audioOnly } = await request.json()

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 })
    }

    // Validate URL
    if (!isValidUrl(url)) {
      return NextResponse.json({ error: "Invalid or unsupported URL" }, { status: 400 })
    }

    // Create temporary directory
    const tempId = randomUUID()
    tempDir = path.join(process.cwd(), "temp", tempId)

    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true })
    }

    // Build yt-dlp command with proper output template
    const command = buildYtDlpCommand(url, tempDir, format, audioOnly, removeWatermark)

    console.log("Executing command:", command)

    // Execute download with progressive timeout and quality fallback
    let downloadResult
    try {
      downloadResult = await Promise.race([
        execAsync(command, {
          maxBuffer: 1024 * 1024 * 500, // 500MB buffer
          timeout: 180000, // 3 minutes timeout
          cwd: tempDir
        }),
        new Promise<never>((_, reject) => setTimeout(() => reject(new Error("Download timeout")), 180000)),
      ])
    } catch (error) {
      // If timeout or size error, try with lower quality
      if (error instanceof Error && (error.message.includes("timeout") || error.message.includes("maxBuffer"))) {
        console.log("First attempt failed, trying with lower quality...")
        const fallbackCommand = buildFallbackCommand(url, audioOnly)
        
        downloadResult = await Promise.race([
          execAsync(fallbackCommand, {
            maxBuffer: 1024 * 1024 * 100, // 100MB buffer
            timeout: 120000, // 2 minutes timeout
            cwd: tempDir
          }),
          new Promise<never>((_, reject) => setTimeout(() => reject(new Error("Download timeout on fallback")), 120000)),
        ])
      } else {
        throw error
      }
    }

    const { stdout, stderr } = downloadResult

    console.log("yt-dlp stdout:", stdout)
    if (stderr) console.log("yt-dlp stderr:", stderr)

    // Find the downloaded file
    const files = fs.readdirSync(tempDir)
    const downloadedFile = files.find(file => 
      file.endsWith('.mp4') || 
      file.endsWith('.mp3') || 
      file.endsWith('.webm') || 
      file.endsWith('.mkv')
    )

    if (!downloadedFile) {
      throw new Error("Download failed - no output file found")
    }

    outputPath = path.join(tempDir, downloadedFile)

    // Get file stats
    const stats = fs.statSync(outputPath)
    if (stats.size === 0) {
      throw new Error("Download failed - empty file")
    }

    // Read file
    const fileBuffer = fs.readFileSync(outputPath)

    // Determine content type and filename
    const isAudio = downloadedFile.endsWith('.mp3')
    const contentType = isAudio ? "audio/mpeg" : "video/mp4"
    const fileExtension = isAudio ? ".mp3" : ".mp4"
    const fileName = `download_${Date.now()}${fileExtension}`

    // Set appropriate headers
    const headers = new Headers()
    headers.set("Content-Type", contentType)
    headers.set("Content-Disposition", `attachment; filename="${fileName}"`)
    headers.set("Content-Length", stats.size.toString())

    return new NextResponse(fileBuffer, { headers })
  } catch (error) {
    console.error("Download error:", error)

    // Return appropriate error message
    const errorMessage = getErrorMessage(error)
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  } finally {
    // Cleanup temporary files
    if (tempDir && fs.existsSync(tempDir)) {
      try {
        fs.rmSync(tempDir, { recursive: true, force: true })
      } catch (cleanupError) {
        console.error("Temp dir cleanup error:", cleanupError)
      }
    }
  }
}

function buildYtDlpCommand(
  url: string,
  outputDir: string,
  format: string,
  audioOnly: boolean,
  removeWatermark: boolean,
): string {
  // Use output template instead of specific path
  const outputTemplate = audioOnly ? 
    "%(title).50s.%(ext)s" : 
    "%(title).50s.%(ext)s"

  let command = `yt-dlp "${url}" -o "${outputTemplate}"`

  if (audioOnly) {
    // Extract audio with reasonable quality
    command += " --extract-audio --audio-format mp3 --audio-quality 192K"
    // Best audio quality format selection
    command += ' --format "bestaudio[abr<=320]/bestaudio/best"'
  } else {
    // Video download with smart quality selection
    if (format && format !== "best") {
      const quality = format.split("-")[1] || "720p"
      const height = quality.replace("p", "")
      
      // Format selection with size limits
      command += ` --format "best[height<=${height}][filesize<200M]/best[height<=${height}][filesize<100M]/best[height<=${height}]/best[filesize<100M]/worst"`
    } else {
      // Smart quality selection - prioritize reasonable file sizes
      command += ' --format "best[height<=1080][filesize<200M]/best[height<=720][filesize<100M]/best[filesize<100M]/best[height<=720]/worst"'
    }

    // Post-processing to ensure reasonable file size
    command += " --merge-output-format mp4"
  }

  // Platform-specific optimizations
  if (url.includes("tiktok.com")) {
    if (removeWatermark) {
      command += ' --extractor-args "tiktok:watermark=false"'
    }
    // TikTok videos are usually small, use best quality
    command = command.replace(/\[filesize<[^\]]+\]/g, '')
  }

  if (url.includes("youtube.com") || url.includes("youtu.be")) {
    command += " --no-warnings --no-playlist"
    // Use faster extraction for YouTube
    command += " --extractor-args 'youtube:player_client=web'"
  }

  if (url.includes("instagram.com")) {
    command += " --no-warnings"
  }

  // General optimizations for speed
  command += " --no-check-certificate --prefer-ffmpeg"
  
  // Faster connection settings
  command += " --socket-timeout 30 --retries 2 --fragment-retries 2"
  command += " --concurrent-fragments 3"
  
  // Skip unnecessary features for speed
  command += " --no-write-description --no-write-info-json"
  command += " --no-write-comments --no-embed-subs"

  return command
}

function buildFallbackCommand(url: string, audioOnly: boolean): string {
  const outputTemplate = audioOnly ? 
    "%(title).30s.%(ext)s" : 
    "%(title).30s.%(ext)s"

  let command = `yt-dlp "${url}" -o "${outputTemplate}"`

  if (audioOnly) {
    // Low quality audio for speed
    command += " --extract-audio --audio-format mp3 --audio-quality 128K"
    command += ' --format "worst[abr<=128]/worstaudio"'
  } else {
    // Low quality video for speed
    command += ' --format "worst[height<=480][filesize<50M]/worst[ext=mp4]/worst"'
    command += " --merge-output-format mp4"
  }

  // Speed optimizations
  command += " --no-check-certificate --socket-timeout 20 --retries 1"
  command += " --no-write-description --no-write-info-json --no-embed-subs"

  return command
}

function isValidUrl(url: string): boolean {
  const supportedDomains = [
    "tiktok.com",
    "youtube.com",
    "youtu.be",
    "facebook.com",
    "fb.watch",
    "instagram.com",
    "twitter.com",
    "x.com",
    "vimeo.com",
    "dailymotion.com",
    "twitch.tv",
    "reddit.com",
    "streamable.com"
  ]

  try {
    const urlObj = new URL(url)
    return supportedDomains.some((domain) => urlObj.hostname.includes(domain))
  } catch {
    return false
  }
}

function getErrorMessage(error: any): string {
  const errorStr = error?.message || error?.toString() || "Unknown error"

  if (errorStr.includes("timeout")) {
    return "Download timeout - the video may be too large or the server is busy. Try a lower quality format."
  }

  if (errorStr.includes("private") || errorStr.includes("unavailable")) {
    return "Video is private or unavailable"
  }

  if (errorStr.includes("geo") || errorStr.includes("not available in your country")) {
    return "Video is not available in your region"
  }

  if (errorStr.includes("copyright")) {
    return "Video is protected by copyright"
  }

  if (errorStr.includes("age")) {
    return "Age-restricted content cannot be downloaded"
  }

  if (errorStr.includes("live")) {
    return "Live streams cannot be downloaded"
  }

  if (errorStr.includes("Premium")) {
    return "This video requires a premium subscription"
  }

  if (errorStr.includes("format") || errorStr.includes("No video formats")) {
    return "No suitable video format found. The video may be unavailable or region-locked."
  }

  if (errorStr.includes("HTTP Error 403") || errorStr.includes("Forbidden")) {
    return "Access forbidden - the video may be region-locked or require authentication"
  }

  if (errorStr.includes("HTTP Error 404")) {
    return "Video not found - the URL may be incorrect or the video may have been deleted"
  }

  // Log the actual error for debugging
  console.error("Unhandled error:", errorStr)
  
  return "Download failed - please check the URL and try again. If the issue persists, the video may not be publicly accessible."
}

// Health check endpoint
export async function GET() {
  try {
    // Check if yt-dlp is installed and get version
    const { stdout } = await execAsync("yt-dlp --version")
    return NextResponse.json({ 
      status: "ok", 
      message: "yt-dlp is available",
      version: stdout.trim()
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        message: "yt-dlp not found - please install it first",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 },
    )
  }
}