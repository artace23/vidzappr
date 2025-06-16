import { Header } from "@/components/header"
import { Hero } from "@/components/hero"
import { Features } from "@/components/features"
import { SupportedPlatforms } from "@/components/supported-platforms"
import { HowItWorks } from "@/components/how-it-works"
import { FAQ } from "@/components/faq"
import { Privacy } from "@/components/privacy"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <main className="min-h-screen gradient-bg-dark">
      <Header />
      <Hero />
      <Features />
      <SupportedPlatforms />
      <HowItWorks />
      <FAQ />
      <Privacy />
      <Footer />
    </main>
  )
}
