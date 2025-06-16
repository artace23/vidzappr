import { Download, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 shadow-lg">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              VidZappr
            </span>
          </div>

          <nav className="hidden md:flex items-center space-x-6">
            <a
              href="#features"
              className="text-muted-foreground hover:text-foreground transition-colors duration-200 hover:scale-105"
            >
              Features
            </a>
            <a
              href="#platforms"
              className="text-muted-foreground hover:text-foreground transition-colors duration-200 hover:scale-105"
            >
              Platforms
            </a>
            <a
              href="#faq"
              className="text-muted-foreground hover:text-foreground transition-colors duration-200 hover:scale-105"
            >
              FAQ
            </a>
            <a
              href="#privacy"
              className="text-muted-foreground hover:text-foreground transition-colors duration-200 hover:scale-105"
            >
              Privacy
            </a>
          </nav>

        </div>
      </div>
    </header>
  )
}
