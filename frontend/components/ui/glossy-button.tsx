"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { motion, HTMLMotionProps } from "framer-motion"

interface GlossyButtonProps
  extends Omit<HTMLMotionProps<"button">, "onDrag" | "onDragStart" | "onDragEnd"> {
  children: React.ReactNode
  variant?: "primary" | "secondary"
  size?: "default" | "lg"
  asChild?: boolean
}

const GlossyButton = React.forwardRef<HTMLButtonElement, GlossyButtonProps>(
  ({ className, children, variant = "primary", size = "default", ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={cn(
          "relative inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all duration-300",
          "border border-white/20 bg-white/5 backdrop-blur-sm",
          "hover:bg-white/10 hover:border-white/30",
          "shadow-[0_0_20px_rgba(34,197,94,0.15)] hover:shadow-[0_0_30px_rgba(34,197,94,0.25)]",
          size === "default" && "px-6 py-2.5 text-sm",
          size === "lg" && "px-8 py-3.5 text-base",
          className,
        )}
        {...props}
      >
        <span className="text-white">{children}</span>
        {/* White dot indicator */}
        <span className="ml-1 inline-flex h-2.5 w-2.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.5)]" />
      </motion.button>
    )
  },
)
GlossyButton.displayName = "GlossyButton"

export { GlossyButton }
