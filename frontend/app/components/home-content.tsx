"use client"

import Image from "next/image"
import { SearchBox } from "@/components/search-box"
import { WardGrid } from "@/components/ward-grid"
import { MapPin, Vote, Navigation, Mic } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/hooks/use-language"
import { translations, type Ward } from "@/lib/types"
import { fadeInUp, fadeIn, slideInLeft, slideInRight, staggerContainer, staggerItem } from "@/lib/animations"
import { WaveSection } from "@/components/motion/wave-section"
import { useTheme } from "next-themes"
import { useEffect, useRef } from "react"

interface HomeContentProps {
  wards: Ward[]
  pollingUnitCount: number
}

export function HomeContent({ wards, pollingUnitCount }: HomeContentProps) {
  const { language } = useLanguage()
  const t = translations[language]
  const { theme } = useTheme()
  const overlayRef = useRef<HTMLDivElement>(null)
  
  // #region agent log
  useEffect(() => {
    if (overlayRef.current) {
      const computedStyle = window.getComputedStyle(overlayRef.current)
      fetch('http://127.0.0.1:7242/ingest/a0691e2c-cdd7-47b0-9342-76cf3ac06d2f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'home-content.tsx:useEffect',message:'Overlay styles check',data:{theme,backgroundColor:computedStyle.backgroundColor,opacity:computedStyle.opacity},timestamp:Date.now(),runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    }
  }, [theme]);
  // #endregion

  return (
    <main className="flex-1">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 to-background py-16 md:py-24">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <div className="relative h-full w-full">
            <Image
              src="/hero-section.jpg"
              alt="INEC Voting Process"
              fill
              className="object-cover object-center"
              priority
              quality={90}
            />
            {/* Gradient Overlay for better text readability */}
            <div 
              ref={overlayRef}
              className={`absolute inset-0 bg-gradient-to-b ${
                theme === 'dark' 
                  ? 'from-background/85 via-background/70 to-background/80' 
                  : 'from-background/60 via-background/50 to-background/55'
              }`}
            />
            {/* Warm sunset overlay to match image */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-primary/10" />
          </div>
        </div>
        {/* Subtle wave effect overlay */}
        <motion.div
          className="absolute inset-0 z-[1] pointer-events-none"
          animate={{
            x: ["-100%", "200%"],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent transform -skew-x-12" />
        </motion.div>
        <motion.div
          className="absolute inset-0 z-[1] pointer-events-none"
          animate={{
            x: ["-100%", "200%"],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
            delay: 2,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/3 to-transparent transform -skew-x-12" />
        </motion.div>

        <div className="relative z-10 container mx-auto px-4">
          <motion.div
            className="mx-auto max-w-3xl text-center"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            <motion.div
              variants={fadeInUp}
              className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/20 backdrop-blur-sm px-4 py-2 text-sm font-medium text-primary border border-primary/20"
            >
              <Vote className="h-4 w-4" />
              {t.lgaLabel}
            </motion.div>
            <motion.h1
              variants={fadeInUp}
              className="mb-4 text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl text-balance drop-shadow-lg"
            >
              {t.heroTitle}
            </motion.h1>
            <motion.p
              variants={fadeInUp}
              className="mb-8 text-lg text-foreground/95 md:text-xl text-pretty drop-shadow-md"
            >
              {t.heroSubtitle}
            </motion.p>

            {/* Search Box */}
            <motion.div variants={fadeInUp} className="mb-8">
              <SearchBox size="large" />
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              variants={staggerItem}
              className="flex flex-wrap items-center justify-center gap-4"
            >
              <Link href="/map">
                <Button variant="outline" size="lg" className="gap-2 bg-background/90 backdrop-blur-sm border-foreground/20 hover:bg-background">
                  <Navigation className="h-4 w-4" />
                  {t.browseMap}
                </Button>
              </Link>
              <Link href="/navigate">
                <Button size="lg" className="gap-2 shadow-lg">
                  <Navigation className="h-4 w-4" />
                  {language === "yo" ? "Bẹ̀rẹ̀ Ìtọ́sọ́nà" : language === "pcm" ? "Start Navigation" : "Start Navigation"}
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <WaveSection className="border-y border-border bg-card py-8" waveColor="primary">
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            className="grid grid-cols-2 gap-8 md:grid-cols-4"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
          >
            <motion.div variants={staggerItem} className="text-center">
              <p className="text-3xl font-bold text-primary md:text-4xl">{wards?.length || 12}</p>
              <p className="text-sm text-muted-foreground">{t.wards}</p>
            </motion.div>
            <motion.div variants={staggerItem} className="text-center">
              <p className="text-3xl font-bold text-primary md:text-4xl">{pollingUnitCount || 48}</p>
              <p className="text-sm text-muted-foreground">{t.pollingUnits}</p>
            </motion.div>
            <motion.div variants={staggerItem} className="text-center">
              <p className="text-3xl font-bold text-primary md:text-4xl">5</p>
              <p className="text-sm text-muted-foreground">{t.languages}</p>
            </motion.div>
            <motion.div variants={staggerItem} className="text-center">
              <p className="text-3xl font-bold text-primary md:text-4xl">24/7</p>
              <p className="text-sm text-muted-foreground">{t.availability}</p>
            </motion.div>
          </motion.div>
        </div>
      </WaveSection>

      {/* Browse by Ward */}
      <WaveSection className="py-12 md:py-16">
        <div className="container mx-auto px-4 relative z-10">
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
      </WaveSection>

      {/* Features Section */}
      <WaveSection className="bg-secondary/50 py-12 md:py-16" waveColor="background">
        <div className="container mx-auto px-4 relative z-10">
          <div className="mb-8 text-center">
            <h2 className="mb-2 text-2xl font-bold text-foreground md:text-3xl">{t.howItWorks}</h2>
            <p className="text-muted-foreground">{t.howItWorksSubtitle}</p>
          </div>
          <motion.div
            className="grid gap-6 md:grid-cols-3"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            <motion.div
              variants={staggerItem}
              className="rounded-xl bg-card p-6 text-center shadow-sm relative overflow-hidden group"
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent transform -skew-x-12"
                  animate={{
                    x: ["-100%", "200%"],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                />
              </div>
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground relative z-10">
                <span className="text-xl font-bold">1</span>
              </div>
              <h3 className="mb-2 font-semibold text-foreground relative z-10">{t.step1Title}</h3>
              <p className="text-sm text-muted-foreground relative z-10">{t.step1Desc}</p>
            </motion.div>
            <motion.div
              variants={staggerItem}
              className="rounded-xl bg-card p-6 text-center shadow-sm relative overflow-hidden group"
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent transform -skew-x-12"
                  animate={{
                    x: ["-100%", "200%"],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                />
              </div>
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground relative z-10">
                <span className="text-xl font-bold">2</span>
              </div>
              <h3 className="mb-2 font-semibold text-foreground relative z-10">{t.step2Title}</h3>
              <p className="text-sm text-muted-foreground relative z-10">{t.step2Desc}</p>
            </motion.div>
            <motion.div
              variants={staggerItem}
              className="rounded-xl bg-card p-6 text-center shadow-sm relative overflow-hidden group"
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent transform -skew-x-12"
                  animate={{
                    x: ["-100%", "200%"],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                />
              </div>
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground relative z-10">
                <span className="text-xl font-bold">3</span>
              </div>
              <h3 className="mb-2 font-semibold text-foreground relative z-10">{t.step3Title}</h3>
              <p className="text-sm text-muted-foreground relative z-10">{t.step3Desc}</p>
            </motion.div>
          </motion.div>
        </div>
      </WaveSection>
    </main>
  )
}
