"use client"

import { MapPin, Users, Navigation, ChevronRight } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useLanguage } from "@/hooks/use-language"
import { translations, type PollingUnit, type Ward } from "@/lib/types"

interface PollingUnitCardProps {
  pollingUnit: PollingUnit & { ward?: Ward }
  showDirections?: boolean
}

export function PollingUnitCard({ pollingUnit, showDirections = true }: PollingUnitCardProps) {
  const { language } = useLanguage()
  const t = translations[language]

  const hasCoordinates = pollingUnit.latitude && pollingUnit.longitude

  const openDirections = () => {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/a0691e2c-cdd7-47b0-9342-76cf3ac06d2f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'polling-unit-card.tsx:21',message:'openDirections called',data:{hasCoordinates,code:pollingUnit.code,lat:pollingUnit.latitude,lng:pollingUnit.longitude},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    if (hasCoordinates) {
      const params = new URLSearchParams({ code: pollingUnit.code })
      window.location.href = `/navigate?${params.toString()}`
    }
  }

  return (
    <Card className="group transition-all hover:shadow-md">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <MapPin className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <Link href={`/polling-unit/${pollingUnit.code}`} className="block">
                  <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                    {pollingUnit.name}
                  </h3>
                </Link>
                <p className="text-sm text-muted-foreground truncate">{pollingUnit.address || "Location not available"}</p>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-1">
                    <span className="font-medium">{pollingUnit.code}</span>
                  </span>
                  {pollingUnit.ward && (
                    <span className="inline-flex items-center gap-1">
                      {t.wards}: {pollingUnit.ward.name}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {(pollingUnit.registered_voters || 0).toLocaleString()} {t.registeredVoters.toLowerCase()}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {showDirections && hasCoordinates && (
              <Button variant="outline" size="sm" onClick={openDirections} className="gap-1 bg-transparent">
                <Navigation className="h-4 w-4" />
                <span className="hidden sm:inline">{t.getDirections}</span>
              </Button>
            )}
            <Link href={`/polling-unit/${pollingUnit.code}`}>
              <Button variant="ghost" size="icon">
                <ChevronRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
