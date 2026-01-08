"use client";

import { useEffect, useState } from "react";
import { SectionHeader } from "@/components/ui/section-header";
import { GlossyButton } from "@/components/ui/glossy-button";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

type TimelineOption = "1week" | "1month" | "3months" | "6months" | "1year" | "2years" | "4years";

const COLORS = ["#22c55e", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

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
      const { startDate, endDate } = getDateRange(timeline);
      const res = await fetch(
        `http://localhost:3000/analytics/expenses?startDate=${startDate}&endDate=${endDate}`,
        {
          credentials: "include",
        }
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
    return <p className="text-white/60">Loading analytics...</p>;
  }

  if (!analytics) {
    return <p className="text-white/60">No analytics data available</p>;
  }

  return (
    <section className="relative min-h-screen overflow-hidden pt-6">
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-[radial-gradient(ellipse_at_center,_rgba(34,197,94,0.3)_0%,_rgba(34,197,94,0.1)_30%,_transparent_70%)]" />
      <div className="pointer-events-none absolute top-0 right-0 w-[600px] h-[600px] bg-[radial-gradient(ellipse_at_top_right,_rgba(34,197,94,0.15)_0%,_transparent_60%)]" />

      <main className="relative z-10 flex-1 overflow-hidden">
        <section className="pt-16 px-4 max-w-7xl mx-auto">
          <SectionHeader className="mb-6 text-center">
            <h1>Analytics</h1>
            <p>Track your expenses and payments</p>
          </SectionHeader>

          {/* Timeline Selection */}
          <div className="mb-6 flex flex-wrap gap-2 justify-center">
            {(["1week", "1month", "3months", "6months", "1year", "2years", "4years"] as TimelineOption[]).map(
              (option) => (
                <GlossyButton
                  key={option}
                  onClick={() => setTimeline(option)}
                  className={timeline === option ? "bg-green-500/20" : ""}
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
            <div className="rounded-md bg-black/40 p-4 text-white">
              <p className="text-sm text-white/60 mb-1">Total Expenses</p>
              <p className="text-2xl font-bold">{analytics.totalExpenses.toFixed(2)}</p>
            </div>
            <div className="rounded-md bg-black/40 p-4 text-white">
              <p className="text-sm text-white/60 mb-1">Payments Done</p>
              <p className="text-2xl font-bold text-green-400">{analytics.paymentsDone.toFixed(2)}</p>
            </div>
            <div className="rounded-md bg-black/40 p-4 text-white">
              <p className="text-sm text-white/60 mb-1">Payments Due</p>
              <p className="text-2xl font-bold text-red-400">{analytics.paymentsDue.toFixed(2)}</p>
            </div>
          </div>

          {/* Daily Expenses Line Chart */}
          <div className="mb-8 rounded-md bg-black/40 p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Daily Expenses</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.dailyExpenses}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                <XAxis dataKey="date" stroke="#ffffff60" />
                <YAxis stroke="#ffffff60" />
                <Tooltip
                  contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151", color: "#fff" }}
                />
                <Legend />
                <Line type="monotone" dataKey="amount" stroke="#22c55e" strokeWidth={2} name="Amount" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Monthly Comparison Bar Chart */}
            <div className="rounded-md bg-black/40 p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Monthly Comparison</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.monthlyExpenses}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                  <XAxis dataKey="month" stroke="#ffffff60" />
                  <YAxis stroke="#ffffff60" />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151", color: "#fff" }}
                  />
                  <Legend />
                  <Bar dataKey="amount" fill="#22c55e" name="Amount" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Expenses by Group Pie Chart */}
            <div className="rounded-md bg-black/40 p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Expenses by Group</h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analytics.groupExpenses}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ group, percent }) => `${group} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="amount"
                  >
                    {analytics.groupExpenses.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151", color: "#fff" }}
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

