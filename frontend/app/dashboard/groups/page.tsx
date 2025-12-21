"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function GroupsPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold text-white">Groups</h1>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Create Group */}
        <Link href="/dashboard/groups/create">
          <div className="cursor-pointer rounded-xl border border-white/10 bg-black/40 p-6 hover:border-primary transition">
            <h2 className="text-lg font-medium text-white">Create Group</h2>
            <p className="mt-2 text-sm text-white/60">
              Start a new group and invite members.
            </p>
          </div>
        </Link>

        {/* View Groups */}
        <Link href="/dashboard/groups/all">
          <div className="cursor-pointer rounded-xl border border-white/10 bg-black/40 p-6 hover:border-primary transition">
            <h2 className="text-lg font-medium text-white">View All Groups</h2>
            <p className="mt-2 text-sm text-white/60">
              See all groups you are part of.
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
}
