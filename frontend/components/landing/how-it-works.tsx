"use client"

import { motion } from "framer-motion"
import { UserPlus, FolderPlus, Receipt, CheckCircle } from "lucide-react"

const steps = [
  {
    icon: UserPlus,
    step: "01",
    title: "Sign Up",
    description: "Create your free account in seconds. No credit card required.",
  },
  {
    icon: FolderPlus,
    step: "02",
    title: "Create a Group",
    description: "Set up a group for your roommates, trip, or any shared expense situation.",
  },
  {
    icon: Receipt,
    step: "03",
    title: "Add Expenses",
    description: "Log expenses as they happen. Assign who paid and who should split the cost.",
  },
  {
    icon: CheckCircle,
    step: "04",
    title: "Settle Up",
    description: "See the simplified balances and settle debts with minimal transactions.",
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="border-t border-border py-20 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-16 text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">How It Works</h2>
          <p className="mt-4 text-muted-foreground">Get started in minutes. No complicated setup required.</p>
        </motion.div>

        {/* Steps */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative"
            >
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="absolute left-1/2 top-12 hidden h-0.5 w-full bg-border lg:block" />
              )}

              <div className="relative flex flex-col items-center text-center">
                {/* Step Number */}
                <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-full border border-border bg-card">
                  <div className="flex flex-col items-center">
                    <step.icon className="mb-1 h-8 w-8 text-primary" />
                    <span className="text-xs font-medium text-muted-foreground">{step.step}</span>
                  </div>
                </div>

                <h3 className="mb-2 text-lg font-semibold">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
