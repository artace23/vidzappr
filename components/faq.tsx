import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

const faqs = [
  {
    question: "Is VidZappr completely free to use?",
    answer:
      "Yes! VidZappr is 100% free with no hidden costs, subscriptions, or premium features. We believe everyone should have access to video downloading tools.",
  },
  {
    question: "Do I need to create an account?",
    answer:
      "No registration required! Simply paste your video URL and start downloading immediately. We respect your privacy and don't collect personal information.",
  },
  {
    question: "What video qualities are available?",
    answer:
      "We support multiple resolutions from 144p to 4K (when available from the source). You can also extract audio-only files in high-quality MP3 format.",
  },
  {
    question: "Can you really remove TikTok watermarks?",
    answer:
      "Yes! Our advanced processing automatically removes TikTok watermarks, giving you clean videos perfect for sharing or editing.",
  },
  {
    question: "Is it legal to download videos?",
    answer:
      "You should only download videos you own or have permission to use. Always respect copyright laws and platform terms of service. We recommend downloading your own content or content with proper licensing.",
  },
  {
    question: "How fast are the downloads?",
    answer:
      "Most videos process in under 5 seconds thanks to our optimized servers. Download speed depends on your internet connection and file size.",
  },
  {
    question: "Do you store my downloaded videos?",
    answer:
      "No! We don't store any videos or personal data. Files are processed temporarily and automatically deleted from our servers after download.",
  },
  {
    question: "What if a video won't download?",
    answer:
      "Some videos may be private, geo-restricted, or have download protection. Make sure the video is publicly accessible and try again. Contact support if issues persist.",
  },
]

export function FAQ() {
  return (
    <section id="faq" className="py-20 px-4 sm:px-6 lg:px-8 section-darker">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-white">Frequently Asked Questions</h2>
          <p className="text-xl text-gray-300">Everything you need to know about VidZappr</p>
        </div>

        <Accordion type="single" collapsible className="space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`} className="enhanced-card px-6 border-0">
              <AccordionTrigger className="text-left font-semibold hover:no-underline text-white">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-gray-300 pb-6">{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
