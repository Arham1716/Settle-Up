import type React from "react";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import GradientLayer from "@/components/ui/gradients";
import { FcmProvider } from "../components/FcmProvider";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      <FcmProvider />
      <DashboardSidebar />
      <main id="dashboard-scroll" className="relative flex-1 overflow-y-auto">
        <GradientLayer scrollContainerId="dashboard-scroll" />
        <div className="relative mx-auto max-w-4xl px-4 ">
          {children}
        </div>
      </main>
    </div>
  );
}
