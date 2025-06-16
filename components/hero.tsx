"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Download, Link, Zap, Shield, Clock, AlertTriangle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { VideoPreview } from "@/components/video-preview"

interface VideoInfo {
  title: string
  thumbnail: string
  duration: string
  platform: string
  formats: Array<{
    quality: string
    format: string
    size: string
  }>
}

export function Hero() {
  const [url, setUrl] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null)
  const [selectedFormat, setSelectedFormat] = useState("mp4-720p")
  const [removeWatermark, setRemoveWatermark] = useState(true)
  const [audioOnly, setAudioOnly] = useState(false)
  const { toast } = useToast()

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = e.target.value
    setUrl(newUrl)
    setVideoInfo(null) // Reset video info immediately when URL changes
    
    if (newUrl && isValidUrl(newUrl)) {
      toast({
        title: "Analyzing...",
        description: "Please wait while we analyze your video",
      })
    }
  }

  // Add URL change handler
  useEffect(() => {
    const timer = setTimeout(() => {
      if (url && isValidUrl(url)) {
        analyzeVideo()
      }
    }, 1000)

    return () => clearTimeout(timer)
  }, [url])

  const analyzeVideo = async () => {
    if (!url) {
      toast({
        title: "Error",
        description: "Please enter a video URL",
        variant: "destructive",
      })
      return
    }

    if (!isValidUrl(url)) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid video URL from supported platforms",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      })

      if (!response.ok) {
        throw new Error("Failed to analyze video")
      }

      const data = await response.json()
      setVideoInfo(data)
      toast({
        title: "Video analyzed!",
        description: "Choose your download options below",
      })
    } catch (error) {
      toast({
        title: "Analysis failed",
        description: "Could not analyze the video. Please check the URL and try again.",
        variant: "destructive",
      })
      setVideoInfo(null)
    } finally {
      setIsLoading(false)
    }
  }

  const downloadVideo = async () => {
    if (!videoInfo) {
      await analyzeVideo()
      if (!videoInfo) return // If analysis failed, don't proceed with download
    }

    setIsLoading(true)
    try {
      const response = await fetch("/api/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url,
          format: selectedFormat,
          removeWatermark: removeWatermark && videoInfo.platform === "tiktok",
          audioOnly,
        }),
      })

      if (!response.ok) {
        throw new Error("Download failed")
      }

      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = downloadUrl
      a.download = `${videoInfo.title}.${audioOnly ? "mp3" : "mp4"}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(downloadUrl)
      document.body.removeChild(a)

      toast({
        title: "Download complete!",
        description: "Your video has been downloaded successfully",
      })
    } catch (error) {
      toast({
        title: "Download failed",
        description: "Could not download the video. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const isValidUrl = (url: string) => {
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
    ]
    return supportedDomains.some((domain) => url.includes(domain))
  }

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-4xl text-center">
        <div className="mb-8">
          <Badge className="mb-4 bg-blue-900/30 text-blue-300 border-blue-800 hover:bg-blue-900/40">
            <Zap className="mr-1 h-3 w-3" />
            Lightning Fast Downloads
          </Badge>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 text-white">
            Download Videos from{" "}
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Any Platform
            </span>
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Free, fast, and secure video downloader for TikTok, YouTube, and Facebook. No watermarks, multiple formats,
            and complete privacy protection.
          </p>
        </div>

        <Card className="mb-12 enhanced-card enhanced-shadow">
          <CardContent className="p-8">
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1">
                <Input
                  type="url"
                  placeholder="Paste your video URL here (TikTok, YouTube, Facebook...)"
                  value={url}
                  onChange={handleUrlChange}
                  className="h-12 text-lg dark-input"
                />
              </div>
              <Button
                onClick={videoInfo ? downloadVideo : analyzeVideo}
                disabled={!url || isLoading}
                className="h-12 px-8 gradient-button"
              >
                {isLoading ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    {videoInfo ? "Downloading..." : "Analyzing..."}
                  </>
                ) : videoInfo ? (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </>
                ) : (
                  <>
                    <Zap className="mr-2 h-4 w-4" />
                    Analyze
                  </>
                )}
              </Button>
            </div>

            {videoInfo && (
              <div className="space-y-6">
                <VideoPreview videoInfo={videoInfo} />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-300">Format & Quality</label>
                    <Select value={selectedFormat} onValueChange={setSelectedFormat}>
                      <SelectTrigger className="dark-input">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        {videoInfo.formats.map((format) => (
                          <SelectItem
                            key={`${format.format}-${format.quality}`}
                            value={`${format.format}-${format.quality}`}
                            className="text-gray-200 hover:bg-slate-700"
                          >
                            {format.quality} ({format.format.toUpperCase()}) - {format.size}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="audio-only" checked={audioOnly} onCheckedChange={setAudioOnly} />
                      <label htmlFor="audio-only" className="text-sm font-medium text-gray-300">
                        Audio only (MP3)
                      </label>
                    </div>

                    {videoInfo.platform === "tiktok" && (
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="remove-watermark"
                          checked={removeWatermark}
                          onCheckedChange={setRemoveWatermark}
                        />
                        <label htmlFor="remove-watermark" className="text-sm font-medium text-gray-300">
                          Remove TikTok watermark
                        </label>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-yellow-900/20 border border-yellow-800 rounded-lg p-4">
                  <div className="flex items-start space-x-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-400 mt-0.5" />
                    <div className="text-sm text-yellow-200">
                      <strong>Legal Notice:</strong> Only download content you own or have permission to use. Respect
                      copyright laws and platform terms of service.
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-400 mt-6">
              <div className="flex items-center bg-green-900/20 px-3 py-1 rounded-full border border-green-800">
                <Shield className="mr-1 h-4 w-4 text-green-400" />
                100% Free
              </div>
              <div className="flex items-center bg-blue-900/20 px-3 py-1 rounded-full border border-blue-800">
                <Clock className="mr-1 h-4 w-4 text-blue-400" />
                Super Fast
              </div>
              <div className="flex items-center bg-purple-900/20 px-3 py-1 rounded-full border border-purple-800">
                <Link className="mr-1 h-4 w-4 text-purple-400" />
                No Registration
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
          <div className="p-6 rounded-lg bg-slate-800/50 backdrop-blur-sm border border-slate-700">
            <div className="text-3xl font-bold text-blue-400 mb-2">10M+</div>
            <div className="text-gray-400">Videos Downloaded</div>
          </div>
          <div className="p-6 rounded-lg bg-slate-800/50 backdrop-blur-sm border border-slate-700">
            <div className="text-3xl font-bold text-purple-400 mb-2">{"<5s"}</div>
            <div className="text-gray-400">Average Process Time</div>
          </div>
          <div className="p-6 rounded-lg bg-slate-800/50 backdrop-blur-sm border border-slate-700">
            <div className="text-3xl font-bold text-green-400 mb-2">100%</div>
            <div className="text-gray-400">Privacy Protected</div>
          </div>
        </div>
      </div>
    </section>
  )
}
