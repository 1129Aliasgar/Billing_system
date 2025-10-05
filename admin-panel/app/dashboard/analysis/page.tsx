"use client"
import { useEffect, useMemo, useState } from "react"
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"

type Product = { id: string; name: string; inStock: number }

export default function AnalysisPage() {
  const [products, setProducts] = useState<Product[]>([])

  useEffect(() => {
    try {
      const list: Product[] = JSON.parse(localStorage.getItem("admin_products") || "[]")
      setProducts(list)
    } catch {
      setProducts([])
    }
  }, [])

  // Derive "sales" data from existing products for demo purposes.
  // In your MongoDB integration, replace this with real monthly sales aggregates.
  const monthlySales = useMemo(() => {
    // Distribute a synthetic sales number across months based on inStock
    const base = products.reduce((sum, p) => sum + Math.max(1, Math.floor(p.inStock * 0.5)), 0)
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    return months.map((m, i) => ({
      month: m,
      sales: Math.max(0, Math.round(base * (0.6 + 0.4 * Math.sin((i / 12) * Math.PI * 2)))),
    }))
  }, [products])

  const topProducts = useMemo(() => {
    const list = [...products]
      .map((p) => ({ name: p.name, sales: Math.max(1, Math.floor(p.inStock * 0.75)) }))
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 5)
    return list
  }, [products])

  const highest = topProducts[0]?.name

  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-xl font-semibold text-pretty">Sales Analysis</h1>
        <p className="text-sm text-muted-foreground">
          Demo charts using current product data. Replace with real analytics from your backend later.
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="card p-4">
          <h2 className="font-medium mb-3">Monthly Sales</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlySales} margin={{ top: 8, right: 8, bottom: 8, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted-foreground) / 0.2)" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip />
                <Bar dataKey="sales" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-4">
          <h2 className="font-medium mb-3">Top Products</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topProducts} layout="vertical" margin={{ top: 8, right: 16, bottom: 8, left: 16 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted-foreground) / 0.2)" />
                <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
                <YAxis dataKey="name" type="category" width={100} stroke="hsl(var(--muted-foreground))" />
                <Tooltip />
                <Bar dataKey="sales" fill="var(--color-chart-2)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-sm text-muted-foreground mt-3">
            Highest selling product: <span className="font-medium">{highest ?? "—"}</span>
          </p>
        </div>
      </div>

      {products.length === 0 && (
        <p className="text-sm text-muted-foreground">No products yet. Add some in Product List.</p>
      )}
    </section>
  )
}
