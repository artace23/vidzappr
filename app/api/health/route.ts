import { NextResponse } from "next/server"
import { exec } from "child_process"
import { promisify } from "util"

const execAsync = promisify(exec)

export async function GET() {
  try {
    // Check if yt-dlp is installed and accessible
    const { stdout: version } = await execAsync("yt-dlp --version")
    
    // Check if ffmpeg is installed
    const { stdout: ffmpegVersion } = await execAsync("ffmpeg -version")
    
    return NextResponse.json({
      status: "ok",
      ytDlpVersion: version.trim(),
      ffmpegAvailable: true,
      ffmpegVersion: ffmpegVersion.split("\n")[0],
    })
  } catch (error: any) {
    console.error("Health check error:", error)
    return NextResponse.json({
      status: "error",
      message: error.message,
      code: error.code,
    }, { status: 500 })
  }
} 