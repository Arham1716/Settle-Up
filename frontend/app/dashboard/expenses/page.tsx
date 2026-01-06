"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { GlossyButton } from "@/components/ui/glossy-button";
import { SectionHeader } from "@/components/ui/section-header";
import { Plus, Trash2 } from "lucide-react";

type Expense = {
  id: string;
  description: string;
  amount: number;
  paidBy: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
};

type Group = {
  id: string;
  name: string;
  currency: string;
  members: Array<{
    id: string;
    name: string;
    email: string;
  }>;
};

export default function ExpensesPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const groupId = searchParams.get("groupId");

  const [group, setGroup] = useState<Group | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [paidById, setPaidById] = useState("");

  // Fetch expenses
  const fetchExpenses = async () => {
    if (!groupId) return;

    try {
      const res = await fetch(
        `http://localhost:3000/groups/${groupId}/expenses`,
        {
          credentials: "include",
        }
      );

      if (!res.ok) throw new Error("Failed to load expenses");

      const data = await res.json();
      setExpenses(data);
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch group info
  const fetchGroup = async () => {
    if (!groupId) return;

    try {
      const res = await fetch(`http://localhost:3000/groups/${groupId}`, {
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to load group");

      const data = await res.json();
      setGroup({
        id: data.id,
        name: data.name,
        currency: "USD", // Default, can be fetched from group
        members: data.members || [],
      });
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (groupId) {
      setLoading(true);
      Promise.all([fetchGroup(), fetchExpenses()]).finally(() => {
        setLoading(false);
      });
    }
  }, [groupId]);

  const handleAddExpense = async () => {
    if (!groupId || !description.trim() || !amount || !paidById) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(
        `http://localhost:3000/groups/${groupId}/expenses`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            description,
            amount: parseFloat(amount),
            paidById,
          }),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to add expense");

      setShowAddExpense(false);
      setDescription("");
      setAmount("");
      setPaidById("");
      await fetchExpenses();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteExpense = async (expenseId: string) => {
    if (!groupId) return;

    try {
      const res = await fetch(
        `http://localhost:3000/groups/${groupId}/expenses/${expenseId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (!res.ok) throw new Error("Failed to delete expense");

      await fetchExpenses();
    } catch (err) {
      console.error(err);
    }
  };

  if (!groupId) {
    return (
      <section className="relative min-h-screen overflow-hidden pt-16">
        <div className="relative z-10 px-4">
          <p className="text-white/60">No group selected</p>
        </div>
      </section>
    );
  }

  if (loading) {
    return <p className="text-white/60">Loading expenses...</p>;
  }

  return (
    <section className="relative min-h-screen overflow-hidden pt-6">
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-[radial-gradient(ellipse_at_center,_rgba(34,197,94,0.3)_0%,_rgba(34,197,94,0.1)_30%,_transparent_70%)]" />
      <div className="pointer-events-none absolute top-0 right-0 w-[600px] h-[600px] bg-[radial-gradient(ellipse_at_top_right,_rgba(34,197,94,0.15)_0%,_transparent_60%)]" />

      <main className="relative z-10 flex-1 overflow-hidden">
        <section className="pt-16 px-4 max-w-4xl mx-auto">
          <SectionHeader className="mb-6 text-center">
            <h1>{group?.name || "Expenses"}</h1>
            <p>Manage expenses for this group</p>
          </SectionHeader>

          {/* Expenses List */}
          <div className="space-y-3 mb-6">
            <h2 className="text-lg font-semibold text-white">Expenses</h2>
            {expenses.length === 0 ? (
              <p className="text-white/60">No expenses yet. Add one to get started!</p>
            ) : (
              <ul className="space-y-2">
                {expenses.map((expense) => (
                  <li
                    key={expense.id}
                    className="rounded-md bg-black/40 p-3 flex justify-between items-center text-white"
                  >
                    <div className="flex-1">
                      <div className="font-medium">{expense.description}</div>
                      <div className="text-sm text-white/60">
                        {group?.currency || "$"}
                        {Number(expense.amount).toFixed(2)}• Paid by: {expense.paidBy.name}
                      </div>
                    </div>
                    <GlossyButton
                      onClick={() => handleDeleteExpense(expense.id)}
                      className="ml-4"
                    >
                      <Trash2 className="h-4 w-4" />
                    </GlossyButton>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Add Expense Button */}
          <GlossyButton onClick={() => setShowAddExpense(true)}>
            <span className="inline-flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Expense
            </span>
          </GlossyButton>
        </section>

        {/* Add Expense Modal */}
        {showAddExpense && (
          <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center">
            <div className="bg-zinc-900 rounded-lg p-6 w-full max-w-md text-white">
              <h3 className="text-lg font-semibold mb-4">Add Expense</h3>

              {error && <p className="text-sm text-red-400 mb-2">{error}</p>}

              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-md bg-black/40 px-3 py-2 text-white outline-none"
                />
                <input
                  type="number"
                  step="0.01"
                  placeholder="Amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full rounded-md bg-black/40 px-3 py-2 text-white outline-none"
                />
                <select
                  value={paidById}
                  onChange={(e) => setPaidById(e.target.value)}
                  className="w-full rounded-md bg-black/40 px-3 py-2 text-white outline-none"
                >
                  <option value="">Select who paid</option>
                  {group?.members.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2 mt-4">
                <GlossyButton
                  onClick={handleAddExpense}
                  disabled={submitting}
                  className="flex-1"
                >
                  {submitting ? "Adding..." : "Add"}
                </GlossyButton>
                <GlossyButton
                  onClick={() => {
                    setShowAddExpense(false);
                    setError(null);
                  }}
                  className="flex-1"
                >
                  Cancel
                </GlossyButton>
              </div>
            </div>
          </div>
        )}
      </main>
    </section>
  );
}

