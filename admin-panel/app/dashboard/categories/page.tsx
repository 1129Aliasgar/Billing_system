"use client"

import { useEffect, useState } from "react"
import AuthGuard from "../../../components/auth-guard"

type Category = {
  _id: string
  name: string
  displayName: string
  description: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export default function CategoriesPage() {
  return (
    <AuthGuard>
      <CategoriesInner />
    </AuthGuard>
  )
}

function CategoriesInner() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    displayName: "",
    description: ""
  })

  useEffect(() => {
    fetchCategories()
  }, [])

  async function fetchCategories() {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")
      if (!token) {
        setError("Please login")
        setLoading(false)
        return
      }

      const res = await fetch("/api/categories", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        setError(errorData.message || "Failed to fetch categories")
        setLoading(false)
        return
      }

      const data = await res.json()
      setCategories(data.categories || [])
      setError(null)
    } catch (err) {
      console.error("Error fetching categories:", err)
      setError("Failed to load categories")
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        setError("Please login")
        return
      }

      const url = editingCategory 
        ? `/api/categories/${editingCategory._id}`
        : "/api/categories"
      const method = editingCategory ? "PUT" : "POST"

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        setError(errorData.message || "Failed to save category")
        return
      }

      setShowForm(false)
      setEditingCategory(null)
      setFormData({ name: "", displayName: "", description: "" })
      fetchCategories()
    } catch (err) {
      console.error("Error saving category:", err)
      setError("Failed to save category")
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this category?")) return

    try {
      const token = localStorage.getItem("token")
      if (!token) {
        setError("Please login")
        return
      }

      const res = await fetch(`/api/categories/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        setError(errorData.message || "Failed to delete category")
        return
      }

      fetchCategories()
    } catch (err) {
      console.error("Error deleting category:", err)
      setError("Failed to delete category")
    }
  }

  function handleEdit(category: Category) {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      displayName: category.displayName,
      description: category.description || ""
    })
    setShowForm(true)
  }

  function handleCancel() {
    setShowForm(false)
    setEditingCategory(null)
    setFormData({ name: "", displayName: "", description: "" })
  }

  if (loading) {
    return (
      <section className="space-y-6">
        <header>
          <h1 className="text-xl font-semibold">Category Management</h1>
          <p className="text-sm text-muted-foreground">Loading categories...</p>
        </header>
      </section>
    )
  }

  return (
    <section className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Category Management</h1>
          <p className="text-sm text-muted-foreground">
            Manage product categories
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-primary text-white rounded hover:opacity-90 text-sm"
        >
          + Add Category
        </button>
      </header>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded border border-red-200">
          {error}
        </div>
      )}

      {showForm && (
        <div className="card p-6">
          <h2 className="text-lg font-semibold mb-4">
            {editingCategory ? "Edit Category" : "Add New Category"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Category Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border rounded"
                placeholder="e.g., electrical-parts"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Lowercase, no spaces (used internally)
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Display Name *
              </label>
              <input
                type="text"
                required
                value={formData.displayName}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                className="w-full px-3 py-2 border rounded"
                placeholder="e.g., Electrical Parts"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border rounded"
                rows={3}
                placeholder="Optional description"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-primary text-white rounded hover:opacity-90"
              >
                {editingCategory ? "Update" : "Create"}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 border rounded hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card p-4">
        <h2 className="font-medium mb-4">All Categories</h2>
        {categories.length === 0 ? (
          <p className="text-sm text-muted-foreground">No categories found. Create one to get started.</p>
        ) : (
          <div className="space-y-2">
            {categories.map((category) => (
              <div
                key={category._id}
                className="flex items-center justify-between p-3 border rounded hover:bg-gray-50"
              >
                <div>
                  <p className="font-medium">{category.displayName}</p>
                  <p className="text-xs text-muted-foreground">{category.name}</p>
                  {category.description && (
                    <p className="text-sm text-muted-foreground mt-1">{category.description}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(category)}
                    className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(category._id)}
                    className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

