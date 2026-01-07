import { AlertTriangle } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground border-t border-primary-dark">
      <div className="max-w-6xl mx-auto px-2 py-8">
        {/* Warning/Disclaimer Section */}
        <div className="mb-6 p-4 rounded-lg bg-primary-dark/30 border border-primary-foreground/20">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-300 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold mb-2 text-base">Important Disclaimer</h3>
              <p className="text-sm text-primary-foreground/90 leading-relaxed">
                All trademarks, brand names, logos, and product images displayed on this website are the property of their respective owners. 
                General Auto Electric & Safety does not claim ownership or affiliation with any third-party brands unless explicitly stated. 
                This website is an independent business platform and is not an official brand website. Product specifications, images, and 
                descriptions are provided for informational purposes only. We are not responsible for any inaccuracies in third-party brand 
                information. Please verify all product details with the original manufacturer before making purchasing decisions.
              </p>
            </div>
          </div>
        </div>

        {/* Copyright Section */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
          <p className="text-pretty">© {new Date().getFullYear()} General Auto Electric & Safety. All rights reserved.</p>
          <p className="text-pretty text-primary-foreground/80 text-center sm:text-right">
            Built with dedication to serve the industrial and petroleum safety sector.
          </p>
        </div>
      </div>
    </footer>
  )
}
