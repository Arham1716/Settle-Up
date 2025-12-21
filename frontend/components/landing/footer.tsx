"use client"
import Image from "next/image"
import { motion } from "framer-motion"
import { Github, Twitter, Linkedin } from "lucide-react"

const socialLinks = [
  { icon: Twitter, href: "#", label: "Twitter" },
  { icon: Github, href: "#", label: "GitHub" },
  { icon: Linkedin, href: "#", label: "LinkedIn" },
]

export function Footer() {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="border-t border-border py-12"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-8 sm:flex-row">
          {/* Logo and Tagline */}
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="Settle Up Logo" width={48} height={48} className="h-12 w-12" />
            <div>
              <h3 className="text-2xl font-bold">Settle Up</h3>
              <p className="text-sm text-muted-foreground">Split. Settle. Live Easy.</p>
            </div>
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-4">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                aria-label={social.label}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-border transition-colors hover:border-primary hover:text-primary"
              >
                <social.icon className="h-5 w-5" />
              </a>
            ))}
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 border-t border-border pt-8 text-center">
          <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} Settle Up. All rights reserved.</p>
        </div>
      </div>
    </motion.footer>
  )
}
