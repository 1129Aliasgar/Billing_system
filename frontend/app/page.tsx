"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { ExpandableCard } from "@/components/expandable-card"

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
      {/* Hero Section - Image Left, Text Right */}
      <motion.div
        initial="initial"
        animate="animate"
        variants={fadeInUp}
        className="relative z-20 grid gap-8 py-8 lg:grid-cols-[1fr_1fr] lg:gap-12 items-center"
      >

        {/* Right Side - Text */}
        <motion.header
          variants={fadeInUp}
          className="grid gap-4 order-2 lg:order-1"
        >
          <motion.h1
            variants={fadeInUp}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-balance bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent"
          >
            General Auto Electric & Safety
          </motion.h1>
          <motion.p
            variants={fadeInUp}
            className="text-lg md:text-xl text-foreground/80 leading-relaxed"
          >
            General Auto Electric & Safety is a reliable and customer-focused business dedicated to serving the industrial and petroleum safety sector. Established in 2001 by Mr. Imdadali Yusufali Bootwala, the company has grown through years of dedication, technical understanding, and honest business practices.
          </motion.p>
          <motion.p
            variants={fadeInUp}
            className="text-lg md:text-xl text-foreground/80 leading-relaxed"
          >
            The journey began as a small electrical workshop dealing in inverter batteries, tractor starter servicing, and armature repairing. With time, experience, and a strong desire to grow, Mr. Bootwala gradually expanded his knowledge and understood the increasing importance of workplace safety across industries. This vision led to a steady transition into the industrial safety and petroleum safety field, where quality, reliability, and trust play a vital role.
          </motion.p>
          <motion.p
            variants={fadeInUp}
            className="text-lg md:text-xl text-foreground/80 leading-relaxed"
          >
            Over the years, General Auto Electric & Safety has built a strong reputation by consistently providing dependable safety solutions and personalized customer support. We believe that safety is not just about products, but about responsibility, awareness, and long-term commitment to our customers. Our approach is rooted in understanding customer requirements and offering practical, reliable solutions that meet industry standards.
          </motion.p>
        </motion.header>

        {/* Left Side - Image */}
        <motion.div
          variants={fadeInUp}
          className="relative w-full h-[400px] md:h-[500px] lg:h-[600px] order-1 lg:order-2"
        >
          <div className="relative w-full h-full rounded-lg overflow-hidden border-2 border-primary/20 shadow-xl">
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
        </motion.div>
      </motion.div>

      {/* Cards Grid - 2x2 with Expandable Cards */}
      <motion.div
        variants={staggerContainer}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, margin: "-100px" }}
        className="grid gap-6 md:grid-cols-2 mt-12"
      >
        <motion.div variants={fadeInUp}>
          <ExpandableCard
            title="Our Mission"
            description="Excellence in every connection"
            content="Our mission is to expand our business responsibly while building a strong reputation based on customer trust, quality products, and dependable service. We aim to become a preferred safety solutions provider by consistently meeting customer requirements and maintaining long-term relationships. Through continuous improvement and innovation, we strive to deliver exceptional value to our clients while upholding the highest standards of professionalism and integrity in all our business operations."
          />
        </motion.div>

        <motion.div variants={fadeInUp}>
          <ExpandableCard
            title="What We Value"
            description="At General Auto Electric & Safety, our business is guided by strong values:"
            content={
              <ul className="list-disc pl-5 space-y-2">
                <li>Customer Trust – Building honest, long-lasting relationships based on mutual respect and transparency</li>
                <li>Quality & Reliability – Supplying products that customers can depend on, ensuring safety and performance</li>
                <li>Timely Service – Respecting our customers' time and commitments, delivering solutions when they need them most</li>
                <li>Knowledge & Growth – Continuously improving our understanding of safety solutions and industry best practices</li>
                <li>Integrity – Transparent and ethical business practices that build trust and credibility</li>
                <li>Innovation – Embracing new technologies and methods to better serve our customers</li>
                <li>Safety First – Prioritizing the safety and well-being of our customers and their workplaces</li>
              </ul>
            }
          />
        </motion.div>

        <motion.div variants={fadeInUp}>
          <ExpandableCard
            title="Customer First"
            description="Your success is our priority"
            content="Your feedback shapes our roadmap. We listen, learn, and iterate quickly to ensure we meet and exceed your expectations with every interaction. Our customer-centric approach means we're always ready to adapt and improve based on your needs. We believe in building partnerships, not just transactions, and we're committed to your long-term success. Every decision we make is guided by how it will benefit our customers and enhance their experience with our products and services."
          />
        </motion.div>

        <motion.div variants={fadeInUp}>
          <ExpandableCard
            title="Quality Assurance"
            description="Uncompromising standards"
            content="Every product undergoes rigorous testing to meet the highest industry standards. We ensure durability, performance, and safety in all our automotive electrical solutions. Our quality assurance process includes comprehensive testing, regular inspections, and continuous monitoring to maintain excellence. We work with trusted suppliers and manufacturers who share our commitment to quality, ensuring that every product we offer meets or exceeds industry standards and customer expectations."
          />
        </motion.div>
      </motion.div>
    </section>
  )
}
