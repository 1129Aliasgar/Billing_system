"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"

type ContactForm = { name: string; email: string; message: string }

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.6, -0.05, 0.01, 0.99] }
}

export default function ContactPage() {
  const [form, setForm] = useState<ContactForm>({ name: "", email: "", message: "" })
  const [status, setStatus] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => setStatus(""), [form])

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSubmitting(true)
    setStatus("")
    
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      })

      if (!response.ok) {
        setStatus("Something went wrong. Please try again.")
        setIsSubmitting(false)
        return
      }

      setForm({ name: "", email: "", message: "" })
      setStatus("Thanks! We received your message. We'll get back to you shortly.")
    } catch {
      setStatus("Something went wrong. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="grid gap-8 max-w-2xl mx-auto">
      {/* Header */}
      <motion.header
        initial="initial"
        animate="animate"
        variants={fadeInUp}
        className="grid gap-3 text-center"
      >
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-balance bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
          Contact Us
        </h1>
        <p className="text-lg text-foreground/70 max-w-xl mx-auto">
          Fill out the form below and we'll get back to you shortly. We're here to help with 
          all your automotive electrical needs.
        </p>
      </motion.header>

      {/* Contact Form */}
      <motion.div
        initial="initial"
        animate="animate"
        variants={fadeInUp}
      >
        <Card className="border-2 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Get in Touch</CardTitle>
            <CardDescription>
              We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid gap-6">
              <div className="grid gap-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  name="name"
                  required
                  value={form.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className="h-11"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                  placeholder="john@example.com"
                  className="h-11"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="message">Message *</Label>
                <Textarea
                  id="message"
                  name="message"
                  required
                  value={form.message}
                  onChange={handleChange}
                  placeholder="How can we help you today?"
                  className="min-h-32 resize-none"
                />
              </div>

              <div className="flex flex-col gap-3">
                <Button
                  type="submit"
                  size="lg"
                  disabled={isSubmitting}
                  className="w-full"
                >
                  {isSubmitting ? "Sending..." : "Send Message"}
                </Button>
                
                {status && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`text-sm text-center px-4 py-2 rounded-md ${
                      status.includes("Thanks")
                        ? "bg-green-50 text-green-700 border border-green-200"
                        : "bg-red-50 text-red-700 border border-red-200"
                    }`}
                  >
                    {status}
                  </motion.p>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </section>
  )
}
