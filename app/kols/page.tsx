import { createClient } from "@/lib/supabase/server"
import { KOLDiscovery } from "@/components/kol-discovery"

export default async function KOLsPage() {
  const supabase = await createClient()

  // Fetch all KOLs from Supabase
  const { data: kols, error } = await supabase
    .from("kols")
    .select("*")
    .not("views", "is", null)
    .not("engagement_rate", "is", null)
    .order("subscriber_count", { ascending: false })

  if (error) {
    console.error("Error fetching KOLs:", error)
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-destructive">Failed to load KOLs. Please try again later.</p>
      </div>
    )
  }

  return <KOLDiscovery initialKols={kols || []} />
}
