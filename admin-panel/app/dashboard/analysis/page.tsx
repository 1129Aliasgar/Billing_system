"use client"
import { useEffect, useMemo, useState } from "react"
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell } from "recharts"

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
  const [categorySales, setCategorySales] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())

  useEffect(() => {
    // Clear previous data when month/year changes
    setCategorySales(null)
    setLoading(true)
    // Fetch new data
    fetchCategorySales()
    fetchSalesData()
  }, [selectedMonth, selectedYear])

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

  async function fetchCategorySales() {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        setCategorySales(null)
        return
      }

      // Clear previous data immediately
      setCategorySales(null)

      const res = await fetch(`/api/sales/monthly-by-category?month=${selectedMonth}&year=${selectedYear}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      })

      if (res.ok) {
        const data = await res.json()
        // Only set data if it matches the current selected month/year (prevent race conditions)
        if (data.month === selectedMonth && data.year === selectedYear) {
          setCategorySales(data)
        }
      } else {
        // If no data for selected month/year, set empty
        setCategorySales(null)
      }
    } catch (err) {
      console.error("Error fetching category sales:", err)
      setCategorySales(null)
    }
  }

  // Transform sales data for monthly chart - filter by selected year
  const monthlySales = useMemo(() => {
    if (!salesSummary) return []

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

    // Aggregate sales by month from all products for the selected year
    const monthlyData: { [key: number]: number } = {}
    
    salesSummary.salesData?.forEach((item) => {
      item.salesHistory?.forEach((sale) => {
        if (sale.year === selectedYear) {
          monthlyData[sale.month] = (monthlyData[sale.month] || 0) + sale.quantitySold
        }
      })
    })

    return months.map((monthName, index) => ({
      month: monthName,
      sales: monthlyData[index + 1] || 0,
    }))
  }, [salesSummary, selectedYear])

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

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ]

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i)

  const COLORS = ['#579BB1', '#4A8A9E', '#6BA8BC', '#E1D7C6', '#ECE8DD', '#8B9DC3', '#A8C5D1']

  return (
    <section className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-pretty">Sales Analysis</h1>
          <p className="text-sm text-muted-foreground">
            Real-time sales data from billing system
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            className="px-3 py-2 border rounded text-sm"
          >
            {months.map((month, index) => (
              <option key={index} value={index + 1}>{month}</option>
            ))}
          </select>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="px-3 py-2 border rounded text-sm"
          >
            {years.map((year) => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          <button
            onClick={() => { 
              setCategorySales(null)
              setLoading(true)
              fetchCategorySales()
              fetchSalesData()
            }}
            className="px-4 py-2 bg-primary text-white rounded hover:opacity-90 text-sm"
            disabled={loading}
          >
            {loading ? "Loading..." : "🔄 Refresh"}
          </button>
        </div>
      </header>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="card p-4">
          <h3 className="text-sm text-muted-foreground mb-1">Total Sales</h3>
          <p className="text-2xl font-bold">{totalSales}</p>
          <p className="text-xs text-muted-foreground mt-1">All time</p>
        </div>
        <div className="card p-4">
          <h3 className="text-sm text-muted-foreground mb-1">Selected Month</h3>
          <p className="text-2xl font-bold">
            {categorySales?.totalItems || 0}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {months[selectedMonth - 1]} {selectedYear}
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
          <h2 className="font-medium mb-3">Monthly Sales ({selectedYear})</h2>
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
              No sales data available for {selectedYear}
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

      {/* Category Sales Section */}
      <div className="card p-4">
        <h2 className="font-medium mb-4">Monthly Sales by Category ({months[selectedMonth - 1]} {selectedYear})</h2>
        {categorySales && categorySales.categoryData && categorySales.categoryData.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="text-sm font-medium mb-3">Sales Distribution</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categorySales.categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ category, quantity }) => `${category}: ${quantity}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="quantity"
                    >
                      {categorySales.categoryData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium mb-3">Category Details</h3>
              <div className="space-y-2">
                {categorySales.mostSoldCategory && (
                  <div className="p-3 bg-primary/10 border border-primary/20 rounded">
                    <p className="text-xs text-muted-foreground">Most Sold Category</p>
                    <p className="font-semibold">{categorySales.mostSoldCategory.category}</p>
                    <p className="text-sm">Quantity: {categorySales.mostSoldCategory.quantity}</p>
                    <p className="text-sm">Revenue: ₹{categorySales.mostSoldCategory.revenue.toFixed(2)}</p>
                  </div>
                )}
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {categorySales.categoryData.map((cat: any, index: number) => (
                    <div key={index} className="p-2 border rounded text-sm">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{cat.category || "Uncategorized"}</span>
                        <span className="text-muted-foreground">{cat.quantity} items</span>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-muted-foreground">Revenue: ₹{cat.revenue.toFixed(2)}</span>
                        <span className="text-xs text-muted-foreground">{cat.billCount} bills</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-2 bg-gray-50 rounded text-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Total Revenue</span>
                    <span className="font-semibold">₹{categorySales.totalRevenue?.toFixed(2) || "0.00"}</span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-muted-foreground">Total Items</span>
                    <span className="font-medium">{categorySales.totalItems || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : loading ? (
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            Loading category data...
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            No sales data available for {months[selectedMonth - 1]} {selectedYear}
          </div>
        )}
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
