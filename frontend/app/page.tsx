"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.6, -0.05, 0.01, 0.99] }
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
}

export default function HomePage() {
  return (
    <section className="relative min-h-[calc(100vh-8rem)] overflow-hidden">
      {/* Content */}
      <div className="relative z-20 grid gap-12 py-8 lg:grid-cols-[1fr_1fr] lg:gap-8">
        {/* Left Side - Header and Cards */}
        <div className="grid gap-12">
          {/* Header Section */}
          <motion.header
            initial="initial"
            animate="animate"
            variants={fadeInUp}
            className="grid gap-4"
          >
            <motion.h1
              variants={fadeInUp}
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-balance bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent"
            >
              General Auto Electric & Safety
            </motion.h1>
            <motion.p
              variants={fadeInUp}
              className="max-w-3xl text-lg md:text-xl text-foreground/80 leading-relaxed"
            >
              Welcome to General Auto Electric — your trusted destination for premium automotive electrical solutions.
              We focus on quality, reliability, and innovation, bringing you products and services that ensure your
              vehicle performs at its best.
            </motion.p>
          </motion.header>

          {/* Cards Grid - 2x2 */}
          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
            className="grid gap-6 grid-cols-2"
          >
            <motion.div variants={fadeInUp}>
              <Card className="h-full border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-lg bg-card/95 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-xl text-primary">Our Mission</CardTitle>
                  <CardDescription className="text-base">
                    Excellence in every connection
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-foreground/70 leading-relaxed">
                    Design and deliver reliable automotive electrical products that help your vehicle operate safely
                    and efficiently, every day. We are committed to quality and customer satisfaction.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Card className="h-full border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-lg bg-card/95 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-xl text-primary">What We Value</CardTitle>
                  <CardDescription className="text-base">
                    Built on strong principles
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-foreground/70 leading-relaxed">
                    Craftsmanship, accessibility, and sustainability in everything we build. We believe in creating
                    products that last and serve our customers for years to come.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Card className="h-full border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-lg bg-card/95 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-xl text-primary">Customer First</CardTitle>
                  <CardDescription className="text-base">
                    Your success is our priority
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-foreground/70 leading-relaxed">
                    Your feedback shapes our roadmap. We listen, learn, and iterate quickly to ensure we meet and
                    exceed your expectations with every interaction.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Card className="h-full border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-lg bg-card/95 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-xl text-primary">Quality Assurance</CardTitle>
                  <CardDescription className="text-base">
                    Uncompromising standards
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-foreground/70 leading-relaxed">
                    Every product undergoes rigorous testing to meet the highest industry standards. We ensure
                    durability, performance, and safety in all our automotive electrical solutions.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>

        {/* Right Side - Image */}
        <motion.div
          initial="initial"
          animate="animate"
          variants={fadeInUp}
          className="relative hidden lg:block"
        >
          <div className="sticky top-8 h-[calc(100vh-8rem)] flex items-center justify-center">
            <div className="relative w-full h-full max-h-[600px] rounded-lg overflow-hidden border-2 border-primary/20 shadow-xl">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 z-10" />
              <Image
                src="/bg.jpg"
                alt="General Auto Electric & Safety"
                fill
                className="object-contain opacity-80"
                priority
                quality={100}
              />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
