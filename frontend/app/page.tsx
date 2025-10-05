export default function HomePage() {
  return (
    <section className="grid gap-8">
      <header className="grid gap-3">
        <h1 className="text-3xl md:text-4xl font-bold text-balance">About Us</h1>
        <p className="max-w-2xl text-pretty">
          Welcome to E-Store — your destination for thoughtfully designed workspace essentials. We focus on quality,
          comfort, and productivity, bringing you products that look good and feel right.
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="bg-white rounded-lg border p-5">
          <h3 className="font-semibold mb-2">Our Mission</h3>
          <p className="text-sm ">Design reliable products that help you do your best work, every day.</p>
        </div>
        <div className="bg-white rounded-lg border p-5">
          <h3 className="font-semibold mb-2">What We Value</h3>
          <p className="text-sm ">Craftsmanship, accessibility, and sustainability in everything we build.</p>
        </div>
        <div className="bg-white rounded-lg border p-5">
          <h3 className="font-semibold mb-2">Customer First</h3>
          <p className="text-sm ">Your feedback shapes our roadmap. We listen and iterate quickly.</p>
        </div>
      </div>
    </section>
  )
}
