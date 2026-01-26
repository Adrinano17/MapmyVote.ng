"use client"

import { PollingUnitMap } from "@/components/polling-unit-map"
import { VoiceAnnouncement } from "@/components/voice-announcement"
import { MapPin, ArrowLeft, Navigation, Users, Calendar, Share2 } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useLanguage } from "@/hooks/use-language"
import { translations, type PollingUnit, type Ward } from "@/lib/types"

interface PollingUnitDetailsProps {
  pollingUnit: PollingUnit & { ward?: Ward | null }
}

export function PollingUnitDetails({ pollingUnit }: PollingUnitDetailsProps) {
  const { language } = useLanguage()
  const t = translations[language]

  const hasCoordinates = pollingUnit.latitude && pollingUnit.longitude
  // #region agent log
  if (typeof window !== 'undefined') {
    fetch('http://127.0.0.1:7242/ingest/a0691e2c-cdd7-47b0-9342-76cf3ac06d2f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'polling-unit-details.tsx:20',message:'PollingUnitDetails rendered',data:{hasCoordinates,code:pollingUnit.code,lat:pollingUnit.latitude,lng:pollingUnit.longitude},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
  }
  // #endregion

  const handleShare = () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      navigator.share({
        title: pollingUnit.name,
        text: `${t.heroTitle}: ${pollingUnit.name}`,
        url: window.location.href,
      })
    }
  }

  return (
    <main className="flex-1">
      {/* Header Section */}
      <section className="border-b border-border bg-gradient-to-b from-primary/5 to-background py-8">
        <div className="container mx-auto px-4">
          <Link
            href={pollingUnit.ward ? `/ward/${pollingUnit.ward.code}` : "/"}
            className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            {t.backTo} {pollingUnit.ward?.name || t.home}
          </Link>

          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <MapPin className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground md:text-3xl">{pollingUnit.name}</h1>
                <p className="text-muted-foreground">{pollingUnit.address || t.lgaLabel}</p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                    {pollingUnit.code}
                  </span>
                  {pollingUnit.ward && (
                    <Link href={`/ward/${pollingUnit.ward.code}`}>
                      <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-sm text-secondary-foreground hover:bg-secondary/80 transition-colors">
                        {pollingUnit.ward.name}
                      </span>
                    </Link>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <VoiceAnnouncement pollingUnit={pollingUnit} />
              {hasCoordinates && (
                // #region agent log
                <Button 
                  className="gap-2"
                  onClick={() => {
                    fetch('http://127.0.0.1:7242/ingest/a0691e2c-cdd7-47b0-9342-76cf3ac06d2f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'polling-unit-details.tsx:71',message:'Get Directions button clicked',data:{hasCoordinates,code:pollingUnit.code,lat:pollingUnit.latitude,lng:pollingUnit.longitude},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
                    const params = new URLSearchParams({ code: pollingUnit.code })
                    window.location.href = `/navigate?${params.toString()}`
                  }}
                >
                  <Navigation className="h-4 w-4" />
                  {t.getDirections}
                </Button>
                // #endregion
              )}
              <Button variant="outline" className="gap-2 bg-transparent" onClick={handleShare}>
                <Share2 className="h-4 w-4" />
                {t.share}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Content Grid */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Info Cards */}
            <div className="space-y-4 lg:col-span-1">
              <Card>
                <CardContent className="p-6">
                  <h2 className="mb-4 font-semibold text-foreground">{t.pollingUnitDetails}</h2>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Users className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">{t.registeredVoters}</p>
                        <p className="font-semibold text-foreground">
                          {(pollingUnit.registered_voters || 0).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <MapPin className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Location</p>
                        <p className="font-semibold text-foreground">{pollingUnit.address || t.lgaLabel}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Calendar className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">{t.votingHours}</p>
                        <p className="font-semibold text-foreground">8:30 AM - 2:30 PM</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {hasCoordinates && (
                <Card>
                  <CardContent className="p-6">
                    <h2 className="mb-4 font-semibold text-foreground">{t.coordinates}</h2>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t.latitude}</span>
                        <span className="font-mono text-foreground">{pollingUnit.latitude}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t.longitude}</span>
                        <span className="font-mono text-foreground">{pollingUnit.longitude}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Map */}
            <div className="lg:col-span-2">
              <Card className="overflow-hidden">
                <CardContent className="p-0">
                  {hasCoordinates ? (
                    <PollingUnitMap
                      latitude={pollingUnit.latitude!}
                      longitude={pollingUnit.longitude!}
                      name={pollingUnit.name}
                    />
                  ) : (
                    <div className="flex h-80 items-center justify-center bg-muted">
                      <div className="text-center">
                        <MapPin className="mx-auto mb-2 h-12 w-12 text-muted-foreground" />
                        <p className="text-muted-foreground">{t.mapNotAvailable}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
