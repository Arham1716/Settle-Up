"use client"

import { motion } from "framer-motion"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

const faqs = [
  {
    question: "Is Settle Up free to use?",
    answer:
      "Yes! Settle Up is completely free for personal use. Create unlimited groups, add unlimited expenses, and settle up with friends without any cost. We may introduce premium features in the future for power users.",
  },
  {
    question: "How does the expense splitting work?",
    answer:
      "When you add an expense, you can choose who paid and who should split the cost. You can split equally among all members, by specific percentages, or by exact amounts. Settle Up automatically calculates who owes whom.",
  },
  {
    question: "Can I use Settle Up for business expenses?",
    answer:
      "While Settle Up is primarily designed for personal use among friends and family, you can certainly use it for small business expense sharing. For larger business needs, we recommend dedicated expense management solutions.",
  },
  {
    question: "How do I settle debts with my group members?",
    answer:
      "Settle Up shows you simplified balances - who owes you and who you owe. When you settle up (pay someone back or receive payment), simply mark it as settled in the app. We don't process payments directly.",
  },
  {
    question: "Is my financial data secure?",
    answer:
      "Absolutely. We use industry-standard encryption to protect your data. We never share your information with third parties, and you can delete your data at any time.",
  },
]

export function FAQSection() {
  return (
    <section id="faq" className="border-t border-border py-20 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left Column - Header */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
              Frequently
              <br />
              <span className="text-primary">Asked</span>
              <br />
              Questions
            </h2>
          </motion.div>

          {/* Right Column - Accordion */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left text-base hover:text-primary">{faq.question}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">{faq.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
