"use client";

import { useEffect, useState } from "react";

interface GradientLayerProps {
  scrollContainerId: string; // main scroll container
}

export default function GradientLayer({ scrollContainerId }: GradientLayerProps) {
  const [centerPos, setCenterPos] = useState({ left: 0 });

  useEffect(() => {
    const scroller = document.getElementById(scrollContainerId);
    if (!scroller) return;

    const updateCenter = () => {
      const scrollerRect = scroller.getBoundingClientRect();

      // Center horizontally in the main view, fixed vertically at viewport center
      setCenterPos({
        left: scrollerRect.left + scrollerRect.width / 2,
      });
    };

    updateCenter();

    // Recalc on resize only (no scroll listener needed)
    window.addEventListener("resize", updateCenter);

    return () => {
      window.removeEventListener("resize", updateCenter);
    };
  }, [scrollContainerId]);

  return (
    <div className="pointer-events-none z-0">
      {/* Bottom-left gradient - fixed to page */}
      <div
        className="fixed bottom-0 left-0 w-[600px] h-[600px]"
        style={{
          background: "radial-gradient(ellipse at bottom left, rgba(34,197,94,0.25) 0%, transparent 55%)",
        }}
      />

      {/* Top-right gradient - fixed to page */}
      <div
        className="fixed top-0 right-0 w-[600px] h-[600px]"
        style={{
          background: "radial-gradient(ellipse at top right, rgba(34,197,94,0.25) 0%, transparent 55%)",
        }}
      />

      {/* Center gradient - fixed at viewport center of content area */}
      <div
        className="fixed top-1/2 w-[900px] h-[700px]"
        style={{
          left: `${centerPos.left}px`,
          transform: "translate(-50%, -50%)",
          background: "radial-gradient(ellipse at center, rgba(34,197,94,0.45) 0%, transparent 60%)",
        }}
      />
    </div>
  );
}