import type React from "react"
import { DashboardSidebar } from "@/components/dashboard/sidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      <DashboardSidebar />

      {/* Main content */}
      <main className="flex-1 overflow-y-auto ">
        {children}
      </main>
    </div>
  )
}
