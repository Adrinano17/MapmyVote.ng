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
          href={`/ward/${ward.code}`}
          className="group flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-4 text-center transition-all hover:border-primary hover:shadow-md"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-secondary-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
            <MapPin className="h-5 w-5" />
          </div>
          <span className="text-xs font-medium text-foreground line-clamp-2">{ward.name}</span>
          <span className="text-xs text-muted-foreground">{ward.code}</span>
        </Link>
      ))}
    </div>
  )
}
