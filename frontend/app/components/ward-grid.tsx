"use client"

import { MapPin } from "lucide-react"
import Link from "next/link"
import type { Ward } from "@/lib/types"

interface WardGridProps {
  wards: Ward[]
}

export function WardGrid({ wards }: WardGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
      {wards.map((ward) => (
        <Link
          key={ward.id}
          href={`/map?ward=${ward.code}`}
          className="group flex flex-col items-center justify-center gap-3 rounded-xl border border-border bg-card p-4 transition-all hover:border-primary hover:shadow-lg min-h-[120px] cursor-pointer"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground group-hover:bg-primary/90 transition-colors">
            <MapPin className="h-6 w-6" />
          </div>
          <div className="text-center">
            <span className="block text-sm font-semibold text-foreground line-clamp-2">{ward.name}</span>
            <span className="block text-xs font-medium text-muted-foreground mt-1">{ward.code}</span>
          </div>
        </Link>
      ))}
    </div>
  )
}
