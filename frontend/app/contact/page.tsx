"use client"

import type React from "react"

import { useEffect, useState } from "react"

type ContactForm = { name: string; email: string; message: string }

export default function ContactPage() {
  const [form, setForm] = useState<ContactForm>({ name: "", email: "", message: "" })
  const [status, setStatus] = useState<string>("")

  useEffect(() => setStatus(""), [form])

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      const key = "contact_submissions"
      const prev = JSON.parse(localStorage.getItem(key) || "[]")
      prev.push({ ...form, createdAt: new Date().toISOString() })
      localStorage.setItem(key, JSON.stringify(prev))
      setStatus("Thanks! We received your message.")
      setForm({ name: "", email: "", message: "" })
    } catch {
      setStatus("Something went wrong. Please try again.")
    }
  }

  return (
    <section className="grid gap-6 max-w-xl">
      <header className="grid gap-2">
        <h1 className="text-2xl md:text-3xl font-bold text-balance">Contact Us</h1>
        <p className="">Fill out the form and we’ll get back to you shortly.</p>
      </header>

      <form onSubmit={handleSubmit} className="bg-white border rounded-lg p-5 grid gap-4">
        <div className="grid gap-2">
          <label htmlFor="name" className="text-sm font-medium">
            Name
          </label>
          <input
            id="name"
            name="name"
            required
            value={form.name}
            onChange={handleChange}
            className="h-10 px-3 rounded-md border bg-background"
            placeholder="Jane Doe"
          />
        </div>
        <div className="grid gap-2">
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            value={form.email}
            onChange={handleChange}
            className="h-10 px-3 rounded-md border bg-background"
            placeholder="jane@example.com"
          />
        </div>
        <div className="grid gap-2">
          <label htmlFor="message" className="text-sm font-medium">
            Message
          </label>
          <textarea
            id="message"
            name="message"
            required
            value={form.message}
            onChange={handleChange}
            className="min-h-24 p-3 rounded-md border bg-background"
            placeholder="How can we help?"
          />
        </div>
        <div className="flex items-center gap-3">
          <button className="h-10 px-4 rounded-md bg-primary text-white" type="submit">
            Send
          </button>
          {status && <p className="text-sm">{status}</p>}
        </div>
      </form>
    </section>
  )
}
