"use client";

import Link from "next/link";
import { GlossyCardButton } from "@/components/ui/glossy-card-button";
import { PageTitleCard } from "@/components/ui/page-title-card";
import { MarqueeText } from "@/components/ui/marquee-text";

export default function GroupsPage() {
  return (
    <section className="relative min-h-screen overflow-hidden pt-16">
      {/* Content */}
      <div className="relative z-10 space-y-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <PageTitleCard title="Groups" className="mb-6" />

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

        {/* Moving text - below cards, slightly lower than middle of page */}
        <div className="mt-24 min-h-[8rem] flex items-center justify-center">
          <div className="relative w-full rounded-xl border border-white/5 bg-transparent overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent pointer-events-none" />
            <MarqueeText text="Create a group and start adding expenses." />
          </div>
        </div>
      </div>
    </section>
  );
}
