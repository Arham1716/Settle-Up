"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { GlossyButton } from "@/components/ui/glossy-button";
import { SectionHeader } from "@/components/ui/section-header";
import { UserPlus, X } from "lucide-react";

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
    paidBy: Array<{ user: { id: string; name: string }; total: number }>;
    currency: string;
  } | null>(null);

  // Add member modal
  const [showAddMember, setShowAddMember] = useState(false);
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Remove state
  const [removingUserId, setRemovingUserId] = useState<string | null>(null);

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

  useEffect(() => {
    if (groupId) {
      fetchGroup();
      fetchBalance();
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
    } catch (err) {
      console.error(err);
    } finally {
      setRemovingUserId(null);
    }
  };

  if (loading) return <p className="text-white/60">Loading group...</p>;
  if (!group) return <p className="text-white/60">Group not found.</p>;

  return (
    <section className="relative min-h-screen overflow-hidden pt-6">
      {/* Background gradients (same as CreateGroupPage) */}
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-[radial-gradient(ellipse_at_center,_rgba(34,197,94,0.3)_0%,_rgba(34,197,94,0.1)_30%,_transparent_70%)]" />
      <div className="pointer-events-none absolute top-0 right-0 w-[600px] h-[600px] bg-[radial-gradient(ellipse_at_top_right,_rgba(34,197,94,0.15)_0%,_transparent_60%)]" />
      
      <main className="relative z-10 flex-1 overflow-hidden">
        <section className="pt-16 px-4 max-w-4xl mx-auto">
          <SectionHeader className="mb-6 text-center">
            <h1>{group.name}</h1>
            {group.description && <p>{group.description}</p>}
          </SectionHeader>

          {/* Members */}
          <div className="space-y-3 mb-6">
            <h2 className="text-lg font-semibold text-white">Members</h2>
            <ul className="space-y-2">
              {group.members.map((member) => (
                <li
                  key={member.id}
                  className="rounded-md bg-black/40 p-3 flex justify-between items-center text-white"
                >
                  <div>
                    <div>{member.name}</div>
                    <div className="text-sm text-white/60">
                      {member.email}
                    </div>
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
                    Paid by: {item.user.name} ({balance.currency}
                    {item.total.toFixed(2)})
                  </p>
                ))}
              </div>
            )}

            <GlossyButton
              onClick={() => router.push(`/dashboard/expenses?groupId=${groupId}`)}
              className="w-full"
            >
              Total Balance: {balance?.currency || "$"}
              {balance?.totalBalance.toFixed(2) || "0.00"}
            </GlossyButton>
          </div>
        </section>

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
  );
}
