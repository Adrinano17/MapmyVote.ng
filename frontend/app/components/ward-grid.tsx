"use client"

import { MapPin } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import type { Ward } from "@/lib/types"
import { staggerContainer, staggerItem, cardHover } from "@/lib/animations"

interface WardGridProps {
  wards: Ward[]
}

export function WardGrid({ wards }: WardGridProps) {
  return (
    <motion.div
      className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      {wards.map((ward) => (
        <motion.div
          key={ward.id}
          variants={staggerItem}
          whileHover={cardHover}
        >
          <Link
            href={`/map?ward=${ward.code}`}
            className="group flex flex-col items-center justify-center gap-3 rounded-xl border border-border bg-card p-4 transition-all hover:border-primary hover:shadow-lg min-h-[120px] cursor-pointer h-full relative overflow-hidden"
          >
            {/* Wave effect on hover */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent transform -skew-x-12 opacity-0 group-hover:opacity-100 transition-opacity"
              animate={{
                x: ["-100%", "200%"],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "linear",
              }}
            />
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground group-hover:bg-primary/90 transition-colors relative z-10">
            <MapPin className="h-6 w-6" />
          </div>
          <div className="text-center relative z-10">
            <span className="block text-sm font-semibold text-foreground line-clamp-2">{ward.name}</span>
            <span className="block text-xs font-medium text-muted-foreground mt-1">{ward.code}</span>
          </div>
        </Link>
        </motion.div>
      ))}
    </motion.div>
  )
}
