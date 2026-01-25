"use client"

import { Suspense } from "react"
import { SearchBox } from "@/components/search-box"
import { PollingUnitCard } from "@/components/polling-unit-card"
import { SearchIcon, MapPin } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/hooks/use-language"
import { translations, type PollingUnit, type Ward } from "@/lib/types"

interface SearchResultsContentProps {
  query: string
  pollingUnits: Array<PollingUnit & { ward: Ward | null }>
}

export function SearchResultsContent({ query, pollingUnits }: SearchResultsContentProps) {
  const { language } = useLanguage()
  const t = translations[language]

  return (
    <main className="flex-1">
      {/* Search Header */}
      <section className="border-b border-border bg-card py-6">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl">
            <Suspense fallback={null}>
              <SearchBox initialQuery={query} />
            </Suspense>
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          {!query ? (
            <div className="rounded-xl border border-dashed border-border p-12 text-center">
              <SearchIcon className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="mb-2 font-semibold text-foreground">{t.searchPrompt}</h3>
              <p className="text-sm text-muted-foreground">{t.step1Desc}</p>
            </div>
          ) : (
            <>
              <div className="mb-6 flex items-center justify-between">
                <p className="text-muted-foreground">
                  {pollingUnits.length} {t.resultsFor} &quot;{query}&quot;
                </p>
                {pollingUnits.length > 0 && (
                  <Link href={`/map?q=${encodeURIComponent(query)}`}>
                    <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                      <MapPin className="h-4 w-4" />
                      {t.mapView}
                    </Button>
                  </Link>
                )}
              </div>

              {pollingUnits.length > 0 ? (
                <div className="space-y-4">
                  {pollingUnits.map((pu) => (
                    <PollingUnitCard
                      key={pu.id}
                      pollingUnit={{
                        ...pu,
                        ward: pu.ward || undefined,
                      }}
                    />
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-border p-12 text-center">
                  <SearchIcon className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                  <h3 className="mb-2 font-semibold text-foreground">{t.noResults}</h3>
                  <p className="mb-4 text-sm text-muted-foreground">{t.noResultsSubtitle}</p>
                  <Link href="/">
                    <Button variant="outline" className="bg-transparent">
                      {t.tryAgain}
                    </Button>
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </main>
  )
}
