import { Suspense } from "react"
import { createClient } from "@/lib/supabase/server"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { SearchResultsContent } from "@/components/search-results-content"
import type { PollingUnit, Ward } from "@/lib/types"

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams
  const query = params.q || ""

  const supabase = await createClient()

  let pollingUnits: Array<{
    id: string
    name: string
    code: string
    address: string | null
    ward_id: string
    latitude: number | null
    longitude: number | null
    registered_voters: number
    created_at: string
    updated_at: string
    ward: { id: string; name: string; code: string } | null
  }> = []

  if (query) {
    const { data } = await supabase
      .from("polling_units")
      .select("*, ward:wards(*)")
      .or(`name.ilike.%${query}%,code.ilike.%${query}%,address.ilike.%${query}%`)
      .order("name")
      .limit(50)

    pollingUnits = data || []
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <Suspense
        fallback={<div className="flex-1 flex items-center justify-center text-muted-foreground">Loading...</div>}
      >
        <SearchResultsContent 
          query={query} 
          pollingUnits={pollingUnits.map((pu) => ({
            ...pu,
            address: pu.address ?? undefined,
            latitude: pu.latitude ?? undefined,
            longitude: pu.longitude ?? undefined,
            ward: pu.ward || null,
          })) as Array<PollingUnit & { ward: Ward | null }>} 
        />
      </Suspense>
      <Footer />
    </div>
  )
}
