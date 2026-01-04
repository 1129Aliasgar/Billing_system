export default function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground border-t border-primary-dark">
      <div className="max-w-6xl mx-auto px-2 py-8 text-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-pretty">© {new Date().getFullYear()} General Auto Electric. All rights reserved.</p>
        <p className="text-pretty text-primary-foreground/90">General Auto Electric & Safety</p>
      </div>
    </footer>
  )
}
