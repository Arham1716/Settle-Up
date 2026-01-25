"use client";

import Link from "next/link";
import { GlossyCardButton } from "@/components/ui/glossy-card-button";
export default function GroupsPage() {
  return (
    <section className="relative min-h-screen overflow-hidden pt-16">
      {/* Content */}
      <div className="relative z-10 space-y-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <h1 className="text-2xl font-semibold text-white">Groups</h1>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Create Group */}
          <Link href="/dashboard/groups/create">
            <GlossyCardButton>
              <h2 className="text-lg font-medium text-white">Create Group</h2>
              <p className="mt-2 text-sm text-white/60">
                Start a new group and invite members.
              </p>
            </GlossyCardButton>
          </Link>

          {/* View All Groups */}
          <Link href="/dashboard/groups/all">
            <GlossyCardButton>
              <h2 className="text-lg font-medium text-white">View All Groups</h2>
              <p className="mt-2 text-sm text-white/60">
                See all groups you are part of.
              </p>
            </GlossyCardButton>
          </Link>
        </div>
      </div>
    </section>
  );
}
