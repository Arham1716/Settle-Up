export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <p className="text-muted-foreground">
        Welcome back. Select an option from the sidebar to get started.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border border-white/10 bg-card p-6">
          <p className="text-sm text-muted-foreground">Total Groups</p>
          <p className="text-2xl font-bold">—</p>
        </div>

        <div className="rounded-xl border border-white/10 bg-card p-6">
          <p className="text-sm text-muted-foreground">Outstanding Balance</p>
          <p className="text-2xl font-bold">—</p>
        </div>

        <div className="rounded-xl border border-white/10 bg-card p-6">
          <p className="text-sm text-muted-foreground">Recent Activity</p>
          <p className="text-2xl font-bold">—</p>
        </div>
      </div>
    </div>
  )
}
