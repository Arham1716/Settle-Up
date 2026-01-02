"use client";

import { useRouter } from "next/navigation";
import { GlossyCardButton } from "@/components/ui/glossy-card-button";

export default function DashboardPage() {
  const router = useRouter();

  // Example data (replace with API fetch later)
  const totalGroups = 5;
  const outstandingBalance = 120.5;
  const recentActivity = 3;

  return (
    <section className="relative min-h-screen overflow-hidden pt-16">
      {/* Primary green radial gradient */}
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-[radial-gradient(ellipse_at_center,_rgba(34,197,94,0.3)_0%,_rgba(34,197,94,0.1)_30%,_transparent_70%)]" />

      {/* Secondary subtle gradient */}
      <div className="pointer-events-none absolute top-0 right-0 w-[600px] h-[600px] bg-[radial-gradient(ellipse_at_top_right,_rgba(34,197,94,0.15)_0%,_transparent_60%)]" />

      {/* Content */}
      <div className="relative z-10 flex flex-col gap-4 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>

        <p className="text-white/60">
          Welcome back. Select an option from the sidebar to get started.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Total Groups */}
          <GlossyCardButton onClick={() => router.push("/dashboard/groups")}>
            <p className="text-sm text-white/60">Total Groups</p>
            <p className="text-2xl font-bold text-white">{totalGroups}</p>
          </GlossyCardButton>

          {/* Outstanding Balance */}
          <GlossyCardButton onClick={() => router.push("/dashboard/expenses")}>
            <p className="text-sm text-white/60">Outstanding Balance</p>
            <p className="text-2xl font-bold text-white">
              ${outstandingBalance.toFixed(2)}
            </p>
          </GlossyCardButton>

          {/* Recent Activity */}
          <GlossyCardButton onClick={() => router.push("/dashboard/activity")}>
            <p className="text-sm text-white/60">Recent Activity</p>
            <p className="text-2xl font-bold text-white">{recentActivity}</p>
          </GlossyCardButton>
        </div>
      </div>
    </section>
  );
}
