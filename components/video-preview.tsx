"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, Eye, Play, Droplets } from "lucide-react"

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

interface VideoPreviewProps {
  videoInfo: VideoInfo
}

export function VideoPreview({ videoInfo }: VideoPreviewProps) {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)

  const getPlatformColor = (platform: string) => {
    switch (platform.toLowerCase()) {
      case "tiktok":
        return "bg-gradient-to-r from-pink-500 to-red-500"
      case "youtube":
        return "bg-gradient-to-r from-red-500 to-red-600"
      case "facebook":
        return "bg-gradient-to-r from-blue-500 to-blue-600"
      case "instagram":
        return "bg-gradient-to-r from-purple-500 to-pink-500"
      case "twitter":
        return "bg-gradient-to-r from-sky-400 to-sky-500"
      case "vimeo":
        return "bg-gradient-to-r from-teal-500 to-cyan-500"
      default:
        return "bg-gradient-to-r from-gray-500 to-gray-600"
    }
  }

  const getPlatformEmoji = (platform: string) => {
    switch (platform.toLowerCase()) {
      case "tiktok":
        return "🎵"
      case "youtube":
        return "📺"
      case "facebook":
        return "👥"
      case "instagram":
        return "📸"
      case "twitter":
        return "🐦"
      case "vimeo":
        return "🎬"
      default:
        return "🎥"
    }
  }

  return (
    <Card className="overflow-hidden enhanced-card enhanced-shadow">
      <CardContent className="p-0">
        <div className="flex flex-col md:flex-row">
          <div className="relative md:w-64 h-36 md:h-auto group">
            {!imageLoaded && !imageError && (
              <div className="absolute inset-0 thumbnail-loading rounded-l-lg flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            )}

            {imageError ? (
              <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center rounded-l-lg">
                <div className="text-center">
                  <div className="text-4xl mb-2">{getPlatformEmoji(videoInfo.platform)}</div>
                  <div className="text-sm text-muted-foreground">No preview</div>
                </div>
              </div>
            ) : (
              <img
                src={videoInfo.thumbnail || "/placeholder.svg"}
                alt={videoInfo.title}
                className={`w-full h-full object-cover rounded-l-lg transition-all duration-300 group-hover:scale-105 ${
                  imageLoaded ? "opacity-100" : "opacity-0"
                }`}
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageError(true)}
              />
            )}

            {/* Play button overlay */}
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center rounded-l-lg">
              <div className="bg-white/90 dark:bg-black/90 rounded-full p-3 transform scale-90 group-hover:scale-100 transition-transform duration-300">
                <Play className="w-6 h-6 text-gray-800 dark:text-white ml-1" />
              </div>
            </div>

            {/* Duration badge */}
            <div className="absolute bottom-2 right-2 bg-black/80 text-white px-2 py-1 rounded text-xs flex items-center backdrop-blur-sm">
              <Clock className="w-3 h-3 mr-1" />
              {videoInfo.duration}
            </div>

            {/* Platform badge */}
            <div className="absolute top-2 left-2">
              <Badge className={`${getPlatformColor(videoInfo.platform)} text-white border-0 shadow-lg`}>
                <span className="mr-1">{getPlatformEmoji(videoInfo.platform)}</span>
                {videoInfo.platform.toUpperCase()}
              </Badge>
            </div>
          </div>

          <div className="flex-1 p-6">
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-semibold text-lg line-clamp-2 flex-1 mr-2 text-foreground">{videoInfo.title}</h3>
            </div>

            <div className="flex items-center text-sm text-muted-foreground mb-4">
              <Eye className="w-4 h-4 mr-2" />
              Ready for download in {videoInfo.formats.length} formats
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="font-medium text-blue-700 dark:text-blue-300">Best Quality</div>
                <div className="text-blue-600 dark:text-blue-400">{videoInfo.formats[0]?.quality || "1080p"} MP4</div>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg border border-purple-200 dark:border-purple-800">
                <div className="font-medium text-purple-700 dark:text-purple-300">File Size</div>
                <div className="text-purple-600 dark:text-purple-400">{videoInfo.formats[0]?.size || "~25 MB"}</div>
              </div>
            </div>

            {videoInfo.platform === "tiktok" && (
              <div className="mt-4 bg-pink-50 dark:bg-pink-900/20 p-3 rounded-lg border border-pink-200 dark:border-pink-800">
                <div className="flex items-center text-sm">
                  <Droplets className="w-4 h-4 mr-2 text-pink-500" />
                  <span className="font-medium text-pink-700 dark:text-pink-300">Watermark removal available</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
