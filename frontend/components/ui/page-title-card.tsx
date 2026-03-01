"use client";

import { ReactNode } from "react";
import clsx from "clsx";

interface PageTitleCardProps {
  title: string;
  children?: ReactNode;
  className?: string;
}

export function PageTitleCard({ title, children, className }: PageTitleCardProps) {
  return (
    <div
      className={clsx(
        "rounded-xl border border-white/10 bg-green px-6 py-4",
        className
      )}
    >
      <h1 className="text-2xl font-semibold text-white text-center">{title}</h1>
      {children}
    </div>
  );
}
