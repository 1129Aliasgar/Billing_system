"use client"

import { useMemo } from "react"
import { useProductStore } from "../../lib/store"
import type { Product } from "../../lib/types"
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts"
import AuthGuard from "../../components/auth-guard"

export default function AnalysisPage() {
  return (
    <AuthGuard>
      <AnalysisInner />
    </AuthGuard>
  )
}

function AnalysisInner() {
  const products = useProductStore((s) => s.products) as Product[]

  // Fake "sales" metric based on price and stock
  const data = useMemo(
    () =>
      products.map((p) => ({
        name: p.name,
        sales: Math.round(p.price * Math.min(p.inStock, 50) * 0.1),
      })),
    [products],
  )

  return (
    <section className="grid gap-4">
      <h1 className="text-xl font-semibold">Product Analysis</h1>
      <div className="bg-white border rounded-lg p-4" style={{ height: 320 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" hide />
            <YAxis />
            <Tooltip />
            <Area type="monotone" dataKey="sales" stroke="#2563eb" fillOpacity={1} fill="url(#colorSales)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <p className="text-sm text-muted">This is sample analysis. Connect your real metrics later.</p>
    </section>
  )
}
