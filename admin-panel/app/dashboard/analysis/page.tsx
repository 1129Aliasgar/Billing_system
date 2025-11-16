"use client"
import { useEffect, useMemo, useState } from "react"
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"

type SalesData = {
  product: {
    _id: string
    name: string
    price: number
    inStock: number
  }
  totalSold: number
  currentMonthSold: number
  salesHistory: Array<{
    month: number
    year: number
    quantitySold: number
  }>
}

type SalesSummary = {
  currentMonth: number
  currentYear: number
  totalProducts: number
  salesData: SalesData[]
}

export default function AnalysisPage() {
  const [salesSummary, setSalesSummary] = useState<SalesSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchSalesData()
  }, [])

  async function fetchSalesData() {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")
      if (!token) {
        setError("Please login to view sales data")
        setLoading(false)
        return
      }

      const res = await fetch("/api/sales/summary", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        setError(errorData.message || "Failed to fetch sales data")
        setLoading(false)
        return
      }

      const data = await res.json()
      // Handle both response formats: { summary: {...} } or direct summary object
      if (data.summary) {
        setSalesSummary(data.summary)
        setError(null)
      } else if (data.currentMonth && data.salesData) {
        setSalesSummary(data)
        setError(null)
      } else {
        setError("Invalid data format received")
        setSalesSummary(null)
      }
    } catch (err) {
      console.error("Error fetching sales data:", err)
      setError("Failed to load sales data")
    } finally {
      setLoading(false)
    }
  }

  // Transform sales data for monthly chart
  const monthlySales = useMemo(() => {
    if (!salesSummary) return []

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    const currentMonth = salesSummary.currentMonth || new Date().getMonth() + 1
    const currentYear = salesSummary.currentYear || new Date().getFullYear()

    // Aggregate sales by month from all products
    const monthlyData: { [key: number]: number } = {}
    
    salesSummary.salesData?.forEach((item) => {
      item.salesHistory?.forEach((sale) => {
        if (sale.year === currentYear) {
          monthlyData[sale.month] = (monthlyData[sale.month] || 0) + sale.quantitySold
        }
      })
    })

    return months.map((monthName, index) => ({
      month: monthName,
      sales: monthlyData[index + 1] || 0,
    }))
  }, [salesSummary])

  // Top products by sales
  const topProducts = useMemo(() => {
    if (!salesSummary) return []

    return salesSummary.salesData
      ?.map((item) => ({
        name: item.product.name,
        sales: item.totalSold || 0,
      }))
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 5) || []
  }, [salesSummary])

  const highest = topProducts[0]?.name
  const totalSales = salesSummary?.salesData?.reduce((sum, item) => sum + (item.totalSold || 0), 0) || 0
  const currentMonthSales = salesSummary?.salesData?.reduce((sum, item) => sum + (item.currentMonthSold || 0), 0) || 0

  if (loading) {
    return (
      <section className="space-y-6">
        <header>
          <h1 className="text-xl font-semibold text-pretty">Sales Analysis</h1>
          <p className="text-sm text-muted-foreground">Loading sales data...</p>
        </header>
      </section>
    )
  }

  if (error) {
    return (
      <section className="space-y-6">
        <header>
          <h1 className="text-xl font-semibold text-pretty">Sales Analysis</h1>
          <p className="text-sm text-red-600">{error}</p>
        </header>
        <button
          onClick={fetchSalesData}
          className="px-4 py-2 bg-primary text-white rounded hover:opacity-90"
        >
          Retry
        </button>
      </section>
    )
  }

  return (
    <section className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-pretty">Sales Analysis</h1>
          <p className="text-sm text-muted-foreground">
            Real-time sales data from billing system
          </p>
        </div>
        <button
          onClick={fetchSalesData}
          className="px-4 py-2 bg-primary text-white rounded hover:opacity-90 text-sm"
          disabled={loading}
        >
          {loading ? "Loading..." : "🔄 Refresh"}
        </button>
      </header>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="card p-4">
          <h3 className="text-sm text-muted-foreground mb-1">Total Sales</h3>
          <p className="text-2xl font-bold">{totalSales}</p>
          <p className="text-xs text-muted-foreground mt-1">All time</p>
        </div>
        <div className="card p-4">
          <h3 className="text-sm text-muted-foreground mb-1">This Month</h3>
          <p className="text-2xl font-bold">{currentMonthSales}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {salesSummary?.currentMonth ? 
              new Date(2000, (salesSummary.currentMonth - 1)).toLocaleString('default', { month: 'long' }) : 
              'Current month'
            }
          </p>
        </div>
        <div className="card p-4">
          <h3 className="text-sm text-muted-foreground mb-1">Products Tracked</h3>
          <p className="text-2xl font-bold">{salesSummary?.totalProducts || 0}</p>
          <p className="text-xs text-muted-foreground mt-1">With sales data</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="card p-4">
          <h2 className="font-medium mb-3">Monthly Sales</h2>
          {monthlySales.length > 0 && monthlySales.some(m => m.sales > 0) ? (
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
          ) : (
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              No sales data available for this year
            </div>
          )}
        </div>

        <div className="card p-4">
          <h2 className="font-medium mb-3">Top Products</h2>
          {topProducts.length > 0 ? (
            <>
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
            </>
          ) : (
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              No sales data available
            </div>
          )}
        </div>
      </div>

      {(!salesSummary || salesSummary.salesData?.length === 0) && (
        <div className="card p-4 text-center">
          <p className="text-sm text-muted-foreground">
            No sales data yet. Create bills in the billing portal to see sales analytics here.
          </p>
        </div>
      )}
    </section>
  )
}
