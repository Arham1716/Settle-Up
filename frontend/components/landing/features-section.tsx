"use client"

import { motion } from "framer-motion"
import Image from "next/image"

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 },
  },
}

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Features</h2>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 gap-4 md:grid-cols-2"
        >
          {/* Left Column - Tall card spanning 2 rows */}
          <motion.div
            variants={itemVariants}
            className="group relative row-span-2 overflow-hidden rounded-2xl bg-[#1a1a1a] min-h-[500px] md:min-h-[600px]"
          >
            {/* Background image */}
            <div className="absolute inset-0">
              <Image
                src="/friends-splitting-dinner-bill-at-restaurant--happy.jpg"
                alt="Create Groups"
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              {/* Gradient overlay for text readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            </div>

            {/* Text content */}
            <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
              <h3 className="text-2xl font-semibold text-white sm:text-3xl">Create Groups</h3>
              <p className="mt-2 text-sm text-gray-300 sm:text-base">
                Organize expenses for roommates, trips, family dinners, or any shared activity with ease.
              </p>
            </div>
          </motion.div>

          {/* Right Column - Top card */}
          <motion.div
            variants={itemVariants}
            className="group relative flex flex-col overflow-hidden rounded-2xl bg-[#1a1a1a] p-6 sm:p-8"
          >
            {/* Green glow circle decoration */}
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />

            <div className="relative z-10 flex flex-1 flex-col">
              <h3 className="text-xl font-semibold text-white sm:text-2xl">
                Real-time
                <br />
                Balance Updates
              </h3>
              <p className="mt-3 text-sm text-gray-400">
                See who owes what instantly. Track balances across all your groups with live updates as expenses are
                added.
              </p>
            </div>

            {/* Visual element - person with headphones style visual */}
            <div className="relative mt-6 flex justify-end">
              <div className="relative h-32 w-32 sm:h-40 sm:w-40">
                {/* Concentric circles */}
                <div className="absolute inset-0 rounded-full border-2 border-primary/30" />
                <div className="absolute inset-4 rounded-full border-2 border-primary/50" />
                <div className="absolute inset-8 rounded-full bg-primary/20" />
                <Image
                  src="/person-checking-phone-expense-app--side-profile-si.jpg"
                  alt="Real-time updates"
                  fill
                  className="rounded-full object-cover"
                />
              </div>
            </div>
          </motion.div>

          {/* Right Column - Bottom card */}
          <motion.div
            variants={itemVariants}
            className="group relative overflow-hidden rounded-2xl bg-[#1a1a1a] p-6 sm:p-8"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              {/* Phone mockup */}
              <div className="relative flex-shrink-0">
                <div className="relative h-48 w-36 overflow-hidden rounded-2xl border border-white/10 bg-black sm:h-56 sm:w-44">
                  {/* Phone screen content */}
                  <div className="absolute inset-2 rounded-xl bg-[#0a0a0a]">
                    {/* Status bar */}
                    <div className="flex items-center justify-between px-3 py-2 text-[10px] text-white">
                      <span>8:15</span>
                      <div className="flex items-center gap-1">
                        <span>●●●</span>
                        <span>📶</span>
                      </div>
                    </div>
                    {/* App preview */}
                    <div className="px-3">
                      <Image
                        src="/expense-tracking-app-screenshot-showing-balance-su.jpg"
                        alt="App preview"
                        width={140}
                        height={180}
                        className="rounded-lg"
                      />
                    </div>
                  </div>
                </div>

                {/* Stats badge */}
                <div className="absolute -bottom-2 -right-2 flex items-center gap-2 rounded-xl border border-white/10 bg-[#1a1a1a] px-3 py-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20">
                    <span className="text-xs text-primary">📊</span>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400">SAVINGS</p>
                    <p className="text-sm font-bold text-white">32%</p>
                  </div>
                </div>
              </div>

              {/* Text content */}
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-white sm:text-2xl">Smart Analytics</h3>
                <p className="mt-2 text-sm text-gray-400">
                  Every expense is tracked and categorized, so you can review spending patterns and optimize your group
                  finances.
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
