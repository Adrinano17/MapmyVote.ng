import { Suspense } from "react"
import { createClient } from "@/lib/supabase/server"
import { Header } from "@/components/header"
import { MapView } from "@/components/map-view"
import { MapSkeleton } from "@/components/skeletons/map-skeleton"

interface MapPageProps {
  searchParams: Promise<{ q?: string; ward?: string; lat?: string; lng?: string; code?: string }>
}

async function MapPageContent({ searchParams }: MapPageProps) {
  const params = await searchParams
  const query = params.q || ""
  const wardCode = params.ward || ""
  const lat = params.lat ? parseFloat(params.lat) : undefined
  const lng = params.lng ? parseFloat(params.lng) : undefined
  const code = params.code || ""
  const supabase = await createClient()

  let pollingUnitsQuery = supabase.from("polling_units").select("*, ward:wards(*)")

  if (query) {
    pollingUnitsQuery = pollingUnitsQuery.or(`name.ilike.%${query}%,code.ilike.%${query}%,address.ilike.%${query}%`)
  }

  if (wardCode) {
    const { data: ward } = await supabase.from("wards").select("id").eq("code", wardCode).single()
    if (ward) {
      pollingUnitsQuery = pollingUnitsQuery.eq("ward_id", ward.id)
    }
  }

  const { data: pollingUnits } = await pollingUnitsQuery.order("name")

  const { data: wards } = await supabase.from("wards").select("*").order("code")

  return (
    <MapView
      pollingUnits={
        pollingUnits?.map((pu) => ({
          ...pu,
          address: pu.address ?? undefined,
          latitude: pu.latitude ?? undefined,
          longitude: pu.longitude ?? undefined,
          ward: pu.ward || undefined,
        })) || []
      }
      wards={wards || []}
      initialQuery={query}
      initialWard={wardCode}
      initialLat={lat}
      initialLng={lng}
      initialCode={code}
    />
  )
}

export default async function MapPage(props: MapPageProps) {
  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <Header />
      <main className="flex-1 relative min-h-0 overflow-hidden md:overflow-visible">
        <Suspense fallback={<MapSkeleton />}>
          <MapPageContent {...props} />
        </Suspense>
      </main>
    </div>
  )
}
