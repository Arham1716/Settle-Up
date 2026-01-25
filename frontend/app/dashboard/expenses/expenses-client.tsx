'use client';

import { use } from 'react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { GlossyButton } from '@/components/ui/glossy-button';
import { SectionHeader } from '@/components/ui/section-header';
import { Plus, Trash2, Edit } from 'lucide-react';

type Expense = {
  id: string;
  description: string;
  amount: number;
  currency: string;
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

export default function ExpensesClient({
  searchParams,
}: {
  searchParams: Promise<{ groupId?: string }>;
}) {
  const router = useRouter();
  const params = use(searchParams);
  const groupId = params.groupId || null;

  const [group, setGroup] = useState<Group | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [paidById, setPaidById] = useState('');

  const popularCurrencies = [
    'USD','EUR','GBP','JPY','AUD',
    'CAD','INR','NZD','PKR','HKD'
  ];

  /* ---------------- FETCH ---------------- */

  const fetchExpenses = async () => {
    if (!groupId) return;

    try {
      const res = await fetch(
        `http://localhost:3000/groups/${groupId}/expenses`,
        { credentials: 'include' }
      );

      if (!res.ok) throw new Error('Failed to load expenses');
      const data = await res.json();
      setExpenses(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchGroup = async () => {
    if (!groupId) return;

    try {
      const res = await fetch(
        `http://localhost:3000/groups/${groupId}`,
        { credentials: 'include' }
      );

      if (!res.ok) throw new Error('Failed to load group');
      const data = await res.json();

      setGroup({
        id: data.id,
        name: data.name,
        currency: 'USD',
        members: data.members || [],
      });
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (groupId) {
      setLoading(true);
      Promise.all([fetchGroup(), fetchExpenses()])
        .finally(() => setLoading(false));
    }
  }, [groupId]);

  /* ---------------- ADD / EDIT / DELETE ---------------- */

  const handleAddExpense = async () => {
    if (!groupId || !description.trim() || !amount || !paidById) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(
        `http://localhost:3000/groups/${groupId}/expenses`,
        {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            description,
            amount: parseFloat(amount),
            currency: currency.trim().toUpperCase(),
            paidById,
          }),
        }
      );

      const data = await res.json();
      if (!res.ok)
        throw new Error(data.message || 'Failed to add expense');

      resetModal();
      await fetchExpenses();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    setDescription(expense.description);
    setAmount(expense.amount.toString());
    setCurrency(expense.currency || 'USD');
    setPaidById(expense.paidBy.id);
    setShowAddExpense(true);
    setError(null);
  };

  const handleUpdateExpense = async () => {
    if (
      !groupId ||
      !editingExpense ||
      !description.trim() ||
      !amount ||
      !paidById
    )
      return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(
        `http://localhost:3000/groups/${groupId}/expenses/${editingExpense.id}`,
        {
          method: 'PATCH',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            description,
            amount: parseFloat(amount),
            currency: currency.trim().toUpperCase(),
            paidById,
          }),
        }
      );

      const data = await res.json();
      if (!res.ok)
        throw new Error(data.message || 'Failed to update expense');

      resetModal();
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
          method: 'DELETE',
          credentials: 'include',
        }
      );

      if (!res.ok) throw new Error('Failed to delete expense');
      await fetchExpenses();
    } catch (err) {
      console.error(err);
    }
  };

  const resetModal = () => {
    setShowAddExpense(false);
    setEditingExpense(null);
    setDescription('');
    setAmount('');
    setCurrency('USD');
    setPaidById('');
    setError(null);
  };

  /* ---------------- GROUP LIST ---------------- */

  const [allGroups, setAllGroups] = useState<
    Array<{ id: string; name: string; description?: string }>
  >([]);

  useEffect(() => {
    if (!groupId) {
      const fetchGroups = async () => {
        try {
          const res = await fetch(
            'http://localhost:3000/groups',
            { credentials: 'include' }
          );
          if (res.ok) {
            const data = await res.json();
            setAllGroups(Array.isArray(data) ? data : []);
          }
        } catch (err) {
          console.error('Failed to fetch groups', err);
        }
      };
      fetchGroups();
    }
  }, [groupId]);

  /* ---------------- UI ---------------- */

  if (!groupId) {
    return (
      <section className="relative min-h-screen overflow-hidden pt-16">
        <div className="relative z-10 px-4 max-w-4xl mx-auto">
          <SectionHeader className="mb-6 text-center">
            <h1>Expenses</h1>
            <p>Select a group to manage expenses</p>
          </SectionHeader>

          {allGroups.length === 0 ? (
            <p className="text-white/60 text-center">
              You are not part of any group yet.
            </p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {allGroups.map((group) => (
                <GlossyButton
                  key={group.id}
                  onClick={() =>
                    router.push(
                      `/dashboard/expenses?groupId=${group.id}`
                    )
                  }
                  className="p-4 text-left"
                >
                  <h2 className="text-lg font-medium text-white">
                    {group.name}
                  </h2>
                  {group.description && (
                    <p className="mt-1 text-sm text-white/60">
                      {group.description}
                    </p>
                  )}
                </GlossyButton>
              ))}
            </div>
          )}
        </div>
      </section>
    );
  }

  if (loading) {
    return <p className="text-white/60">Loading expenses...</p>;
  }

  return (
    <section className="relative min-h-screen overflow-hidden pt-6">
      <main className="relative z-10 flex-1 overflow-hidden">
        <section className="pt-16 px-4 max-w-4xl mx-auto">
          <SectionHeader className="mb-6 text-center">
            <h1>{group?.name || 'Expenses'}</h1>
            <p>Manage expenses for this group</p>
          </SectionHeader>

          {/* LIST */}
          <div className="space-y-3 mb-6">
            <h2 className="text-lg font-semibold text-white">
              Expenses
            </h2>

            {expenses.length === 0 ? (
              <p className="text-white/60">
                No expenses yet. Add one to get started!
              </p>
            ) : (
              <ul className="space-y-2">
                {expenses.map((expense) => (
                  <li
                    key={expense.id}
                    className="rounded-md bg-black/40 p-3 flex justify-between items-center text-white"
                  >
                    <div className="flex-1">
                      <div className="font-medium">
                        {expense.description}
                      </div>
                      <div className="text-sm text-white/60">
                        {expense.currency || 'USD'}
                        {typeof expense.amount === 'number'
                          ? expense.amount.toFixed(2)
                          : Number(expense.amount).toFixed(2)}{' '}
                        • Paid by:{' '}
                        {expense.paidBy?.name ||
                          expense.paidBy?.email ||
                          'Unknown'}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <GlossyButton
                        onClick={() =>
                          handleEditExpense(expense)
                        }
                        className="ml-4"
                      >
                        <Edit className="h-4 w-4" />
                      </GlossyButton>

                      <GlossyButton
                        onClick={() =>
                          handleDeleteExpense(expense.id)
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                      </GlossyButton>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <GlossyButton
            onClick={() => setShowAddExpense(true)}
          >
            <span className="inline-flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Expense
            </span>
          </GlossyButton>
        </section>

        {/* MODAL */}
        {showAddExpense && (
          <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center">
            <div className="bg-zinc-900 rounded-lg p-6 w-full max-w-md text-white">
              <h3 className="text-lg font-semibold mb-4">
                {editingExpense
                  ? 'Edit Expense'
                  : 'Add Expense'}
              </h3>

              {error && (
                <p className="text-sm text-red-400 mb-2">
                  {error}
                </p>
              )}

              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Description"
                  value={description}
                  onChange={(e) =>
                    setDescription(e.target.value)
                  }
                  className="w-full rounded-md bg-black/40 px-3 py-2 text-white outline-none"
                />

                <input
                  type="number"
                  step="0.01"
                  placeholder="Amount"
                  value={amount}
                  onChange={(e) =>
                    setAmount(e.target.value)
                  }
                  className="w-full rounded-md bg-black/40 px-3 py-2 text-white outline-none"
                />

                {/* CURRENCY (RESTORED) */}
                <div className="flex gap-2">
                  <select
                    value={currency}
                    onChange={(e) =>
                      setCurrency(e.target.value)
                    }
                    className="flex-1 rounded-md bg-black/40 px-3 py-2 text-white outline-none"
                  >
                    {popularCurrencies.map((curr) => (
                      <option
                        key={curr}
                        value={curr}
                      >
                        {curr}
                      </option>
                    ))}
                  </select>

                  <input
                    type="text"
                    placeholder="Or type currency"
                    value={currency}
                    onChange={(e) =>
                      setCurrency(
                        e.target.value.toUpperCase()
                      )
                    }
                    maxLength={3}
                    className="flex-1 rounded-md bg-black/40 px-3 py-2 text-white outline-none"
                  />
                </div>

                <select
                  value={paidById}
                  onChange={(e) =>
                    setPaidById(e.target.value)
                  }
                  className="w-full rounded-md bg-black/40 px-3 py-2 text-white outline-none"
                >
                  <option value="">
                    Select who paid
                  </option>
                  {group?.members.map((member) => (
                    <option
                      key={member.id}
                      value={member.id}
                    >
                      {member.name ||
                        member.email}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2 mt-4">
                <GlossyButton
                  onClick={
                    editingExpense
                      ? handleUpdateExpense
                      : handleAddExpense
                  }
                  disabled={submitting}
                  className="flex-1"
                >
                  {submitting
                    ? editingExpense
                      ? 'Updating...'
                      : 'Adding...'
                    : editingExpense
                    ? 'Update'
                    : 'Add'}
                </GlossyButton>

                <GlossyButton
                  onClick={resetModal}
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
