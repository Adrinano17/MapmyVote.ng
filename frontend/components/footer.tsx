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
      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-8 md:grid-cols-3">
          {/* Brand */}
          <div className="flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <MapPin className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-bold text-foreground">MapMyVote.ng</span>
            </Link>
            <p className="text-sm text-muted-foreground">{t.footerTagline}</p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-4 font-semibold text-foreground">{t.quickLinks}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
                  {t.home}
                </Link>
              </li>
              <li>
                <Link href="/map" className="text-muted-foreground hover:text-foreground transition-colors">
                  {t.mapView}
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors">
                  {t.about}
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="mb-4 font-semibold text-foreground">{t.support}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="https://www.inecnigeria.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  INEC Official Website
                </a>
              </li>
              <li>
                <a
                  href="https://cvr.inecnigeria.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Voter Registration
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 text-center text-sm text-muted-foreground md:flex-row">
          <p>
            © {new Date().getFullYear()} MapMyVote.ng. {t.allRightsReserved}
          </p>
          <p className="flex items-center gap-1">
            Built with <Heart className="h-4 w-4 text-destructive" /> for Nigerian voters
          </p>
        </div>
      </div>
    </footer>
  )
}
