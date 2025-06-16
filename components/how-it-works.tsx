import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight } from "lucide-react"

const steps = [
  {
    step: "1",
    title: "Paste URL",
    description: "Copy and paste the video URL from any supported platform into our input field.",
  },
  {
    step: "2",
    title: "Choose Format",
    description: "Select your preferred format (MP4, MP3) and quality settings for the download.",
  },
  {
    step: "3",
    title: "Preview & Process",
    description: "Preview the video details and click download. Our servers process it instantly.",
  },
  {
    step: "4",
    title: "Download",
    description: "Your file is ready! Download directly to your device with no watermarks.",
  },
]

export function HowItWorks() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 section-dark">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-white">How It Works</h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">Download any video in just 4 simple steps</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <Card className="enhanced-card enhanced-shadow h-full">
                <CardContent className="p-6 text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold text-lg shadow-lg">
                    {step.step}
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-3">{step.title}</h3>
                  <p className="text-gray-300 text-sm">{step.description}</p>
                </CardContent>
              </Card>
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-3 transform -translate-y-1/2">
                  <ArrowRight className="h-6 w-6 text-gray-500" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
