"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"

const navLinks = [
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How It Works" },
  { href: "#faq", label: "FAQ" },
]

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <motion.header
      initial={{ y: -100, opacity: 0, x: "-50%" }}
      animate={{ y: 0, opacity: 1, x: "-50%" }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="fixed top-6 left-1/2 z-50 w-[95%] max-w-6xl rounded-2xl border border-white/10 bg-black/40 backdrop-blur-md overflow-hidden"
      style={{
        backgroundImage:
          "radial-gradient(circle at 50% 0%, rgba(34, 197, 94, 0.15) 0%, transparent 80%)",
      }}
    >
      <div className="relative flex h-14 items-center justify-between px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center group">
          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 bg-green-500/30 blur-2xl rounded-full group-hover:bg-green-500/50 transition-all duration-500" />
            <Image
              src="/logo.png"
              alt="Settle Up Logo"
              width={56}
              height={56}
              className="relative h-12 w-12 object-contain transition-transform duration-300 group-hover:scale-105"
              priority
            />
          </div>
          <span className="text-2xl font-bold tracking-tight text-white">
            Settle Up
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-10">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-white/60 transition-colors hover:text-white"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Signup Button (Desktop) */}
        <div className="hidden md:flex items-center">
          <Button
            asChild
            className="rounded-full bg-green-500 px-5 text-sm font-semibold text-black hover:bg-green-400 transition-colors"
          >
            <Link href="/signup">Sign Up</Link>
          </Button>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden text-white"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="border-t border-white/10 bg-black/90 md:hidden"
        >
          <div className="flex flex-col gap-4 px-6 py-6">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-white/60 hover:text-white"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}

            {/* Signup Button (Mobile) */}
            <Button
              asChild
              className="mt-2 w-full rounded-full bg-green-500 text-black hover:bg-green-400"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Link href="/signup">Sign Up</Link>
            </Button>
          </div>
        </motion.div>
      )}
    </motion.header>
  )
}
