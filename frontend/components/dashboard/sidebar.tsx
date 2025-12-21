"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Users,
  List,
  Receipt,
  BarChart3,
  Settings,
} from "lucide-react"

const navItems = [
  { label: "Groups", href: "/dashboard/groups", icon: Users },
  { label: "Activity Feed", href: "/dashboard/activity", icon: List },
  { label: "Expenses", href: "/dashboard/expenses", icon: Receipt },
  { label: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
]

export function DashboardSidebar() {
  const pathname = usePathname()

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-white/10 bg-black/60 backdrop-blur-md">
      {/* Logo */}
      <div className="flex h-16 items-center px-6 text-xl font-bold text-white">
        Settle Up
      </div>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col gap-1 px-3 py-4">
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
    </aside>
  )
}
