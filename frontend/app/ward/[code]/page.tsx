import { createClient } from "@/lib/supabase/server"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { WardContent } from "@/components/ward-content"
import { notFound } from "next/navigation"
import type { PollingUnit } from "@/lib/types"

interface WardPageProps {
  params: Promise<{ code: string }>
}

export default async function WardPage({ params }: WardPageProps) {
  const { code } = await params
  const supabase = await createClient()

  const { data: ward } = await supabase.from("wards").select("*").eq("code", code).single()

  if (!ward) {
    notFound()
  }

  const { data: pollingUnits } = await supabase.from("polling_units").select("*").eq("ward_id", ward.id).order("name")

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <WardContent 
        ward={ward} 
        pollingUnits={(pollingUnits || []).map((pu) => ({
          ...pu,
          address: pu.address ?? undefined,
          latitude: pu.latitude ?? undefined,
          longitude: pu.longitude ?? undefined,
        })) as PollingUnit[]} 
      />
      <Footer />
    </div>
  )
}
