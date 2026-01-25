import { createClient } from "@/lib/supabase/server"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { PollingUnitDetails } from "@/components/polling-unit-details"
import { notFound } from "next/navigation"

interface PollingUnitPageProps {
  params: Promise<{ code: string }>
}

export default async function PollingUnitPage({ params }: PollingUnitPageProps) {
  const { code } = await params
  const supabase = await createClient()

  const { data: pollingUnit } = await supabase
    .from("polling_units")
    .select("*, ward:wards(*)")
    .eq("code", code)
    .single()

  if (!pollingUnit) {
    notFound()
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <PollingUnitDetails pollingUnit={pollingUnit} />
      <Footer />
    </div>
  )
}
