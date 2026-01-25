"use client"

import { SearchBox } from "@/components/search-box"
import { WardGrid } from "@/components/ward-grid"
import { MapPin, Vote, Navigation, Mic } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/hooks/use-language"
import { translations, type Ward } from "@/lib/types"

interface HomeContentProps {
  wards: Ward[]
  pollingUnitCount: number
}

export function HomeContent({ wards, pollingUnitCount }: HomeContentProps) {
  const { language } = useLanguage()
  const t = translations[language]

  return (
    <main className="flex-1">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 to-background py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
              <Vote className="h-4 w-4" />
              {t.lgaLabel}
            </div>
            <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl text-balance">
              {t.heroTitle}
            </h1>
            <p className="mb-8 text-lg text-muted-foreground md:text-xl text-pretty">{t.heroSubtitle}</p>

            {/* Search Box */}
            <div className="mb-8">
              <SearchBox size="large" />
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link href="/map">
                <Button variant="outline" size="lg" className="gap-2 bg-transparent">
                  <Navigation className="h-4 w-4" />
                  {t.browseMap}
                </Button>
              </Link>
              <Button variant="ghost" size="lg" className="gap-2">
                <Mic className="h-4 w-4" />
                {t.voiceSearch}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y border-border bg-card py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-primary md:text-4xl">{wards?.length || 12}</p>
              <p className="text-sm text-muted-foreground">{t.wards}</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-primary md:text-4xl">{pollingUnitCount || 48}</p>
              <p className="text-sm text-muted-foreground">{t.pollingUnits}</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-primary md:text-4xl">3</p>
              <p className="text-sm text-muted-foreground">{t.languages}</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-primary md:text-4xl">24/7</p>
              <p className="text-sm text-muted-foreground">{t.availability}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Browse by Ward */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="mb-8 text-center">
            <h2 className="mb-2 text-2xl font-bold text-foreground md:text-3xl">{t.browseByWard}</h2>
            <p className="text-muted-foreground">{t.browseByWardSubtitle}</p>
          </div>
          {wards && wards.length > 0 ? (
            <WardGrid wards={wards} />
          ) : (
            <div className="rounded-xl border border-dashed border-border p-12 text-center">
              <MapPin className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="mb-2 font-semibold text-foreground">{t.noWardsFound}</h3>
              <p className="text-sm text-muted-foreground">{t.noWardsSubtitle}</p>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-secondary/50 py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="mb-8 text-center">
            <h2 className="mb-2 text-2xl font-bold text-foreground md:text-3xl">{t.howItWorks}</h2>
            <p className="text-muted-foreground">{t.howItWorksSubtitle}</p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-xl bg-card p-6 text-center shadow-sm">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <span className="text-xl font-bold">1</span>
              </div>
              <h3 className="mb-2 font-semibold text-foreground">{t.step1Title}</h3>
              <p className="text-sm text-muted-foreground">{t.step1Desc}</p>
            </div>
            <div className="rounded-xl bg-card p-6 text-center shadow-sm">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <span className="text-xl font-bold">2</span>
              </div>
              <h3 className="mb-2 font-semibold text-foreground">{t.step2Title}</h3>
              <p className="text-sm text-muted-foreground">{t.step2Desc}</p>
            </div>
            <div className="rounded-xl bg-card p-6 text-center shadow-sm">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <span className="text-xl font-bold">3</span>
              </div>
              <h3 className="mb-2 font-semibold text-foreground">{t.step3Title}</h3>
              <p className="text-sm text-muted-foreground">{t.step3Desc}</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
