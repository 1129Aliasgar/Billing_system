export default function Footer() {
  return (
    <footer className="bg-black text-white">
      <div className="max-w-6xl mx-auto px-4 py-8 text-sm flex items-center justify-between">
        <p className="text-pretty">© {new Date().getFullYear()} E-Store. All rights reserved.</p>
        <p className="text-pretty">General Auto Electric & Saftey.</p>
      </div>
    </footer>
  )
}
