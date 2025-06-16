import { Zap } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-slate-900/90 backdrop-blur-sm text-white py-12 px-4 sm:px-6 lg:px-8 border-t border-slate-800">
      <div className="container mx-auto max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 shadow-lg">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                VidZappr
              </span>
            </div>
            <p className="text-gray-300 mb-4 max-w-md">
              The fastest, most secure way to download videos from TikTok, YouTube, Facebook, and more. No watermarks,
              no registration, completely free.
            </p>
            <p className="text-sm text-gray-500">© 2024 VidZappr. All rights reserved.</p>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-white">Features</h4>
            <ul className="space-y-2 text-gray-300">
              <li className="hover:text-white transition-colors cursor-pointer">Video Downloads</li>
              <li className="hover:text-white transition-colors cursor-pointer">Audio Extraction</li>
              <li className="hover:text-white transition-colors cursor-pointer">Watermark Removal</li>
              <li className="hover:text-white transition-colors cursor-pointer">Multiple Formats</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-white">Legal</h4>
            <ul className="space-y-2 text-gray-300">
              <li className="hover:text-white transition-colors cursor-pointer">Privacy Policy</li>
              <li className="hover:text-white transition-colors cursor-pointer">Terms of Service</li>
              <li className="hover:text-white transition-colors cursor-pointer">DMCA Policy</li>
              <li className="hover:text-white transition-colors cursor-pointer">Contact Us</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-8 pt-8 text-center text-gray-400">
          <p className="text-sm">
            <strong className="text-yellow-400">Disclaimer:</strong> VidZappr is a tool for downloading videos. Users
            are responsible for respecting copyright laws and platform terms of service. Only download content you own
            or have permission to use.
          </p>
        </div>
      </div>
    </footer>
  )
}
