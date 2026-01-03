"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { GlossyCardButton } from "@/components/ui/glossy-card-button";

type Group = {
  id: string;
  name: string;
  description?: string;
};

export default function AllGroupsPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const res = await fetch("http://localhost:3000/groups", {
          credentials: "include", // 🔑 REQUIRED for cookie-based auth
        });

        if (!res.ok) {
          // 401, 403, etc.
          console.error("Failed to fetch groups:", res.status);
          setGroups([]);
          return;
        }

        const data = await res.json();

        // 🔒 Defensive check
        if (Array.isArray(data)) {
          setGroups(data);
        } else {
          console.error("Expected groups array, got:", data);
          setGroups([]);
        }
      } catch (err) {
        console.error("Error fetching groups:", err);
        setGroups([]);
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, []);

  if (loading) {
    return <p className="text-white/60">Loading groups...</p>;
  }

  return (
    <section className="relative min-h-screen overflow-hidden pt-16">
      {/* Background gradients */}
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-[radial-gradient(ellipse_at_center,_rgba(34,197,94,0.3)_0%,_rgba(34,197,94,0.1)_30%,_transparent_70%)]" />
      <div className="pointer-events-none absolute top-0 right-0 w-[600px] h-[600px] bg-[radial-gradient(ellipse_at_top_right,_rgba(34,197,94,0.15)_0%,_transparent_60%)]" />

      <div className="relative z-10 space-y-6 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <h1 className="text-2xl font-semibold text-white">Your Groups</h1>

        {groups.length === 0 && (
          <p className="text-white/60">
            You are not part of any group yet.
          </p>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          {groups.map((group) => (
            <GlossyCardButton
              key={group.id}
              onClick={() =>
                router.push(`/dashboard/groups/group/${group.id}`)
              }
            >
              <h2 className="text-lg font-medium text-white">
                {group.name}
              </h2>
              {group.description && (
                <p className="mt-1 text-sm text-white/60">
                  {group.description}
                </p>
              )}
            </GlossyCardButton>
          ))}
        </div>
      </div>
    </section>
  );
}
