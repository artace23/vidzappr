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
import { API_ENDPOINTS } from "@/lib/railway-config"

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
        handleAnalyze()
      }
    }, 1000)

    return () => clearTimeout(timer)
  }, [url])

  const handleAnalyze = async () => {
    if (!url) {
      toast({
        title: "Error",
        description: "Please enter a URL",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      console.log('RAILWAY_API_URL:', process.env.NEXT_PUBLIC_RAILWAY_API_URL);
      const response = await fetch(API_ENDPOINTS.analyze, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to analyze video")
      }

      const data = await response.json()
      setVideoInfo(data)
    } catch (error) {
      console.error("Analysis error:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to analyze video",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownload = async () => {
    if (!url) {
      toast({
        title: "Error",
        description: "Please enter a URL",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(API_ENDPOINTS.download, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url,
          format: selectedFormat,
          removeWatermark,
          audioOnly,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Download failed")
      }

      // Get the filename from the Content-Disposition header
      const contentDisposition = response.headers.get("Content-Disposition")
      const filename = contentDisposition
        ? contentDisposition.split("filename=")[1].replace(/"/g, "")
        : `download_${Date.now()}.${audioOnly ? "mp3" : "mp4"}`

      // Create a blob from the response
      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)

      // Create a temporary link and trigger the download
      const link = document.createElement("a")
      link.href = downloadUrl
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(downloadUrl)

      toast({
        title: "Success",
        description: "Download started",
      })
    } catch (error) {
      console.error("Download error:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Download failed",
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
    <section className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-4xl text-center">
        <div className="mb-8 sm:mb-12">
          <Badge className="mb-4 bg-blue-900/30 text-blue-300 border-blue-800 hover:bg-blue-900/40">
            <Zap className="mr-1 h-3 w-3" />
            Lightning Fast Downloads
          </Badge>
          <h1 className="text-3xl sm:text-5xl font-bold mb-4 sm:mb-6 text-white">
            Download Videos from Any Platform
          </h1>
          <p className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto">
            Fast, free, and secure video downloads from YouTube, TikTok, Instagram, and more
          </p>
        </div>

        <Card className="mb-8 sm:mb-12 enhanced-card enhanced-shadow">
          <CardContent className="p-4 sm:p-8">
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1">
                <Input
                  type="url"
                  placeholder="Paste your video URL here (TikTok, YouTube, Facebook...)"
                  value={url}
                  onChange={handleUrlChange}
                  className="h-12 text-base sm:text-lg dark-input"
                />
              </div>
              <Button
                onClick={videoInfo ? handleDownload : handleAnalyze}
                disabled={!url || isLoading}
                className="h-12 px-4 sm:px-8 gradient-button whitespace-nowrap"
              >
                {isLoading ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span className="hidden sm:inline">{videoInfo ? "Downloading..." : "Analyzing..."}</span>
                    <span className="sm:hidden">{videoInfo ? "↓" : "✓"}</span>
                  </>
                ) : videoInfo ? (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    <span className="hidden sm:inline">Download</span>
                    <span className="sm:hidden">↓</span>
                  </>
                ) : (
                  <>
                    <Zap className="mr-2 h-4 w-4" />
                    <span className="hidden sm:inline">Analyze</span>
                    <span className="sm:hidden">✓</span>
                  </>
                )}
              </Button>
            </div>

            {videoInfo && (
              <div className="space-y-4 sm:space-y-6">
                <VideoPreview videoInfo={videoInfo} />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

                  <div className="space-y-4">
                    {videoInfo.platform === "tiktok" && (
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="removeWatermark"
                          checked={removeWatermark}
                          onCheckedChange={(checked) => setRemoveWatermark(checked as boolean)}
                        />
                        <label
                          htmlFor="removeWatermark"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-300"
                        >
                          Remove Watermark
                        </label>
                      </div>
                    )}

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="audioOnly"
                        checked={audioOnly}
                        onCheckedChange={(checked) => setAudioOnly(checked as boolean)}
                      />
                      <label
                        htmlFor="audioOnly"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-300"
                      >
                        Audio Only (MP3)
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}
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
