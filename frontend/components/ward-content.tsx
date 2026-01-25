"use client"

import { PollingUnitCard } from "@/components/polling-unit-card"
import { MapPin, ArrowLeft, Navigation } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/hooks/use-language"
import { translations, type Ward, type PollingUnit } from "@/lib/types"

interface WardContentProps {
  ward: Ward
  pollingUnits: PollingUnit[]
}

export function WardContent({ ward, pollingUnits }: WardContentProps) {
  const { language } = useLanguage()
  const t = translations[language]

  const totalVoters = pollingUnits?.reduce((sum, pu) => sum + (pu.registered_voters || 0), 0) || 0

  return (
    <main className="flex-1">
      {/* Ward Header */}
      <section className="border-b border-border bg-gradient-to-b from-primary/5 to-background py-8">
        <div className="container mx-auto px-4">
          <Link
            href="/"
            className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            {t.backTo} {t.home}
          </Link>

          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <MapPin className="h-7 w-7" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground md:text-3xl">{ward.name}</h1>
                <p className="text-muted-foreground">
                  {t.wards} Code: {ward.code}
                </p>
              </div>
            </div>

            <Link href={`/map?ward=${ward.code}`}>
              <Button className="gap-2">
                <Navigation className="h-4 w-4" />
                {t.mapView}
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-6 grid grid-cols-2 gap-4 rounded-xl bg-card p-4 shadow-sm md:grid-cols-3">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{pollingUnits?.length || 0}</p>
              <p className="text-sm text-muted-foreground">{t.pollingUnits}</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{totalVoters.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">{t.registeredVoters}</p>
            </div>
            <div className="col-span-2 text-center md:col-span-1">
              <p className="text-2xl font-bold text-primary">Ibadan North</p>
              <p className="text-sm text-muted-foreground">{t.lgaLabel.split(" ")[0]}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Polling Units List */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <h2 className="mb-6 text-xl font-semibold text-foreground">
            {t.pollingUnits} - {ward.name}
          </h2>

          {pollingUnits && pollingUnits.length > 0 ? (
            <div className="space-y-4">
              {pollingUnits.map((pu) => (
                <PollingUnitCard key={pu.id} pollingUnit={{ ...pu, ward }} />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-border p-12 text-center">
              <MapPin className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="mb-2 font-semibold text-foreground">{t.noResults}</h3>
              <p className="text-sm text-muted-foreground">{t.noResultsSubtitle}</p>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
