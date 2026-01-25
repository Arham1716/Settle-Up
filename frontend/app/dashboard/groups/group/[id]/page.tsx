"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { GlossyButton } from "@/components/ui/glossy-button";
import { SectionHeader } from "@/components/ui/section-header";
import { UserPlus, X, Calculator } from "lucide-react";
import GradientLayer from "@/components/ui/gradients"; // adjust path as needed

type Member = {
  id: string;
  name: string;
  email: string;
  role: string;
};

type Group = {
  id: string;
  name: string;
  description?: string;
  members: Member[];
  currentUserRole: string | null;
};

export default function GroupPage() {
  const params = useParams();
  const router = useRouter();
  const groupId = Array.isArray(params.id) ? params.id[0] : params.id;

  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState<{
    totalBalance: number;
    paidBy: Array<{ user: { id: string; name: string; email: string }; total: number; currency: string }>;
    currency: string;
  } | null>(null);
  const [memberBalances, setMemberBalances] = useState<Array<{
    userId: string;
    user: { id: string; name: string; email: string };
    role: string;
    balance: number;
  }>>([]);
  const [settlements, setSettlements] = useState<Array<{
    from: { id: string; name: string; email: string };
    to: { id: string; name: string; email: string };
    amount: number;
  }>>([]);

  // Add member modal
  const [showAddMember, setShowAddMember] = useState(false);
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Remove state
  const [removingUserId, setRemovingUserId] = useState<string | null>(null);

  // Split balance modal
  const [showSplitModal, setShowSplitModal] = useState(false);
  const [splitType, setSplitType] = useState<"EQUAL" | "UNEQUAL">("EQUAL");
  const [unequalSplits, setUnequalSplits] = useState<Record<string, string>>({});
  const [splitError, setSplitError] = useState<string | null>(null);
  const [splitting, setSplitting] = useState(false);

  const isAdmin = group?.currentUserRole === "ADMIN";

  // ---------------- Fetch Group ----------------
  const fetchGroup = async () => {
    try {
      const res = await fetch(`http://localhost:3000/groups/${groupId}`, {
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to load group");

      const data = await res.json();
      setGroup(data);
    } catch (err) {
      console.error(err);
      setGroup(null);
    } finally {
      setLoading(false);
    }
  };

  // ---------------- Fetch Balance ----------------
  const fetchBalance = async () => {
    try {
      const res = await fetch(
        `http://localhost:3000/groups/${groupId}/balance`,
        {
          credentials: "include",
        }
      );

      if (!res.ok) throw new Error("Failed to load balance");

      const data = await res.json();
      setBalance(data);
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch member balances
  const fetchMemberBalances = async () => {
    try {
      const res = await fetch(
        `http://localhost:3000/groups/${groupId}/expenses/balances`,
        {
          credentials: "include",
        }
      );

      if (res.ok) {
        const data = await res.json();
        setMemberBalances(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch who owes whom
  const fetchSettlements = async () => {
    try {
      const res = await fetch(
        `http://localhost:3000/groups/${groupId}/expenses/settlements`,
        {
          credentials: "include",
        }
      );

      if (res.ok) {
        const data = await res.json();
        setSettlements(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (groupId) {
      fetchGroup();
      fetchBalance();
      fetchMemberBalances();
      fetchSettlements();
    }
  }, [groupId]);

  // ---------------- Add Member ----------------
  const handleAddMember = async () => {
    if (!email.trim()) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(
        `http://localhost:3000/groups/${groupId}/members`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to add member");

      setShowAddMember(false);
      setEmail("");
      await fetchGroup();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // ---------------- Remove Member ----------------
  const handleRemoveMember = async (userId: string) => {
    try {
      setRemovingUserId(userId);

      const res = await fetch(
        `http://localhost:3000/groups/${groupId}/members/${userId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to remove member");
      }

      await fetchGroup();
      await fetchMemberBalances();
    } catch (err) {
      console.error(err);
    } finally {
      setRemovingUserId(null);
    }
  };

  // Handle split balance
  const handleSplitBalance = async () => {
    if (!groupId || !balance) return;

    setSplitting(true);
    setSplitError(null);

    try {
      let body: any = { splitType };

      if (splitType === "UNEQUAL" && group) {
        const memberSplits = group.members.map((member) => ({
          userId: member.id,
          amount: unequalSplits[member.id] || "0",
        }));

        body.memberSplits = memberSplits;
      }

      const res = await fetch(
        `http://localhost:3000/groups/${groupId}/expenses/split`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to split balance");

      setShowSplitModal(false);
      await fetchMemberBalances();
      await fetchBalance();
      await fetchSettlements();
    } catch (err: any) {
      setSplitError(err.message);
    } finally {
      setSplitting(false);
    }
  };

  // Get member balance
  const getMemberBalance = (memberId: string) => {
    const memberBalance = memberBalances.find((mb) => mb.userId === memberId);
    return memberBalance?.balance || 0;
  };

  if (loading) return <p className="text-white/60">Loading group...</p>;
  if (!group) return <p className="text-white/60">Group not found.</p>;

  return (
    <>
      <section className="relative min-h-screen overflow-hidden pt-6">

      <main className="relative z-10 flex-1 overflow-hidden">
        <section id="main-section" className="pt-16 pb-8 px-4 max-w-4xl mx-auto">
          <SectionHeader className="mb-6 text-center">
            <h1>{group.name}</h1>
            {group.description && <p>{group.description}</p>}
          </SectionHeader>

          {/* Settlements - Who Owes Whom */}
          {settlements.length > 0 && (
            <div className="space-y-3 mb-6">
              <h2 className="text-lg font-semibold text-white">Who Owes Whom</h2>
              <ul className="space-y-2">
                {settlements.map((settlement, index) => (
                  <li
                    key={index}
                    className="rounded-md bg-black/40 p-3 text-white"
                  >
                    <div className="text-sm">
                      <span className="font-medium">{settlement.from.name}</span> owes{" "}
                      <span className="font-medium">{settlement.to.name}</span>{" "}
                      <span className="text-green-400">{settlement.amount.toFixed(2)}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Members */}
          <div className="space-y-3 mb-6">
            <h2 className="text-lg font-semibold text-white">Members</h2>
            <ul className="space-y-2">
              {group.members.map((member) => (
                <li
                  key={member.id}
                  className="rounded-md bg-black/40 p-3 flex justify-between items-center text-white"
                >
                  <div className="flex-1">
                    <div>
                      {member.name}
                      {member.role === "ADMIN" && (
                        <span className="ml-2 text-sm text-green-400">(Admin)</span>
                      )}
                    </div>
                    <div className="text-sm text-white/60">
                      {member.email}
                    </div>
                    {memberBalances.length > 0 && (
                      <div className="text-sm mt-1">
                        {(() => {
                          const balance = getMemberBalance(member.id);
                          if (balance > 0) {
                            return <span className="text-red-400">Owes: {balance.toFixed(2)}</span>;
                          } else if (balance < 0) {
                            return <span className="text-green-400">Owed: {Math.abs(balance).toFixed(2)}</span>;
                          } else {
                            return <span className="text-white/60">Settled</span>;
                          }
                        })()}
                      </div>
                    )}
                  </div>

                  {isAdmin && member.role !== "ADMIN" && (
                    <GlossyButton
                      onClick={() => handleRemoveMember(member.id)}
                      disabled={removingUserId === member.id}
                    >
                      {removingUserId === member.id
                        ? "Removing..."
                        : "Remove Member"}
                    </GlossyButton>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Add Member Button */}
          {isAdmin && (
            <GlossyButton onClick={() => setShowAddMember(true)} className="mb-6">
              <span className="inline-flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                Add Member
              </span>
            </GlossyButton>
          )}

          {/* Balance Section */}
          <div className="mt-8 space-y-3">
            {balance && balance.paidBy.length > 0 && (
              <div className="space-y-2 mb-4">
                {balance.paidBy.map((item, index) => (
                  <p key={index} className="text-white/80 text-sm">
                    Paid by: {item.user?.name || item.user?.email || "Unknown"} ({item.currency || "USD"}
                    {item.total.toFixed(2)})
                  </p>
                ))}
              </div>
            )}

            <div className="space-y-2">
              <GlossyButton
                onClick={() => router.push(`/dashboard/expenses?groupId=${groupId}`)}
                className="w-full"
              >
                Total Balance: {balance?.totalBalance.toFixed(2) || "0.00"}
              </GlossyButton>

              {isAdmin && balance && balance.totalBalance > 0 && (
                <GlossyButton
                  onClick={() => {
                    setShowSplitModal(true);
                    setSplitType("EQUAL");
                    setUnequalSplits({});
                    setSplitError(null);
                  }}
                  className="w-full"
                >
                  <span className="inline-flex items-center gap-2">
                    <Calculator className="h-4 w-4" />
                    Split Balance
                  </span>
                </GlossyButton>
              )}
            </div>
          </div>
        </section>

        {/* Split Balance Modal */}
        {showSplitModal && isAdmin && (
          <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center">
            <div className="bg-zinc-900 rounded-lg p-6 w-full max-w-md text-white max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Split Balance</h3>
                <button onClick={() => setShowSplitModal(false)}>
                  <X className="h-5 w-5 text-white/60" />
                </button>
              </div>

              {splitError && (
                <p className="text-sm text-red-400 mb-4">{splitError}</p>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm mb-2">Split Type</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setSplitType("EQUAL");
                        setSplitError(null);
                      }}
                      className={`flex-1 px-4 py-2 rounded-md ${
                        splitType === "EQUAL"
                          ? "bg-green-500/20 text-green-400"
                          : "bg-black/40 text-white/60"
                      }`}
                    >
                      Equal Split
                    </button>
                    <button
                      onClick={() => {
                        setSplitType("UNEQUAL");
                        setSplitError(null);
                      }}
                      className={`flex-1 px-4 py-2 rounded-md ${
                        splitType === "UNEQUAL"
                          ? "bg-green-500/20 text-green-400"
                          : "bg-black/40 text-white/60"
                      }`}
                    >
                      Unequal Split
                    </button>
                  </div>
                </div>

                {splitType === "EQUAL" && balance && (
                  <div className="text-sm text-white/60">
                    Total: {balance.totalBalance.toFixed(2)} will be split equally among {group.members.length} members
                  </div>
                )}

                {splitType === "UNEQUAL" && balance && (
                  <div className="space-y-3">
                    <div className="text-sm text-white/60 mb-2">
                      Total: {balance.totalBalance.toFixed(2)} - Enter amount for each member
                    </div>
                    {group.members.map((member) => (
                      <div key={member.id}>
                        <label className="block text-sm mb-1">
                          {member.name} {member.role === "ADMIN" && <span className="text-green-400">(Admin)</span>}
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={unequalSplits[member.id] || ""}
                          onChange={(e) =>
                            setUnequalSplits({
                              ...unequalSplits,
                              [member.id]: e.target.value,
                            })
                          }
                          className="w-full rounded-md bg-black/40 px-3 py-2 text-white outline-none"
                        />
                      </div>
                    ))}
                    <div className="text-sm text-white/60">
                      Sum: {Object.values(unequalSplits).reduce(
                        (sum, val) => sum + (parseFloat(val) || 0),
                        0
                      ).toFixed(2)} / {balance.totalBalance.toFixed(2)}
                    </div>
                  </div>
                )}

                <div className="flex gap-2 mt-4">
                  <GlossyButton
                    onClick={handleSplitBalance}
                    disabled={splitting}
                    className="flex-1"
                  >
                    {splitting ? "Splitting..." : "Split"}
                  </GlossyButton>
                  <GlossyButton
                    onClick={() => {
                      setShowSplitModal(false);
                      setSplitError(null);
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </GlossyButton>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Member Modal */}
        {showAddMember && isAdmin && (
          <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center">
            <div className="bg-zinc-900 rounded-lg p-6 w-full max-w-md text-white">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Add Member</h3>
                <button onClick={() => setShowAddMember(false)}>
                  <X className="h-5 w-5 text-white/60" />
                </button>
              </div>

              <input
                type="email"
                placeholder="Enter email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-md bg-black/40 px-3 py-2 text-white outline-none mb-3"
              />

              {error && (
                <p className="text-sm text-red-400 mb-2">{error}</p>
              )}

              <GlossyButton
                onClick={handleAddMember}
                disabled={submitting}
                className="w-full"
              >
                {submitting ? "Sending Invite..." : "Send Invite"}
              </GlossyButton>
            </div>
          </div>
        )}
      </main>
    </section>
    </>
  );
}
