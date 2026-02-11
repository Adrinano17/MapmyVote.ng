"use client"

import { MapPin, Heart } from "lucide-react"
import Link from "next/link"
import { useLanguage } from "@/hooks/use-language"
import { translations } from "@/lib/types"

export function Footer() {
  const { language } = useLanguage()
  const t = translations[language]

  return (
    <footer className="border-t border-border bg-card">
      <div className="container mx-auto px-4 py-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <p className="flex items-center gap-2">
            <MapPin className="h-3 w-3" />
            <span>© {new Date().getFullYear()} MapMyVote.ng</span>
          </p>
          <div className="flex items-center gap-4">
            <Link href="/" className="hover:text-foreground transition-colors">
              {t.home}
            </Link>
            <Link href="/map" className="hover:text-foreground transition-colors">
              {t.mapView}
            </Link>
            <Link href="/about" className="hover:text-foreground transition-colors">
              {t.about}
            </Link>
          </div>
          <p className="flex items-center gap-1">
            Built with <Heart className="h-3 w-3 text-destructive" /> for Nigerian voters
          </p>
        </div>
      </div>
    </footer>
  )
}
