"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { GlossyButton } from "@/components/ui/glossy-button";
import { SectionHeader } from "@/components/ui/section-header";
import { UserPlus, X } from "lucide-react";

type Member = {
  id: string;
  name: string;
  email: string;
};

type Group = {
  id: string;
  name: string;
  description?: string;
  members: Member[];
};

export default function GroupPage() {
  const params = useParams();
  const groupId = Array.isArray(params.id) ? params.id[0] : params.id;

  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);

  // Add Member Modal state
  const [showAddMember, setShowAddMember] = useState(false);
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const token = typeof window !== "undefined"
    ? localStorage.getItem("token")
    : null;

  const fetchGroup = async () => {
    try {
      const res = await fetch(`http://localhost:3000/groups/${groupId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch group");
      const data = await res.json();
      setGroup(data);
    } catch {
      setGroup(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (groupId) fetchGroup();
  }, [groupId]);

  // ---------------- Add Member Handler ----------------
  const handleAddMember = async () => {
    if (!email.trim()) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(
        `http://localhost:3000/groups/${groupId}/members`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ email }),
        }
      );

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to add member");
      }

      // Success → close modal & refresh members
      setShowAddMember(false);
      setEmail("");
      await fetchGroup();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <p className="text-white/60">Loading group...</p>;
  }

  if (!group) {
    return <p className="text-white/60">Group not found.</p>;
  }

  return (
    <div className="relative min-h-screen flex">
      <main className="relative flex-1 overflow-hidden">
        <section className="relative z-10 pt-16 px-4 max-w-4xl mx-auto">

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
                  className="rounded-md bg-black/40 p-3 flex justify-between text-white"
                >
                  <span>{member.name}</span>
                  <span className="text-sm text-white/60">{member.email}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Add Member Button */}
          <GlossyButton
            onClick={() => setShowAddMember(true)}
            className="inline-flex items-center"
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Add Member
          </GlossyButton>
        </section>

        {/* ---------------- Add Member Modal ---------------- */}
        {showAddMember && (
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
    </div>
  );
}
