import { type NextRequest, NextResponse } from "next/server"
import type { KOL } from "@/lib/types"

function getP50Views(kol: KOL): number {
  if (!kol.views) return 0

  try {
    const viewsData = typeof kol.views === "string" ? JSON.parse(kol.views) : kol.views
    // Check for both possible key formats
    return viewsData.p50 || viewsData.views_p50 || 0
  } catch {
    return 0
  }
}

export async function POST(request: NextRequest) {
  try {
    const { kols, budget } = await request.json()

    if (!kols || !Array.isArray(kols) || !budget || budget <= 0) {
      return NextResponse.json({ error: "Invalid request parameters" }, { status: 400 })
    }

    // Extract channel IDs from KOLs
    const channel_ids = kols.map((kol: KOL) => kol.channel_id)

    // Call external optimization API
    const optimizationResponse = await fetch("https://c10e98e90302.ngrok-free.app/select-kols", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        budget: budget,
        channel_ids: channel_ids,
      }),
    })

    if (!optimizationResponse.ok) {
      throw new Error(`Optimization API returned ${optimizationResponse.status}`)
    }

    const apiResponse = await optimizationResponse.json()
    const { channel_ids: selectedChannelIds, expected_views, total_cost } = apiResponse

    // Filter KOLs to only include selected channel IDs
    const optimizedKols = kols.filter((kol: KOL) => selectedChannelIds.includes(kol.channel_id))

    const viewsStats =
      typeof expected_views === "object" && expected_views !== null
        ? expected_views
        : { mean: expected_views, p10: expected_views, p50: expected_views, p90: expected_views }

    return NextResponse.json({
      optimizedKols,
      budget: budget,
      total_cost: total_cost,
      expected_views: viewsStats,
      remainingBudget: budget - total_cost,
      // Legacy fields for backwards compatibility
      totalCost: total_cost,
      totalViews: viewsStats.mean, // Use mean for legacy field
    })
  } catch (error) {
    console.error("Optimization error:", error)
    return NextResponse.json({ error: "Failed to optimize KOLs" }, { status: 500 })
  }
}
