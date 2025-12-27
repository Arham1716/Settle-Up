"use client";

import { ReactNode } from "react";
import clsx from "clsx";

interface SectionHeaderProps {
  children: ReactNode;
  className?: string;
}

export function SectionHeader({ children, className }: SectionHeaderProps) {
  return (
    <div
      className={clsx(
        "px-4 py-3",
        "bg-green-500/15 rounded-lg",
        "[&_h1]:text-green-400 [&_h1]:font-bold [&_h1]:text-2xl",
        "[&_p]:text-green-300/80 [&_p]:text-sm",
        className
      )}
    >
      {children}
    </div>
  );
}
