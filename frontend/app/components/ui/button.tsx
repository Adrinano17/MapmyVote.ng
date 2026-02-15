"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { buttonTap } from "@/lib/animations"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <motion.button
        whileTap={buttonTap}
        whileHover={{ scale: 1.02 }}
        className={cn(
          "inline-flex flex-row items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background relative overflow-hidden group",
          {
            "bg-primary text-primary-foreground hover:bg-primary/90": variant === "default",
            "bg-destructive text-destructive-foreground hover:bg-destructive/90": variant === "destructive",
            "border border-input hover:bg-accent hover:text-accent-foreground": variant === "outline",
            "bg-secondary text-secondary-foreground hover:bg-secondary/80": variant === "secondary",
            "hover:bg-accent hover:text-accent-foreground": variant === "ghost",
            "underline-offset-4 hover:underline text-primary": variant === "link",
            "h-10 py-2 px-4": size === "default",
            "h-9 px-3 rounded-md": size === "sm",
            "h-11 px-8 rounded-md": size === "lg",
            "h-10 w-10": size === "icon",
          },
          className
        )}
        ref={ref}
        {...props}
      >
        <span className="relative z-10 inline-flex items-center">{props.children}</span>
        {/* Continuous flowing wave animation - only for default and outline variants */}
        {(variant === "default" || variant === "outline") && (
          <>
            <motion.div
              className={cn(
                "absolute inset-0 transform -skew-x-12",
                variant === "default" 
                  ? "bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  : "bg-gradient-to-r from-transparent via-primary/20 to-transparent"
              )}
              animate={{
                x: ["-100%", "200%"],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "linear",
              }}
            />
            <motion.div
              className={cn(
                "absolute inset-0 transform -skew-x-12",
                variant === "default"
                  ? "bg-gradient-to-r from-transparent via-white/10 to-transparent"
                  : "bg-gradient-to-r from-transparent via-primary/10 to-transparent"
              )}
              animate={{
                x: ["-100%", "200%"],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "linear",
                delay: 0.5,
              }}
            />
          </>
        )}
      </motion.button>
    )
  }
)
Button.displayName = "Button"

export { Button }




















