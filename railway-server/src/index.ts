import express from 'express'
import cors from 'cors'
import { exec } from 'child_process'
import { promisify } from 'util'
import fs from 'fs'
import path from 'path'
import { randomUUID } from 'crypto'

const execAsync = promisify(exec)
const app = express()
const port = process.env.PORT || 3001

// Middleware
app.use(cors())
app.use(express.json())

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    const { stdout } = await execAsync('yt-dlp --version')
    res.json({ 
      status: 'ok', 
      message: 'yt-dlp is available',
      version: stdout.trim()
    })
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'yt-dlp not found',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// Analyze endpoint
app.post('/api/analyze', async (req, res) => {
  const { url } = req.body

  if (!url) {
    return res.status(400).json({ error: 'URL is required' })
  }

  try {
    const { stdout } = await execAsync(`yt-dlp "${url}" --dump-json`)
    const videoInfo = JSON.parse(stdout)
    
    res.json({
      title: videoInfo.title,
      thumbnail: videoInfo.thumbnail,
      duration: videoInfo.duration_string,
      platform: videoInfo.extractor,
      formats: videoInfo.formats.map((format: any) => ({
        quality: format.height ? `${format.height}p` : format.format_note,
        format: format.ext,
        size: format.filesize ? `${(format.filesize / (1024 * 1024)).toFixed(1)}MB` : 'Unknown'
      }))
    })
  } catch (error) {
    console.error('Analysis error:', error)
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Failed to analyze video'
    })
  }
})

// Download endpoint
app.post('/api/download', async (req, res) => {
  const { url, format, removeWatermark, audioOnly } = req.body
  let tempDir: string | null = null

  if (!url) {
    return res.status(400).json({ error: 'URL is required' })
  }

  try {
    // Create temporary directory
    const tempId = randomUUID()
    tempDir = path.join(process.cwd(), 'temp', tempId)
    fs.mkdirSync(tempDir, { recursive: true })

    // Build command
    const outputTemplate = audioOnly ? 
      "%(title).50s.%(ext)s" : 
      "%(title).50s.%(ext)s"

    let command = `yt-dlp "${url}" -o "${outputTemplate}"`

    if (audioOnly) {
      command += " --extract-audio --audio-format mp3 --audio-quality 192K"
      command += ' --format "bestaudio[abr<=320]/bestaudio/best"'
    } else {
      if (format && format !== "best") {
        const quality = format.split("-")[1] || "720p"
        const height = quality.replace("p", "")
        command += ` --format "best[height<=${height}][filesize<200M]/best[height<=${height}][filesize<100M]/best[height<=${height}]/best[filesize<100M]/worst"`
      } else {
        command += ' --format "best[height<=1080][filesize<200M]/best[height<=720][filesize<100M]/best[filesize<100M]/best[height<=720]/worst"'
      }
      command += " --merge-output-format mp4"
    }

    // Platform-specific optimizations
    if (url.includes("tiktok.com") && removeWatermark) {
      command += ' --extractor-args "tiktok:watermark=false"'
    }

    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      command += " --no-warnings --no-playlist"
      command += " --extractor-args 'youtube:player_client=web'"
    }

    // General optimizations
    command += " --no-check-certificate --prefer-ffmpeg"
    command += " --socket-timeout 30 --retries 2 --fragment-retries 2"
    command += " --concurrent-fragments 3"
    command += " --no-write-description --no-write-info-json"
    command += " --no-write-comments --no-embed-subs"

    console.log('Executing command:', command)

    // Execute download
    const { stdout, stderr } = await execAsync(command, {
      cwd: tempDir,
      maxBuffer: 1024 * 1024 * 500 // 500MB buffer
    })

    console.log('yt-dlp stdout:', stdout)
    if (stderr) console.log('yt-dlp stderr:', stderr)

    // Find the downloaded file
    const files = fs.readdirSync(tempDir)
    const downloadedFile = files.find(file => 
      file.endsWith('.mp4') || 
      file.endsWith('.mp3') || 
      file.endsWith('.webm') || 
      file.endsWith('.mkv')
    )

    if (!downloadedFile) {
      throw new Error('Download failed - no output file found')
    }

    const filePath = path.join(tempDir, downloadedFile)
    const stats = fs.statSync(filePath)
    const fileBuffer = fs.readFileSync(filePath)

    // Set appropriate headers
    const isAudio = downloadedFile.endsWith('.mp3')
    const contentType = isAudio ? 'audio/mpeg' : 'video/mp4'
    const fileExtension = isAudio ? '.mp3' : '.mp4'
    const fileName = `download_${Date.now()}${fileExtension}`

    res.setHeader('Content-Type', contentType)
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`)
    res.setHeader('Content-Length', stats.size.toString())
    res.send(fileBuffer)

  } catch (error) {
    console.error('Download error:', error)
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Download failed'
    })
  } finally {
    // Cleanup
    if (tempDir && fs.existsSync(tempDir)) {
      try {
        fs.rmSync(tempDir, { recursive: true, force: true })
      } catch (cleanupError) {
        console.error('Cleanup error:', cleanupError)
      }
    }
  }
})

app.listen(port, () => {
  console.log(`Railway server running on port ${port}`)
}) 