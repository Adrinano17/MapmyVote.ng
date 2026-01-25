import { Suspense } from "react"
import { createClient } from "@/lib/supabase/server"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { HomeContent } from "@/components/home-content"
import { PageSkeleton } from "@/components/skeletons/page-skeleton"
import { ErrorBoundary } from "@/components/error-boundary"

async function HomePageContent() {
  try {
    const supabase = await createClient()
    const { data: wards, error: wardsError } = await supabase.from("wards").select("*").order("code")
    const { count: pollingUnitCount, error: countError } = await supabase.from("polling_units").select("*", { count: "exact", head: true })

    return <HomeContent wards={wards || []} pollingUnitCount={pollingUnitCount || 0} />
  } catch (error: any) {
    // Return error state instead of crashing
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Error loading page</h2>
          <p className="text-muted-foreground">{error?.message || "An unexpected error occurred"}</p>
        </div>
      </div>
    )
  }
}

export default async function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <ErrorBoundary>
        <Suspense fallback={<PageSkeleton />}>
          <HomePageContent />
        </Suspense>
      </ErrorBoundary>
      <Footer />
    </div>
  )
}
