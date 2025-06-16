import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Eye, Trash2, Lock } from "lucide-react"

const privacyFeatures = [
  {
    icon: Shield,
    
    title: "No Data Collection",
    description: "We don't collect, store, or track any personal information or browsing data.",
  },
  {
    icon: Eye,
    title: "No Tracking",
    description: "No cookies, analytics, or third-party tracking scripts monitor your activity.",
  },
  {
    icon: Trash2,
    title: "Auto-Delete",
    description: "All processed files are automatically deleted from our servers after download.",
  },
  {
    icon: Lock,
    title: "Secure Processing",
    description: "All connections use HTTPS encryption to protect your data in transit.",
  },
]

export function Privacy() {
  return (
    <section id="privacy" className="py-20 px-4 sm:px-6 lg:px-8 section-dark">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-white">Your Privacy Matters</h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            We're committed to protecting your privacy with zero data collection
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {privacyFeatures.map((feature, index) => (
            <Card key={index} className="enhanced-card enhanced-shadow text-center">
              <CardHeader className="pb-4">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 shadow-lg">
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-lg text-white">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-gray-300 text-sm">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="enhanced-card enhanced-shadow">
          <CardContent className="p-8">
            <h3 className="text-xl font-semibold text-white mb-4">Privacy Policy Summary</h3>
            <div className="space-y-4 text-gray-300">
              <p>
                <strong className="text-blue-400">Data Collection:</strong> We do not collect any personal information,
                browsing history, or user data. No registration or account creation required.
              </p>
              <p>
                <strong className="text-purple-400">File Processing:</strong> Videos are processed temporarily on our
                servers and automatically deleted within 24 hours. We never store your downloaded content.
              </p>
              <p>
                <strong className="text-green-400">Third Parties:</strong> We do not share any information with third
                parties. No advertising networks or analytics services track your usage.
              </p>
              <p>
                <strong className="text-yellow-400">Legal Compliance:</strong> Users are responsible for ensuring they
                have the right to download content. We comply with DMCA and copyright laws.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
