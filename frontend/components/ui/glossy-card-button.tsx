"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { motion, HTMLMotionProps } from "framer-motion"
interface GlossyCardButtonProps
  extends Omit<HTMLMotionProps<"button">, "onDrag" | "onDragStart" | "onDragEnd"> {
  children: React.ReactNode
  size?: "default" | "lg"
}

const GlossyCardButton = React.forwardRef<
  HTMLButtonElement,
  GlossyCardButtonProps
>(({ className, children, size = "default", ...props }, ref) => {
  return (
    <motion.button
      ref={ref}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "relative w-full text-left",
        "inline-flex items-center justify-start",
        "rounded-xl font-medium transition-all duration-300", // ⬅ less rounded
        "border border-white/20 bg-white/5 backdrop-blur-sm",
        "hover:bg-white/10 hover:border-white/30",
        "shadow-[0_0_20px_rgba(34,197,94,0.15)] hover:shadow-[0_0_30px_rgba(34,197,94,0.25)]",
        size === "default" && "px-5 py-4",
        size === "lg" && "px-6 py-5",
        className,
      )}
      {...props}
    >
      <span className="text-white w-full">
        {children}
      </span>
    </motion.button>
  )
})

GlossyCardButton.displayName = "GlossyCardButton"

export { GlossyCardButton }
