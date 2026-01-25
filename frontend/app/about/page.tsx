import { Suspense } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { AboutContent } from "@/components/about-content"
import { PageSkeleton } from "@/components/skeletons/page-skeleton"

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <Suspense fallback={<PageSkeleton />}>
        <AboutContent />
      </Suspense>
      <Footer />
    </div>
  )
}

