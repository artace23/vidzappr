import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const platforms = [
  {
    name: "TikTok",
    logo: "🎵",
    features: ["Watermark Removal", "HD Quality", "Audio Extract"],
    color: "from-pink-500 to-red-500",
  },
  {
    name: "YouTube",
    logo: "📺",
    features: ["4K Quality", "Audio Only", "Playlists"],
    color: "from-red-500 to-red-600",
  },
  {
    name: "Facebook",
    logo: "👥",
    features: ["HD Quality", "Stories", "Reels"],
    color: "from-blue-500 to-blue-600",
  },
  {
    name: "Instagram",
    logo: "📸",
    features: ["Stories", "Reels", "IGTV"],
    color: "from-purple-500 to-pink-500",
  },
  {
    name: "Twitter",
    logo: "🐦",
    features: ["HD Quality", "GIF Support", "Threads"],
    color: "from-blue-400 to-blue-500",
  },
  {
    name: "Vimeo",
    logo: "🎬",
    features: ["4K Quality", "Private Videos", "HD Audio"],
    color: "from-teal-500 to-cyan-500",
  },
]

export function SupportedPlatforms() {
  return (
    <section id="platforms" className="py-20 px-4 sm:px-6 lg:px-8 section-darker">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-white">Supported Platforms</h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Download from all major social media and video platforms
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {platforms.map((platform, index) => (
            <Card key={index} className="enhanced-card enhanced-shadow hover:scale-105 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-r ${platform.color} text-white text-xl mr-4 shadow-lg`}
                  >
                    {platform.logo}
                  </div>
                  <h3 className="text-xl font-semibold text-white">{platform.name}</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {platform.features.map((feature, featureIndex) => (
                    <Badge key={featureIndex} className="dark-badge text-xs">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-400">
            <strong className="text-yellow-400">Legal Notice:</strong> Please respect copyright laws and platform terms
            of service. Only download content you own or have permission to use.
          </p>
        </div>
      </div>
    </section>
  )
}
