// components/AuthCard.tsx
"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export default function AuthCard({
  title,
  subtitle,
  children,
}: {
  title: ReactNode;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto max-w-[420px]">
      <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-8 shadow-lg">
        <div className="mb-6 text-center">
          {typeof title === "string" ? (
            <h2 className="mb-2 text-3xl font-bold text-foreground">
              {title}
            </h2>
          ) : (
            <>{title}</>
          )}
          {subtitle && (
            <p className="mt-2 text-sm text-muted-foreground">
              {subtitle}
            </p>
          )}
        </div>
        {children}
      </div>
    </div>
  );
}
