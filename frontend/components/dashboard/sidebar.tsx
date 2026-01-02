"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  Users,
  List,
  Receipt,
  BarChart3,
  Settings,
} from "lucide-react"
import { GlossyButton } from "@/components/ui/glossy-button" // make sure this path is correct

const navItems = [
  { label: "Groups", href: "/dashboard/groups", icon: Users },
  { label: "Activity Feed", href: "/dashboard/activity", icon: List },
  { label: "Expenses", href: "/dashboard/expenses", icon: Receipt },
  { label: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
]

export function DashboardSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<{ name?: string; email: string } | null>(null)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"
        const res = await fetch(`${apiUrl}/auth/me`, { credentials: "include" })
        if (!res.ok) return setUser(null)
        const data = await res.json()
        setUser(data)
      } catch (err) {
        console.error("Failed to fetch user", err)
        setUser(null)
      }
    }
    fetchUser()
  }, [])

  const handleLogout = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"
      await fetch(`${apiUrl}/auth/logout`, { method: "POST", credentials: "include" })
      // Redirect to login after logout
      router.replace("/login")
    } catch (err) {
      console.error("Logout failed", err)
    }
  }

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-white/10 bg-black/60 backdrop-blur-md px-4 py-4">
      {/* Logo */}
      <div className="flex h-16 items-center text-xl font-bold text-white">
        Settle Up
      </div>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col gap-1 mt-4">
        {navItems.map((item) => {
          const active = pathname.startsWith(item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors
                ${
                  active
                    ? "bg-green-500/15 text-green-400"
                    : "text-white/60 hover:bg-white/5 hover:text-white"
                }
              `}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Current user and logout button */}
      {user && (
  <div className="mt-auto border-t border-white/10 pt-4 px-8 flex flex-col items-center gap-3">
    <div className="text-md text-white/80 text-center pb-2">
      {user.name || user.email}
    </div>
    <GlossyButton onClick={handleLogout} className="w-full">
      Log out
    </GlossyButton>
  </div>
)}
    </aside>
  )
}
