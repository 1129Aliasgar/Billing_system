"use client"
export default function SearchBar({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-10 px-3 rounded-md border bg-background w-full md:w-80"
      placeholder="Search by product name..."
      aria-label="Search products"
    />
  )
}
