"use client";

export function BackgroundGlow() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0">
      {/* Primary green radial gradient */}
      <div
        className="
          absolute top-0 left-1/2 -translate-x-1/2
          w-[800px] h-[600px]
          bg-[radial-gradient(ellipse_at_center,rgba(34,197,94,0.3)_0%,rgba(34,197,94,0.1)_30%,transparent_70%)]
        "
      />

      {/* Secondary subtle gradient */}
      <div
        className="
          absolute top-0 right-0
          w-[600px] h-[600px]
          bg-[radial-gradient(ellipse_at_top_right,rgba(34,197,94,0.15)_0%,transparent_60%)]
        "
      />
    </div>
  );
}
