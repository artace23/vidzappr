const { exec } = require("child_process")
const fs = require("fs")
const path = require("path")

console.log("🚀 Setting up VidZappr for production...\n")

// Check if yt-dlp is installed
function checkYtDlp() {
  return new Promise((resolve) => {
    exec("yt-dlp --version", (error, stdout) => {
      if (error) {
        console.log("❌ yt-dlp not found")
        console.log("📦 Installing yt-dlp...")

        // Try to install yt-dlp
        exec("pip3 install yt-dlp", (installError, installStdout) => {
          if (installError) {
            console.log("❌ Failed to install yt-dlp automatically")
            console.log("Please install yt-dlp manually:")
            console.log("  pip3 install yt-dlp")
            console.log("  or visit: https://github.com/yt-dlp/yt-dlp#installation")
            resolve(false)
          } else {
            console.log("✅ yt-dlp installed successfully")
            resolve(true)
          }
        })
      } else {
        console.log(`✅ yt-dlp found: ${stdout.trim()}`)
        resolve(true)
      }
    })
  })
}

// Check if ffmpeg is installed
function checkFFmpeg() {
  return new Promise((resolve) => {
    exec("ffmpeg -version", (error, stdout) => {
      if (error) {
        console.log("❌ ffmpeg not found")
        console.log("Please install ffmpeg:")
        console.log("  macOS: brew install ffmpeg")
        console.log("  Ubuntu: sudo apt install ffmpeg")
        console.log("  Windows: Download from https://ffmpeg.org/download.html")
        resolve(false)
      } else {
        console.log("✅ ffmpeg found")
        resolve(true)
      }
    })
  })
}

// Create necessary directories
function createDirectories() {
  const tempDir = path.join(process.cwd(), "temp")
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true })
    console.log("✅ Created temp directory")
  } else {
    console.log("✅ Temp directory exists")
  }
}

// Main setup function
async function setup() {
  try {
    const ytDlpOk = await checkYtDlp()
    const ffmpegOk = await checkFFmpeg()

    createDirectories()

    console.log("\n📋 Setup Summary:")
    console.log(`yt-dlp: ${ytDlpOk ? "✅" : "❌"}`)
    console.log(`ffmpeg: ${ffmpegOk ? "✅" : "❌"}`)
    console.log(`temp directory: ✅`)

    if (ytDlpOk && ffmpegOk) {
      console.log("\n🎉 Setup complete! You can now run:")
      console.log("  npm run dev (for development)")
      console.log("  npm run build && npm start (for production)")
    } else {
      console.log("\n⚠️  Please install missing dependencies before running the app")
    }
  } catch (error) {
    console.error("❌ Setup failed:", error)
  }
}

setup()
