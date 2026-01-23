"use client";

import { useEffect, useState } from "react";

interface GradientLayerProps {
  sectionId?: string;      // ID of the section to center the main gradient
  sidebarOffset?: number;  // optional horizontal offset if you have a sidebar
}

export default function GradientLayer({ sectionId = "main-section", sidebarOffset = 0 }: GradientLayerProps) {
  const [sectionCenter, setSectionCenter] = useState({ top: 0, left: 0 });

  useEffect(() => {
    const updateCenter = () => {
      const section = document.getElementById(sectionId);
      if (section) {
        const rect = section.getBoundingClientRect();
        setSectionCenter({
          top: rect.top + rect.height / 2 + window.scrollY,
          left: rect.left + rect.width / 2 + window.scrollX + sidebarOffset,
        });
      }
    };

    updateCenter();

    window.addEventListener("resize", updateCenter);
    window.addEventListener("scroll", updateCenter);

    return () => {
      window.removeEventListener("resize", updateCenter);
      window.removeEventListener("scroll", updateCenter);
    };
  }, [sectionId, sidebarOffset]);

  return (
    <div className="pointer-events-none z-0">
      {/* Center-left gradient (fixed to viewport) */}
      <div className="fixed top-1/2 left-0 -translate-y-1/2 w-[600px] h-[600px] 
                      bg-[radial-gradient(ellipse_at_left,_rgba(34,197,94,0.35)_0%,_transparent_70%)]" />

      {/* Top-right gradient (fixed to viewport) */}
      <div className="fixed top-0 right-0 w-[600px] h-[600px] 
                      bg-[radial-gradient(ellipse_at_top_right,_rgba(34,197,94,0.25)_0%,_transparent_65%)]" />

      {/* Center gradient aligned to section */}
      <div
        className="fixed w-[900px] h-[700px] 
                   bg-[radial-gradient(ellipse_at_center,_rgba(34,197,94,0.45)_0%,_transparent_75%)]"
        style={{
          top: `${sectionCenter.top}px`,
          left: `${sectionCenter.left}px`,
          transform: "translate(-50%, -50%)",
        }}
      />
    </div>
  );
}
