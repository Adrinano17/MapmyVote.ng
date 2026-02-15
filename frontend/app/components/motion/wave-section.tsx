"use client"

import { motion } from "framer-motion"
import { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface WaveSectionProps {
  children: ReactNode
  className?: string
  waveColor?: string
}

export function WaveSection({ children, className, waveColor = "primary" }: WaveSectionProps) {
  return (
    <div className={cn("relative overflow-hidden", className)}>
      {children}
      {/* Continuous flowing wave animation */}
      <motion.div
        className={cn(
          "absolute inset-0 pointer-events-none",
          waveColor === "primary" 
            ? "bg-gradient-to-r from-transparent via-primary/5 to-transparent"
            : "bg-gradient-to-r from-transparent via-background/10 to-transparent"
        )}
        style={{
          transform: "skewX(-12deg)",
        }}
        animate={{
          x: ["-100%", "200%"],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "linear",
        }}
      />
      <motion.div
        className={cn(
          "absolute inset-0 pointer-events-none",
          waveColor === "primary"
            ? "bg-gradient-to-r from-transparent via-primary/3 to-transparent"
            : "bg-gradient-to-r from-transparent via-background/5 to-transparent"
        )}
        style={{
          transform: "skewX(-12deg)",
        }}
        animate={{
          x: ["-100%", "200%"],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "linear",
          delay: 1,
        }}
      />
    </div>
  )
}

