"use client";

import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import { GlossyCardButton } from "@/components/ui/glossy-card-button";

type Activity = {
  id: string;
  title: string;
  type: string;
  createdAt: string;
  actor?: {
    id: string;
    name?: string;
    email: string;
  };
  group?: {
    id: string;
    name: string;
  };
  metadata?: any;
};

export default function ActivityPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

        const res = await fetch(`${apiUrl}/activity`, {
          credentials: "include",
        });

        if (!res.ok) {
          throw new Error("Failed to fetch activity");
        }

        const data = await res.json();
        setActivities(data);
      } catch (err) {
        console.error(err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchActivity();
  }, []);

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <section className="relative min-h-screen overflow-hidden pt-16">
      {/* Primary green radial gradient */}
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-[radial-gradient(ellipse_at_center,_rgba(34,197,94,0.3)_0%,_rgba(34,197,94,0.1)_30%,_transparent_70%)]" />

      {/* Secondary subtle gradient */}
      <div className="pointer-events-none absolute top-0 right-0 w-[600px] h-[600px] bg-[radial-gradient(ellipse_at_top_right,_rgba(34,197,94,0.15)_0%,_transparent_60%)]" />

      {/* Content */}
      <div className="relative z-10 space-y-6 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <h1 className="text-2xl font-semibold text-white">Activity Feed</h1>

        {loading && (
          <div className="text-white/60">Loading activity...</div>
        )}

        {error && (
          <div className="text-red-400">
            Failed to load activity feed
          </div>
        )}

        {!loading && !error && activities.length === 0 && (
          <div className="text-white/60">
            No recent activity yet.
          </div>
        )}

        <div className="space-y-4">
          {activities.map((activity) => {
            const isOpen = expandedId === activity.id;

            return (
              <div key={activity.id}>
                <GlossyCardButton
                  onClick={() => toggleExpand(activity.id)}
                  className="w-full flex items-center justify-between"
                >
                  <span className="text-white font-medium">
                    {activity.title}
                  </span>

                  <ChevronDown
                    className={`h-4 w-4 text-white/60 transition-transform ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </GlossyCardButton>

                {isOpen && (
                  <div className="mt-2 rounded-lg border border-white/10 bg-black/40 px-4 py-3 text-sm text-white/70">
                    <div className="space-y-1">
                      {activity.actor && (
                        <div>
                          <span className="text-white/80">
                            Actor:
                          </span>{" "}
                          {activity.actor.name ||
                            activity.actor.email}
                        </div>
                      )}

                      {activity.group && (
                        <div>
                          <span className="text-white/80">
                            Group:
                          </span>{" "}
                          {activity.group.name}
                        </div>
                      )}

                      <div>
                        <span className="text-white/80">
                          Time:
                        </span>{" "}
                        {new Date(
                          activity.createdAt
                        ).toLocaleString()}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
