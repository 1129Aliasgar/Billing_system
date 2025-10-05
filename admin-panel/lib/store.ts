"use client"

import { useSyncExternalStore } from "react"
import type { Product } from "./types"

type Store = { products: Product[] }
const key = "admin_products"

function getSnapshot(): Store {
  try {
    const data = JSON.parse(localStorage.getItem(key) || "[]")
    return { products: data }
  } catch {
    return { products: [] }
  }
}

function setSnapshot(next: Store) {
  localStorage.setItem(key, JSON.stringify(next.products))
  listeners.forEach((l) => l())
}

const listeners = new Set<() => void>()
function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function useProductStore<T = Store>(selector?: (s: Store) => T) {
  const state = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
  return selector ? selector(state) : (state as any)
}

// Actions depend on current snapshot; calling components will re-render after updates.
export function useProductActions() {
  const state = useProductStore() as Store

  function create(input: { name: string; price: number; inStock: number; description: string }) {
    const p: Product = {
      id: crypto.randomUUID(),
      name: input.name,
      price: input.price,
      inStock: input.inStock,
      description: input.description,
      createdAt: new Date().toISOString(),
    }
    setSnapshot({ products: [p, ...state.products] })
  }

  function update(id: string, patch: Partial<Product>) {
    setSnapshot({ products: state.products.map((p) => (p.id === id ? { ...p, ...patch } : p)) })
  }

  function remove(id: string) {
    setSnapshot({ products: state.products.filter((p) => p.id !== id) })
  }

  function seedIfEmpty() {
    if (state.products.length === 0) {
      const demo: Product[] = [
        {
          id: "a-1",
          name: "Comfort Chair",
          price: 129.99,
          inStock: 34,
          description: "Ergonomic office chair with lumbar support.",
          createdAt: new Date().toISOString(),
        },
        {
          id: "a-2",
          name: "Wooden Desk",
          price: 299.0,
          inStock: 12,
          description: "Minimalist solid-wood desk with cable management.",
          createdAt: new Date().toISOString(),
        },
      ]
      setSnapshot({ products: demo })
    }
  }

  return { create, update, remove, seedIfEmpty }
}
