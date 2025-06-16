# VidZappr - Production Video Downloader

A production-ready video downloader built with Next.js and yt-dlp that supports downloading from TikTok, YouTube, Facebook, Instagram, and more.

## Features

- 🎥 Download videos from 10+ platforms
- 🎵 Extract audio in MP3 format
- 💧 Remove TikTok watermarks
- 📱 Mobile-responsive design
- 🔒 Privacy-focused (no data storage)
- ⚡ Fast processing with yt-dlp
- 🎨 Beautiful dark theme UI

## Prerequisites

Before running this application, you need to install:

1. **Node.js** (v18 or higher)
2. **Python 3** with pip
3. **yt-dlp**: `pip3 install yt-dlp`
4. **ffmpeg**: Required for video processing
   - macOS: `brew install ffmpeg`
   - Ubuntu: `sudo apt install ffmpeg`
   - Windows: Download from [ffmpeg.org](https://ffmpeg.org/download.html)

## Quick Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Run setup script: `npm run setup`
4. Start development server: `npm run dev`

## Production Deployment

### Using Docker

\`\`\`bash
# Build the Docker image
docker build -t vidzappr .

# Run the container
docker run -p 3000:3000 vidzappr
\`\`\`

### Manual Deployment

\`\`\`bash
# Install dependencies
npm ci --only=production

# Build the application
npm run build

# Start the production server
npm start
\`\`\`

## Environment Variables

Create a `.env.local` file:

\`\`\`env
# Optional: Set custom temp directory
TEMP_DIR=/tmp/vidzappr

# Optional: Set max file size (in bytes)
MAX_FILE_SIZE=104857600

# Optional: Set download timeout (in milliseconds)
DOWNLOAD_TIMEOUT=300000
\`\`\`

## API Endpoints

### POST /api/analyze
Analyzes a video URL and returns metadata.

\`\`\`json
{
  "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
}
\`\`\`

### POST /api/download
Downloads a video with specified options.

\`\`\`json
{
  "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  "format": "mp4-720p",
  "audioOnly": false,
  "removeWatermark": false
}
\`\`\`

### GET /api/download
Health check endpoint to verify yt-dlp installation.

## Supported Platforms

- ✅ YouTube
- ✅ TikTok (with watermark removal)
- ✅ Facebook
- ✅ Instagram
- ✅ Twitter/X
- ✅ Vimeo
- ✅ Dailymotion
- ✅ Twitch

## Legal Notice

This tool is for educational purposes only. Users are responsible for:
- Respecting copyright laws
- Following platform terms of service
- Only downloading content they own or have permission to use

## Troubleshooting

### yt-dlp not found
\`\`\`bash
pip3 install yt-dlp
# or
python -m pip install yt-dlp
\`\`\`

### ffmpeg not found
- **macOS**: `brew install ffmpeg`
- **Ubuntu**: `sudo apt install ffmpeg`
- **Windows**: Download from [ffmpeg.org](https://ffmpeg.org/download.html)

### Permission errors
Make sure the temp directory is writable:
\`\`\`bash
chmod 755 temp/
\`\`\`

### Download failures
- Check if the video is public and accessible
- Verify the URL is correct
- Some platforms may block automated downloads

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
