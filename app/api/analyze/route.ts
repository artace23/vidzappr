import { type NextRequest, NextResponse } from "next/server"
import { exec } from "child_process"
import { promisify } from "util"

const execAsync = promisify(exec)

// Production video analysis using yt-dlp
export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 })
    }

    if (!isValidUrl(url)) {
      return NextResponse.json({ error: "Invalid or unsupported URL" }, { status: 400 })
    }

    // Use yt-dlp to extract video information
    const command = `yt-dlp --dump-json --no-download "${url}"`

    console.log("Analyzing video:", url)

    const { stdout, stderr } = await Promise.race([
      execAsync(command, {
        maxBuffer: 1024 * 1024 * 10, // 10MB buffer
        timeout: 30000, // 30 seconds timeout
      }),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error("Analysis timeout")), 30000)),
    ])

    if (stderr && !stdout) {
      throw new Error(`yt-dlp error: ${stderr}`)
    }

    // Parse JSON output from yt-dlp
    const videoData = JSON.parse(stdout)

    // Extract relevant information
    const videoInfo = {
      title: videoData.title || "Unknown Title",
      thumbnail: videoData.thumbnail || generateFallbackThumbnail(url),
      duration: formatDuration(videoData.duration),
      platform: detectPlatform(url),
      formats: extractFormats(videoData.formats || []),
      uploader: videoData.uploader || "Unknown",
      view_count: videoData.view_count || 0,
      upload_date: videoData.upload_date || null,
      description: videoData.description?.substring(0, 200) || "",
    }

    return NextResponse.json(videoInfo)
  } catch (error) {
    console.error("Analysis error:", error)

    const errorMessage = getAnalysisErrorMessage(error)
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

function extractFormats(formats: any[]): Array<{ quality: string; format: string; size: string }> {
  const processedFormats: Array<{ quality: string; format: string; size: string }> = []

  // Group formats by quality
  const qualityMap = new Map()

  formats.forEach((format) => {
    if (!format.height) return

    const quality = `${format.height}p`
    const filesize = format.filesize || format.filesize_approx || 0
    const ext = format.ext || "mp4"

    if (!qualityMap.has(quality) || (filesize > 0 && qualityMap.get(quality).filesize < filesize)) {
      qualityMap.set(quality, {
        quality,
        format: ext,
        size: formatFileSize(filesize),
        filesize,
      })
    }
  })

  // Convert to array and sort by quality (highest first)
  const sortedFormats = Array.from(qualityMap.values())
    .sort((a, b) => Number.parseInt(b.quality) - Number.parseInt(a.quality))
    .map(({ quality, format, size }) => ({ quality, format, size }))

  // Add audio-only option
  sortedFormats.push({
    quality: "Audio",
    format: "mp3",
    size: "~3-5 MB",
  })

  return sortedFormats.length > 0
    ? sortedFormats
    : [
        { quality: "1080p", format: "mp4", size: "~50 MB" },
        { quality: "720p", format: "mp4", size: "~30 MB" },
        { quality: "480p", format: "mp4", size: "~20 MB" },
        { quality: "Audio", format: "mp3", size: "~3 MB" },
      ]
}

function formatDuration(seconds: number | null): string {
  if (!seconds) return "Unknown"

  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }
  return `${minutes}:${secs.toString().padStart(2, "0")}`
}

function formatFileSize(bytes: number): string {
  if (!bytes || bytes === 0) return "Unknown"

  const sizes = ["B", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`
}

function detectPlatform(url: string): string {
  if (url.includes("tiktok.com")) return "tiktok"
  if (url.includes("youtube.com") || url.includes("youtu.be")) return "youtube"
  if (url.includes("facebook.com") || url.includes("fb.watch")) return "facebook"
  if (url.includes("instagram.com")) return "instagram"
  if (url.includes("twitter.com") || url.includes("x.com")) return "twitter"
  if (url.includes("vimeo.com")) return "vimeo"
  if (url.includes("dailymotion.com")) return "dailymotion"
  if (url.includes("twitch.tv")) return "twitch"
  return "unknown"
}

function generateFallbackThumbnail(url: string): string {
  const platform = detectPlatform(url)
  const thumbnails = {
    tiktok: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=320&h=180&fit=crop",
    youtube: "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=320&h=180&fit=crop",
    facebook: "https://images.unsplash.com/photo-1611162618071-b39a2ec055fb?w=320&h=180&fit=crop",
    instagram: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=320&h=180&fit=crop",
    twitter: "https://images.unsplash.com/photo-1611162618479-ee3d24aaef0b?w=320&h=180&fit=crop",
    vimeo: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=320&h=180&fit=crop",
  }
  return thumbnails[platform as keyof typeof thumbnails] || thumbnails.youtube
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

function getAnalysisErrorMessage(error: any): string {
  const errorStr = error?.message || error?.toString() || "Unknown error"

  if (errorStr.includes("timeout")) {
    return "Analysis timeout - please try again"
  }

  if (errorStr.includes("private") || errorStr.includes("unavailable")) {
    return "Video is private or unavailable"
  }

  if (errorStr.includes("geo")) {
    return "Video is not available in your region"
  }

  if (errorStr.includes("age")) {
    return "Age-restricted content cannot be analyzed"
  }

  return "Failed to analyze video - please check the URL"
}
