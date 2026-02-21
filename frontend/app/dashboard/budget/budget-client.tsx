"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Edit2, AlertCircle, TrendingUp, ChevronLeft } from "lucide-react";
import { GlossyButton } from "@/components/ui/glossy-button";
import { PageTitleCard } from "@/components/ui/page-title-card";
import { GlossyCardButton } from "@/components/ui/glossy-card-button";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const COLORS = ["#22c55e", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

type BudgetCategory = {
  id: string;
  name: string;
  allocatedAmount: number;
  spent?: number;
  remaining?: number;
  percentageUsed?: number;
};

type BudgetExpense = {
  id: string;
  description: string;
  amount: number;
  category: string | null;
  type: string;
  createdAt: string;
  groupName?: string;
};

type Budget = {
  id: string;
  periodStart: string;
  periodEnd: string;
  totalAmount: number;
  spent?: number;
  remaining?: number;
  percentageUsed?: number;
  categories: BudgetCategory[];
  expenses?: BudgetExpense[];
};

type BudgetAlert = {
  id: string;
  type: string;
  message: string;
  createdAt: string;
};

export default function BudgetClient() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [activeBudget, setActiveBudget] = useState<Budget | null>(null);
  const [alerts, setAlerts] = useState<BudgetAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPersonalExpenseModal, setShowPersonalExpenseModal] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [selectedBudgetId, setSelectedBudgetId] = useState<string | null>(null);
  const [selectedBudgetDetail, setSelectedBudgetDetail] = useState<Budget | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Form state
  const [periodStart, setPeriodStart] = useState("");
  const [periodEnd, setPeriodEnd] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [categories, setCategories] = useState<Array<{ name: string; allocatedAmount: string }>>([
    { name: "", allocatedAmount: "" },
  ]);

  // Personal expense form
  const [expenseDescription, setExpenseDescription] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("");
  const [expenseCategory, setExpenseCategory] = useState("");

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

  useEffect(() => {
    fetchBudgets();
    fetchActiveBudget();
    fetchAlerts();
  }, []);

  const fetchBudgets = async () => {
    try {
      const res = await fetch(`${apiUrl}/budget`, {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setBudgets(data);
      }
    } catch (err) {
      console.error("Failed to fetch budgets", err);
    }
  };

  const safeJson = async (res: Response) => {
    const text = await res.text();
    if (!text || text.trim() === "") return null;
    try {
      return JSON.parse(text);
    } catch {
      return null;
    }
  };

  const fetchActiveBudget = async () => {
    try {
      const res = await fetch(`${apiUrl}/budget/active`, {
        credentials: "include",
      });
      if (res.ok) {
        const data = await safeJson(res);
        setActiveBudget(data ?? null);
      }
    } catch (err) {
      console.error("Failed to fetch active budget", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAlerts = async () => {
    try {
      const res = await fetch(`${apiUrl}/budget/summary`, {
        credentials: "include",
      });
      if (res.ok) {
        const data = await safeJson(res);
        if (data?.recentAlerts) {
          setAlerts(data.recentAlerts);
        }
      }
    } catch (err) {
      console.error("Failed to fetch alerts", err);
    }
  };

  const handleCreateBudget = async () => {
    if (!periodStart || !periodEnd || !totalAmount) return;

    const categoriesData = categories
      .filter((cat) => cat.name && cat.allocatedAmount)
      .map((cat) => ({
        name: cat.name,
        allocatedAmount: parseFloat(cat.allocatedAmount),
      }));

    if (categoriesData.length === 0) {
      alert("Please add at least one category");
      return;
    }

    const totalCategories = categoriesData.reduce(
      (sum, cat) => sum + cat.allocatedAmount,
      0,
    );

    if (Math.abs(totalCategories - parseFloat(totalAmount)) > 0.01) {
      alert("Total amount must equal the sum of category amounts");
      return;
    }

    try {
      const res = await fetch(`${apiUrl}/budget`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          periodStart,
          periodEnd,
          totalAmount: parseFloat(totalAmount),
          categories: categoriesData,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to create budget");
      }

      setShowCreateModal(false);
      resetForm();
      await fetchBudgets();
      await fetchActiveBudget();
    } catch (err: any) {
      alert(err.message || "Failed to create budget");
    }
  };

  const handleCreatePersonalExpense = async () => {
    if (!expenseDescription || !expenseAmount) return;

    try {
      const res = await fetch(`${apiUrl}/budget/expenses/personal`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: expenseDescription,
          amount: parseFloat(expenseAmount),
          category: expenseCategory || undefined,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to create expense");
      }

      setShowPersonalExpenseModal(false);
      setExpenseDescription("");
      setExpenseAmount("");
      setExpenseCategory("");
      fetchActiveBudget();
      fetchAlerts();
    } catch (err: any) {
      alert(err.message || "Failed to create expense");
    }
  };

  const resetForm = () => {
    setPeriodStart("");
    setPeriodEnd("");
    setTotalAmount("");
    setCategories([{ name: "", allocatedAmount: "" }]);
  };

  const addCategory = () => {
    setCategories([...categories, { name: "", allocatedAmount: "" }]);
  };

  const removeCategory = (index: number) => {
    setCategories(categories.filter((_, i) => i !== index));
  };

  const updateCategory = (
    index: number,
    field: "name" | "allocatedAmount",
    value: string,
  ) => {
    const updated = [...categories];
    updated[index][field] = value;
    setCategories(updated);
  };

  const isBudgetActive = (b: Budget) => {
    const now = new Date();
    const start = new Date(b.periodStart);
    const end = new Date(b.periodEnd);
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
    return now >= start && now <= end;
  };

  const fetchBudgetDetail = async (id: string) => {
    setLoadingDetail(true);
    setSelectedBudgetId(id);
    try {
      const res = await fetch(`${apiUrl}/budget/${id}`, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setSelectedBudgetDetail(data);
      } else {
        setSelectedBudgetDetail(null);
      }
    } catch {
      setSelectedBudgetDetail(null);
    } finally {
      setLoadingDetail(false);
    }
  };

  const closeDetail = () => {
    setSelectedBudgetId(null);
    setSelectedBudgetDetail(null);
  };

  if (loading) {
    return (
      <section className="relative min-h-screen overflow-hidden pt-16">
        <div className="relative z-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <p className="text-white/60">Loading budget data...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="relative min-h-screen overflow-hidden pt-16">
      <div className="relative z-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-12">
        <PageTitleCard title="Budget Management" className="mb-6" />

        {/* Action buttons - vertical stack below title */}
        <div className="flex flex-col gap-2 mb-6 max-w-xs">
          <GlossyButton onClick={() => setShowPersonalExpenseModal(true)} className="w-full justify-center">
            <Plus className="h-4 w-4 mr-2" />
            Add Personal Expense
          </GlossyButton>
          <GlossyButton onClick={() => setShowCreateModal(true)} className="w-full justify-center">
            <Plus className="h-4 w-4 mr-2" />
            Create Budget
          </GlossyButton>
        </div>

        {/* Alerts */}
        {alerts.length > 0 && (
          <div className="mb-6 space-y-2">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-200 flex items-center gap-2"
              >
                <AlertCircle className="h-4 w-4" />
                {alert.message}
              </div>
            ))}
          </div>
        )}

        {/* Budget detail view (when a budget is selected) */}
        {selectedBudgetId ? (
          <div className="space-y-6">
            {loadingDetail ? (
              <p className="text-white/60">Loading budget details...</p>
            ) : selectedBudgetDetail ? (
              <>
                <GlossyButton onClick={closeDetail} className="gap-2">
                  <ChevronLeft className="h-4 w-4" />
                  Back to budgets
                </GlossyButton>

                <div className="rounded-xl border border-white/10 bg-black/40 p-6 shadow-lg backdrop-blur-sm relative">
                  {/* Spending bar - top right, rounded */}
                  <div className="absolute top-4 right-4 text-right">
                    <div className="text-sm text-white/70 mb-1">
                      {(selectedBudgetDetail.percentageUsed ?? 0).toFixed(0)}%
                    </div>
                    <div className="w-28 h-2.5 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          (selectedBudgetDetail.percentageUsed ?? 0) >= 100
                            ? "bg-red-500"
                            : (selectedBudgetDetail.percentageUsed ?? 0) >= 80
                            ? "bg-yellow-500"
                            : "bg-green-500"
                        }`}
                        style={{
                          width: `${Math.min(selectedBudgetDetail.percentageUsed ?? 0, 100)}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="pr-32">
                    <h2 className="text-lg font-semibold text-white mb-1">Budget plan</h2>
                    <p className="text-sm text-white/60 mb-4">
                      {new Date(selectedBudgetDetail.periodStart).toLocaleDateString()} –{" "}
                      {new Date(selectedBudgetDetail.periodEnd).toLocaleDateString()}
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div>
                        <p className="text-sm text-white/60 mb-1">Total budget</p>
                        <p className="text-xl font-bold text-white tabular-nums">
                          ${selectedBudgetDetail.totalAmount.toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-white/60 mb-1">Spent</p>
                        <p className="text-xl font-bold text-green-400 tabular-nums">
                          ${(selectedBudgetDetail.spent ?? 0).toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-white/60 mb-1">Remaining</p>
                        <p className="text-xl font-bold text-white tabular-nums">
                          ${(selectedBudgetDetail.remaining ?? selectedBudgetDetail.totalAmount).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <h3 className="text-base font-semibold text-white mt-6 mb-2">Spending in this period</h3>
                  {selectedBudgetDetail.expenses && selectedBudgetDetail.expenses.length > 0 ? (
                    <ul className="space-y-2">
                      {selectedBudgetDetail.expenses.map((ex) => (
                        <li
                          key={ex.id}
                          className="flex justify-between items-center rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm"
                        >
                          <div>
                            <span className="text-white font-medium">{ex.description}</span>
                            {ex.category && (
                              <span className="ml-2 text-white/50">({ex.category})</span>
                            )}
                            {ex.groupName && (
                              <span className="ml-2 text-white/40 text-xs">Group: {ex.groupName}</span>
                            )}
                          </div>
                          <span className="text-white tabular-nums">${ex.amount.toFixed(2)}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-white/50 text-sm">No expenses recorded in this period yet.</p>
                  )}
                </div>
              </>
            ) : (
              <div>
                <GlossyButton onClick={closeDetail}>Back</GlossyButton>
                <p className="text-white/60 mt-4">Could not load budget.</p>
              </div>
            )}
          </div>
        ) : budgets.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-black/40 p-12 text-center">
            <TrendingUp className="h-12 w-12 text-white/40 mx-auto mb-4" />
            <p className="text-white/60 mb-4">No budgets yet</p>
            <GlossyButton onClick={() => setShowCreateModal(true)}>
              Create your first budget
            </GlossyButton>
          </div>
        ) : (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-white">Your budgets</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {budgets.map((budget) => {
                const spent = budget.spent ?? 0;
                const total = budget.totalAmount ?? 0;
                const pct = total > 0 ? Math.min((spent / total) * 100, 100) : 0;
                const active = isBudgetActive(budget);
                return (
                  <GlossyCardButton
                    key={budget.id}
                    onClick={() => fetchBudgetDetail(budget.id)}
                    className="relative p-5 text-left"
                  >
                    {/* Spending bar - top right, rounded */}
                    <div className="absolute top-3 right-3 text-right">
                      <div className="text-xs text-white/70 whitespace-nowrap">
                        {pct.toFixed(0)}%
                      </div>
                      <div className="w-16 h-2 bg-white/10 rounded-full overflow-hidden mt-0.5">
                        <div
                          className={`h-full rounded-full transition-all ${
                            pct >= 100 ? "bg-red-500" : pct >= 80 ? "bg-yellow-500" : "bg-green-500"
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>

                    <div className="pr-20">
                      {active && (
                        <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-green-500/20 text-green-400 border border-green-400/30 mb-2">
                          Active
                        </span>
                      )}
                      <p className="text-sm text-white/60">
                        {new Date(budget.periodStart).toLocaleDateString()} –{" "}
                        {new Date(budget.periodEnd).toLocaleDateString()}
                      </p>
                      <p className="text-lg font-semibold text-white mt-1">
                        ${total.toFixed(2)} total
                      </p>
                      <p className="text-sm text-white/50 mt-1">
                        ${spent.toFixed(2)} spent
                      </p>
                    </div>
                  </GlossyCardButton>
                );
              })}
            </div>
          </div>
        )}

        {/* Create Budget Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-black/90 border border-white/10 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-semibold text-white mb-4">
                Create New Budget
              </h2>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-white/80 mb-1">
                      Period Start
                    </label>
                    <input
                      type="date"
                      value={periodStart}
                      onChange={(e) => setPeriodStart(e.target.value)}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-white/80 mb-1">
                      Period End
                    </label>
                    <input
                      type="date"
                      value={periodEnd}
                      onChange={(e) => setPeriodEnd(e.target.value)}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-white/80 mb-1">
                    Total Amount
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={totalAmount}
                    onChange={(e) => setTotalAmount(e.target.value)}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm text-white/80">Categories</label>
                    <GlossyButton onClick={addCategory} className="text-xs py-1">
                      Add Category
                    </GlossyButton>
                  </div>
                  <div className="space-y-2">
                    {categories.map((cat, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          value={cat.name}
                          onChange={(e) =>
                            updateCategory(index, "name", e.target.value)
                          }
                          className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                          placeholder="Category name"
                        />
                        <input
                          type="number"
                          step="0.01"
                          value={cat.allocatedAmount}
                          onChange={(e) =>
                            updateCategory(index, "allocatedAmount", e.target.value)
                          }
                          className="w-32 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                          placeholder="Amount"
                        />
                        {categories.length > 1 && (
                          <button
                            onClick={() => removeCategory(index)}
                            className="px-3 py-2 text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 justify-end pt-4">
                  <GlossyButton
                    onClick={() => {
                      setShowCreateModal(false);
                      resetForm();
                    }}
                  >
                    Cancel
                  </GlossyButton>
                  <GlossyButton onClick={handleCreateBudget}>Create Budget</GlossyButton>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Personal Expense Modal */}
        {showPersonalExpenseModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-black/90 border border-white/10 rounded-xl p-6 max-w-md w-full">
              <h2 className="text-xl font-semibold text-white mb-4">
                Add Personal Expense
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-white/80 mb-1">
                    Description
                  </label>
                  <input
                    type="text"
                    value={expenseDescription}
                    onChange={(e) => setExpenseDescription(e.target.value)}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                    placeholder="Expense description"
                  />
                </div>

                <div>
                  <label className="block text-sm text-white/80 mb-1">Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    value={expenseAmount}
                    onChange={(e) => setExpenseAmount(e.target.value)}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm text-white/80 mb-1">
                    Category (optional)
                  </label>
                  <input
                    type="text"
                    value={expenseCategory}
                    onChange={(e) => setExpenseCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                    placeholder="Food, Transport, Bills, etc."
                  />
                </div>

                <div className="flex gap-2 justify-end pt-4">
                  <GlossyButton
                    onClick={() => {
                      setShowPersonalExpenseModal(false);
                      setExpenseDescription("");
                      setExpenseAmount("");
                      setExpenseCategory("");
                    }}
                  >
                    Cancel
                  </GlossyButton>
                  <GlossyButton onClick={handleCreatePersonalExpense}>
                    Add Expense
                  </GlossyButton>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
