import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Download, Music, Droplets, Smartphone, Shield, Zap, Video, Settings } from "lucide-react"

const features = [
  {
    icon: Download,
    title: "Multiple Formats",
    description: "Download in MP4, MP3, and various resolutions from 144p to 4K quality.",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: Droplets,
    title: "Watermark Removal",
    description: "Automatically remove TikTok watermarks for clean, professional videos.",
    color: "from-pink-500 to-rose-500",
  },
  {
    icon: Music,
    title: "Audio Extraction",
    description: "Extract high-quality MP3 audio from any video with one click.",
    color: "from-purple-500 to-violet-500",
  },
  {
    icon: Smartphone,
    title: "Mobile Optimized",
    description: "Perfect experience on all devices - phone, tablet, or desktop.",
    color: "from-green-500 to-emerald-500",
  },
  {
    icon: Shield,
    title: "Privacy First",
    description: "No data stored, no tracking, no registration required. Your privacy matters.",
    color: "from-emerald-500 to-teal-500",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Advanced processing servers ensure downloads complete in seconds.",
    color: "from-yellow-500 to-orange-500",
  },
  {
    icon: Video,
    title: "Quality Options",
    description: "Choose from multiple quality options to balance file size and clarity.",
    color: "from-red-500 to-pink-500",
  },
  {
    icon: Settings,
    title: "Batch Processing",
    description: "Download multiple videos at once with our batch processing feature.",
    color: "from-gray-500 to-slate-500",
  },
]

export function Features() {
  return (
    <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 section-dark">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-white">Powerful Features for Everyone</h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Everything you need to download, convert, and enjoy your favorite videos
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="enhanced-card enhanced-shadow group hover:scale-105 transition-all duration-300"
            >
              <CardHeader className="text-center pb-4">
                <div
                  className={`mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-r ${feature.color} shadow-lg group-hover:shadow-xl transition-shadow duration-300`}
                >
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-lg text-white">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-gray-300 text-center text-sm leading-relaxed">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
