"use client";

interface MarqueeTextProps {
  text: string;
  className?: string;
}

export function MarqueeText({ text, className = "" }: MarqueeTextProps) {
  return (
    <div
      className={`relative overflow-hidden py-4 ${className}`}
      aria-hidden="true"
    >
      <div className="flex w-max animate-marquee-alt">
        <span className="mx-8 whitespace-nowrap text-lg font-medium tracking-wide text-white/95">
          {text}
        </span>
        <span className="mx-8 whitespace-nowrap text-lg font-medium tracking-wide text-white/95">
          {text}
        </span>
        <span className="mx-8 whitespace-nowrap text-lg font-medium tracking-wide text-white/95">
          {text}
        </span>
      </div>
    </div>
  );
}
