"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState, useCallback } from "react"
import {
  Users,
  List,
  Receipt,
  BarChart3,
  Settings,
  LayoutDashboard,
} from "lucide-react"
import { GlossyButton } from "@/components/ui/glossy-button"

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
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
  const [unseenCount, setUnseenCount] = useState<number>(0)

  const fetchUnseenCount = useCallback(async () => {
    try {
      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"

      const res = await fetch(`${apiUrl}/activity/unseen-count`, {
        credentials: "include",
      })

      if (!res.ok) {
        return
      }

      const data = await res.json()
      setUnseenCount(data.count ?? 0)
    } catch (err) {
      console.error("Failed to fetch unseen activity count", err)
    }
  }, [])

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"

        const res = await fetch(`${apiUrl}/auth/me`, {
          credentials: "include",
        })

        if (!res.ok) {
          setUser(null)
          return
        }

        const data = await res.json()
        setUser(data)
      } catch (err) {
        console.error("Failed to fetch user", err)
        setUser(null)
      }
    }

    fetchUser()
  }, [])

  // Refetch unseen count on pathname change and when activity page marks all as seen
  useEffect(() => {
    fetchUnseenCount()
    if (pathname === "/dashboard/activity") {
      const t = setTimeout(fetchUnseenCount, 800)
      return () => clearTimeout(t)
    }
  }, [pathname, fetchUnseenCount])

  useEffect(() => {
    const onMarkedSeen = () => fetchUnseenCount()
    window.addEventListener("activity-marked-seen", onMarkedSeen)
    return () => window.removeEventListener("activity-marked-seen", onMarkedSeen)
  }, [fetchUnseenCount])

  const handleLogout = async () => {
    try {
      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"

      await fetch(`${apiUrl}/auth/logout`, {
        method: "POST",
        credentials: "include",
      })

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
          const active =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href)

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
              <span className="flex items-center gap-2">
                {item.label}
                {item.href === "/dashboard/activity" && unseenCount > 0 && (
                  <span
                    className="ml-1 inline-flex h-5 min-w-[1.25rem] flex-shrink-0 items-center justify-center rounded-full bg-green-500 px-1 text-[10px] font-semibold text-white"
                    aria-label={`${unseenCount} unread notifications`}
                  >
                    {unseenCount}
                  </span>
                )}
              </span>
            </Link>
          )
        })}
      </nav>

      {/* Current user + logout */}
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
