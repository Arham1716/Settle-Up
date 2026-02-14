"use client";

import { useEffect, useState } from "react";
import { SectionHeader } from "@/components/ui/section-header";
import { GlossyButton } from "@/components/ui/glossy-button";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  TooltipProps,
} from "recharts";

type TimelineOption = "1week" | "1month" | "3months" | "6months" | "1year" | "2years" | "4years";

const COLORS = ["#22c55e", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

const CHART_GRADIENTS = {
  area: "url(#areaGradient)",
  bar: "url(#barGradient)",
};

function ChartTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-white/10 bg-black/80 px-4 py-3 shadow-xl backdrop-blur-sm">
      {label && <p className="mb-1 text-xs font-medium text-white/70">{label}</p>}
      {payload.map((entry, i) => (
        <p key={i} className="text-sm font-semibold text-white">
          {typeof entry.value === "number" ? entry.value.toFixed(2) : entry.value}
        </p>
      ))}
    </div>
  );
}

function PieTooltip({
  active,
  payload,
  total,
}: TooltipProps<number, string> & { total: number }) {
  if (!active || !payload?.length || total <= 0) return null;
  const item = payload[0].payload as { group: string; amount: number };
  const value = (payload[0].value as number) ?? item.amount;
  const pct = (value / total) * 100;
  return (
    <div className="rounded-lg border border-white/10 bg-black/80 px-4 py-3 shadow-xl backdrop-blur-sm">
      <p className="text-sm font-medium text-white">{item.group}</p>
      <p className="text-xs text-white/70">{value.toFixed(2)} ({pct.toFixed(1)}%)</p>
    </div>
  );
}

export default function AnalyticsPage() {
  const [timeline, setTimeline] = useState<TimelineOption>("1week");
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<{
    dailyExpenses: Array<{ date: string; amount: number }>;
    groupExpenses: Array<{ group: string; amount: number }>;
    monthlyExpenses: Array<{ month: string; amount: number }>;
    paymentsDone: number;
    paymentsDue: number;
    totalExpenses: number;
  } | null>(null);

  const getDateRange = (option: TimelineOption) => {
    const end = new Date();
    const start = new Date();

    switch (option) {
      case "1week":
        start.setDate(end.getDate() - 7);
        break;
      case "1month":
        start.setMonth(end.getMonth() - 1);
        break;
      case "3months":
        start.setMonth(end.getMonth() - 3);
        break;
      case "6months":
        start.setMonth(end.getMonth() - 6);
        break;
      case "1year":
        start.setFullYear(end.getFullYear() - 1);
        break;
      case "2years":
        start.setFullYear(end.getFullYear() - 2);
        break;
      case "4years":
        start.setFullYear(end.getFullYear() - 4);
        break;
    }

    return {
      startDate: start.toISOString().split("T")[0],
      endDate: end.toISOString().split("T")[0],
    };
  };

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
      const { startDate, endDate } = getDateRange(timeline);
      const res = await fetch(
        `${apiUrl}/analytics/expenses?startDate=${startDate}&endDate=${endDate}`,
        { credentials: "include" }
      );

      if (!res.ok) throw new Error("Failed to load analytics");

      const data = await res.json();
      setAnalytics(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeline]);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-white/60">Loading analytics...</p>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-white/60">No analytics data available</p>
      </div>
    );
  }

  return (
    <section className="relative min-h-screen overflow-hidden pt-6">
      <main className="relative z-10 flex-1 overflow-hidden">
        <section className="pt-16 px-4 max-w-7xl mx-auto pb-12">
          <SectionHeader className="mb-6 text-center">
            <h1>Analytics</h1>
            <p>Track your expenses and payments</p>
          </SectionHeader>

          {/* Timeline Selection */}
          <div className="mb-8 flex flex-wrap gap-2 justify-center">
            {(["1week", "1month", "3months", "6months", "1year", "2years", "4years"] as TimelineOption[]).map(
              (option) => (
                <GlossyButton
                  key={option}
                  onClick={() => setTimeline(option)}
                  className={timeline === option ? "bg-green-500/20 ring-1 ring-green-400/30" : ""}
                >
                  {option === "1week" && "1 Week"}
                  {option === "1month" && "1 Month"}
                  {option === "3months" && "3 Months"}
                  {option === "6months" && "6 Months"}
                  {option === "1year" && "1 Year"}
                  {option === "2years" && "2 Years"}
                  {option === "4years" && "4 Years"}
                </GlossyButton>
              )
            )}
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="rounded-xl border border-white/10 bg-black/40 p-5 text-white shadow-lg backdrop-blur-sm transition hover:border-white/20">
              <p className="text-sm text-white/60 mb-1">Total Expenses</p>
              <p className="text-2xl font-bold tabular-nums">{analytics.totalExpenses.toFixed(2)}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/40 p-5 text-white shadow-lg backdrop-blur-sm transition hover:border-green-400/20">
              <p className="text-sm text-white/60 mb-1">Payments Done</p>
              <p className="text-2xl font-bold text-green-400 tabular-nums">{analytics.paymentsDone.toFixed(2)}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/40 p-5 text-white shadow-lg backdrop-blur-sm transition hover:border-red-400/20">
              <p className="text-sm text-white/60 mb-1">Payments Due</p>
              <p className="text-2xl font-bold text-red-400 tabular-nums">{analytics.paymentsDue.toFixed(2)}</p>
            </div>
          </div>

          {/* Daily Expenses – Area + Line */}
          <div className="mb-8 rounded-xl border border-white/10 bg-black/40 p-6 shadow-lg backdrop-blur-sm">
            <h2 className="text-lg font-semibold text-white mb-4">Daily Expenses</h2>
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={analytics.dailyExpenses} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22c55e" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff12" vertical={false} />
                <XAxis dataKey="date" stroke="#ffffff50" tick={{ fill: "#94a3b8", fontSize: 12 }} />
                <YAxis stroke="#ffffff50" tick={{ fill: "#94a3b8", fontSize: 12 }} tickFormatter={(v) => `${v}`} />
                <Tooltip content={<ChartTooltip />} cursor={{ stroke: "#22c55e40", strokeWidth: 1 }} />
                <Area
                  type="monotone"
                  dataKey="amount"
                  fill={CHART_GRADIENTS.area}
                  stroke="none"
                  isAnimationActive
                  animationDuration={600}
                  animationEasing="ease-out"
                />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke="#22c55e"
                  strokeWidth={2}
                  dot={{ fill: "#22c55e", strokeWidth: 0, r: 3 }}
                  activeDot={{ r: 5, fill: "#22c55e", stroke: "#fff", strokeWidth: 2 }}
                  isAnimationActive
                  animationDuration={600}
                  animationEasing="ease-out"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Monthly Comparison Bar Chart */}
            <div className="rounded-xl border border-white/10 bg-black/40 p-6 shadow-lg backdrop-blur-sm">
              <h2 className="text-lg font-semibold text-white mb-4">Monthly Comparison</h2>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={analytics.monthlyExpenses} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#34d399" />
                      <stop offset="100%" stopColor="#22c55e" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff12" vertical={false} />
                  <XAxis dataKey="month" stroke="#ffffff50" tick={{ fill: "#94a3b8", fontSize: 12 }} />
                  <YAxis stroke="#ffffff50" tick={{ fill: "#94a3b8", fontSize: 12 }} />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: "#ffffff08" }} />
                  <Bar
                    dataKey="amount"
                    fill={CHART_GRADIENTS.bar}
                    name="Amount"
                    radius={[6, 6, 0, 0]}
                    isAnimationActive
                    animationDuration={500}
                    animationEasing="ease-out"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Expenses by Group Pie Chart */}
            <div className="rounded-xl border border-white/10 bg-black/40 p-6 shadow-lg backdrop-blur-sm">
              <h2 className="text-lg font-semibold text-white mb-4">Expenses by Group</h2>
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie
                    data={analytics.groupExpenses}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="amount"
                    nameKey="group"
                    isAnimationActive
                    animationDuration={500}
                    animationEasing="ease-out"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={{ stroke: "#94a3b8", strokeWidth: 1 }}
                  >
                    {analytics.groupExpenses.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                        stroke="rgba(0,0,0,0.2)"
                        strokeWidth={1}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    content={<PieTooltip total={analytics.groupExpenses.reduce((s, g) => s + g.amount, 0)} />}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>
      </main>
    </section>
  );
}
