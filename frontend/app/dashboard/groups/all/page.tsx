"use client";

import { useEffect, useState } from "react";

type Group = {
  id: string;
  name: string;
  description?: string;
};

export default function AllGroupsPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch("http://localhost:3000/groups/my", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => res.json())
      .then(data => setGroups(data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="text-white/60">Loading groups...</p>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-white">Your Groups</h1>

      {groups.length === 0 && (
        <p className="text-white/60">You are not part of any group yet.</p>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {groups.map(group => (
          <div
            key={group.id}
            className="rounded-xl border border-white/10 bg-black/40 p-5"
          >
            <h2 className="text-lg font-medium text-white">{group.name}</h2>
            {group.description && (
              <p className="mt-1 text-sm text-white/60">
                {group.description}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
