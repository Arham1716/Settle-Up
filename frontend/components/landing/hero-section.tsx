"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { GlossyButton } from "@/components/ui/glossy-button"
import { Users, Receipt, Star } from "lucide-react"

export function HeroSection() {
  return (
    <section className="relative min-h-screen overflow-hidden pt-16">
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-[radial-gradient(ellipse_at_center,_rgba(34,197,94,0.3)_0%,_rgba(34,197,94,0.1)_30%,_transparent_70%)]" />

      {/* Secondary subtle gradient */}
      <div className="pointer-events-none absolute top-0 right-0 w-[600px] h-[600px] bg-[radial-gradient(ellipse_at_top_right,_rgba(34,197,94,0.15)_0%,_transparent_60%)]" />

      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-32 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Left Column - Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col gap-6"
          >
            {/* Tagline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-2"
            >
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">Trusted by thousands</span>
            </motion.div>

            <h1 className="text-balance text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              Split. Settle. <span className="text-primary">Live Easy.</span>
            </h1>

            {/* Subheadline */}
            <p className="max-w-md text-lg text-muted-foreground">
              Create groups for roommates, trips, or family. Track expenses, split bills, and settle up with ease. No
              more awkward money conversations.
            </p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap items-center gap-4"
            >
              <Link href="/signup">
                <GlossyButton size="lg">Get Started</GlossyButton>
              </Link>
              <a href="#how-it-works">
                <GlossyButton size="lg" variant="secondary">
                  How it works
                </GlossyButton>
              </a>
            </motion.div>

            {/* Testimonial */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-4 flex items-center gap-3"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm italic text-muted-foreground">
                  &quot;Finally, no more spreadsheets for our trip expenses!&quot;
                </p>
                <p className="text-xs text-muted-foreground">— Sarah M., Frequent Traveler</p>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Column - Stats Cards */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            {/* Main Visual Card */}
            <div className="relative mx-auto aspect-square max-w-md rounded-3xl border border-border/50 bg-card/50 p-8 backdrop-blur-sm">
              {/* Decorative circles */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-64 w-64 rounded-full border border-primary/20" />
                <div className="absolute h-48 w-48 rounded-full border border-primary/30" />
                <div className="absolute h-32 w-32 rounded-full border border-primary/40" />
                <div className="absolute h-16 w-16 rounded-full bg-primary/20" />
              </div>

              {/* Floating Stats Cards */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="absolute -left-4 top-8 rounded-xl border border-border bg-card p-4 shadow-lg sm:left-0"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">GROUPS</p>
                    <p className="text-xl font-bold">10K+</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="absolute -right-4 top-1/3 rounded-xl border border-border bg-card p-4 shadow-lg sm:right-0"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20">
                    <Receipt className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">TRACKED</p>
                    <p className="text-xl font-bold">$2M+</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                className="absolute bottom-8 left-1/4 rounded-xl border border-border bg-card p-4 shadow-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20">
                    <Star className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">RATING</p>
                    <p className="text-xl font-bold">4.9/5</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Bottom Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-16 flex items-center justify-center gap-4"
        >
          <span className="text-sm text-muted-foreground">Meet Settle Up.</span>
          <div className="h-2 w-2 rounded-full bg-primary" />
          <span className="text-sm text-muted-foreground">
            The smart way to split expenses with groups, track every payment, and settle up instantly.
          </span>
        </motion.div>
      </div>
    </section>
  )
}
