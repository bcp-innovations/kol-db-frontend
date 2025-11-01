import { type NextRequest, NextResponse } from "next/server"
import type { KOL } from "@/lib/types"

export async function POST(request: NextRequest) {
  try {
    const { kols, budget } = await request.json()

    if (!kols || !Array.isArray(kols) || !budget || budget <= 0) {
      return NextResponse.json({ error: "Invalid request parameters" }, { status: 400 })
    }

    // Optimization algorithm: Maximize views within budget
    // This is a greedy algorithm that selects KOLs with the best views-per-dollar ratio

    // Calculate efficiency (views per dollar) for each KOL
    const kolsWithEfficiency = kols
      .filter((kol: KOL) => kol.price > 0 && kol.view_count > 0)
      .map((kol: KOL) => ({
        ...kol,
        efficiency: kol.view_count / kol.price,
      }))
      .sort((a, b) => b.efficiency - a.efficiency)

    // Greedy selection: pick KOLs with best efficiency until budget is exhausted
    const optimizedKols: KOL[] = []
    let remainingBudget = budget

    for (const kol of kolsWithEfficiency) {
      if (kol.price <= remainingBudget) {
        optimizedKols.push(kol)
        remainingBudget -= kol.price
      }
    }

    // If no KOLs fit the budget, return the most efficient ones that are affordable
    if (optimizedKols.length === 0) {
      const affordableKols = kolsWithEfficiency.filter((kol: KOL) => kol.price <= budget)
      if (affordableKols.length > 0) {
        optimizedKols.push(affordableKols[0])
      }
    }

    return NextResponse.json({
      optimizedKols,
      totalCost: optimizedKols.reduce((sum, kol) => sum + kol.price, 0),
      totalViews: optimizedKols.reduce((sum, kol) => sum + kol.view_count, 0),
      remainingBudget,
    })
  } catch (error) {
    console.error("Optimization error:", error)
    return NextResponse.json({ error: "Failed to optimize KOLs" }, { status: 500 })
  }
}
