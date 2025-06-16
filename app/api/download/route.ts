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

    // Determine file extension and output path
    const fileExtension = audioOnly ? "mp3" : "mp4"
    const fileName = `download_${Date.now()}.${fileExtension}`
    outputPath = path.join(tempDir, fileName)

    // Build yt-dlp command
    const command = buildYtDlpCommand(url, outputPath, format, audioOnly, removeWatermark)

    console.log("Executing command:", command)

    // Execute download with timeout (5 minutes max)
    const { stdout, stderr } = await Promise.race([
      execAsync(command, {
        maxBuffer: 1024 * 1024 * 100, // 100MB buffer
        timeout: 300000, // 5 minutes timeout
      }),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error("Download timeout")), 300000)),
    ])

    console.log("yt-dlp stdout:", stdout)
    if (stderr) console.log("yt-dlp stderr:", stderr)

    // Check if file was created
    if (!fs.existsSync(outputPath)) {
      throw new Error("Download failed - file not created")
    }

    // Get file stats
    const stats = fs.statSync(outputPath)
    if (stats.size === 0) {
      throw new Error("Download failed - empty file")
    }

    // Read file
    const fileBuffer = fs.readFileSync(outputPath)

    // Set appropriate headers
    const headers = new Headers()
    headers.set("Content-Type", audioOnly ? "audio/mpeg" : "video/mp4")
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
    if (outputPath && fs.existsSync(outputPath)) {
      try {
        fs.unlinkSync(outputPath)
      } catch (cleanupError) {
        console.error("Cleanup error:", cleanupError)
      }
    }

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
  outputPath: string,
  format: string,
  audioOnly: boolean,
  removeWatermark: boolean,
): string {
  let command = `yt-dlp "${url}" -o "${outputPath}"`

  if (audioOnly) {
    // Extract audio only
    command += " --extract-audio --audio-format mp3 --audio-quality 0"
  } else {
    // Video download with quality selection
    const quality = format.split("-")[1] || "720p"
    const height = quality.replace("p", "")

    // Format selection for best quality within height limit
    command += ` --format "best[height<=${height}][ext=mp4]/best[height<=${height}]/best[ext=mp4]/best"`

    // Ensure mp4 output
    command += " --merge-output-format mp4"
  }

  // Platform-specific optimizations
  if (url.includes("tiktok.com")) {
    if (removeWatermark) {
      // Use specific extractors that can remove watermarks
      command += ' --extractor-args "tiktok:watermark=false"'
    }
  }

  if (url.includes("youtube.com") || url.includes("youtu.be")) {
    // YouTube-specific optimizations
    command += " --no-warnings --no-playlist"
  }

  if (url.includes("instagram.com")) {
    // Instagram-specific settings
    command += " --no-warnings"
  }

  // General optimizations
  command += " --no-check-certificate --prefer-ffmpeg --ffmpeg-location /usr/bin/ffmpeg"
  command += " --socket-timeout 30 --retries 3"

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
    return "Download timeout - the video may be too large or the server is busy"
  }

  if (errorStr.includes("private") || errorStr.includes("unavailable")) {
    return "Video is private or unavailable"
  }

  if (errorStr.includes("geo")) {
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

  return "Download failed - please check the URL and try again"
}

// Health check endpoint
export async function GET() {
  try {
    // Check if yt-dlp is installed
    await execAsync("yt-dlp --version")
    return NextResponse.json({ status: "ok", message: "yt-dlp is available" })
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        message: "yt-dlp not found - please install it first",
      },
      { status: 500 },
    )
  }
}
