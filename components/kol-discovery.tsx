"use client"

import { useState, useMemo } from "react"
import type { KOL, KOLFilters } from "@/lib/types"
import { KOLCard } from "@/components/kol-card"
import { KOLListItem } from "@/components/kol-list-item"
import { KOLFiltersPanel } from "@/components/kol-filters"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Sparkles, Loader2, LayoutGrid, List, TrendingUp, DollarSign, Eye, Target, Zap } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface KOLDiscoveryProps {
  initialKols: KOL[]
}

export function KOLDiscovery({ initialKols }: KOLDiscoveryProps) {
  const [kols] = useState<KOL[]>(initialKols)
  const [filters, setFilters] = useState<KOLFilters>({})
  const [budget, setBudget] = useState<string>("")
  const [selectedKols, setSelectedKols] = useState<Set<string>>(new Set())
  const [optimizedKols, setOptimizedKols] = useState<KOL[] | null>(null)
  const [optimizationResults, setOptimizationResults] = useState<any>(null)
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  const filterOptions = useMemo(() => {
    const categories = new Set<string>()
    const archetypes = new Set<string>()
    const languages = new Set<string>()
    const countries = new Set<string>()

    kols.forEach((kol) => {
      if (kol.category) categories.add(kol.category)
      if (kol.archetype && typeof kol.archetype === "object" && kol.archetype.archetype_primary) {
        archetypes.add(kol.archetype.archetype_primary)
      }
      if (kol.language && typeof kol.language === "object" && kol.language.primary_language) {
        languages.add(kol.language.primary_language)
      }
      if (kol.country) countries.add(kol.country)
    })

    return {
      categories: Array.from(categories)
        .sort()
        .map((cat) => ({ value: cat, label: cat })),
      archetypes: Array.from(archetypes)
        .sort()
        .map((arch) => ({ value: arch, label: arch })),
      languages: Array.from(languages)
        .sort()
        .map((lang) => ({ value: lang, label: lang })),
      countries: Array.from(countries)
        .sort()
        .map((country) => ({ value: country, label: country })),
    }
  }, [kols])

  const filteredKols = useMemo(() => {
    let result = kols

    if (filters.minSubscribers) {
      result = result.filter((k) => k.subscriber_count >= filters.minSubscribers!)
    }
    if (filters.maxSubscribers) {
      result = result.filter((k) => k.subscriber_count <= filters.maxSubscribers!)
    }
    if (filters.minPrice) {
      result = result.filter((k) => k.price >= filters.minPrice!)
    }
    if (filters.maxPrice) {
      result = result.filter((k) => k.price <= filters.maxPrice!)
    }
    if (filters.category && filters.category.length > 0) {
      result = result.filter((k) => k.category && filters.category!.includes(k.category))
    }
    if (filters.archetype && filters.archetype.length > 0) {
      result = result.filter((k) => {
        if (k.archetype && typeof k.archetype === "object") {
          return filters.archetype!.includes(k.archetype.archetype_primary)
        }
        return false
      })
    }
    if (filters.country && filters.country.length > 0) {
      result = result.filter((k) => k.country && filters.country!.includes(k.country))
    }
    if (filters.language && filters.language.length > 0) {
      result = result.filter((k) => {
        if (k.language && typeof k.language === "object") {
          return filters.language!.includes(k.language.primary_language)
        }
        return false
      })
    }
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase()
      result = result.filter(
        (k) =>
          k.title?.toLowerCase().includes(query) ||
          k.description?.toLowerCase().includes(query) ||
          k.keywords?.toLowerCase().includes(query),
      )
    }

    return result
  }, [kols, filters])

  const displayKols = optimizedKols || filteredKols

  const handleOptimize = async () => {
    if (!budget || Number.parseFloat(budget) <= 0) {
      alert("Please enter a valid budget")
      return
    }

    setIsOptimizing(true)
    try {
      const response = await fetch("/api/optimize-kols", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kols: filteredKols,
          budget: Number.parseFloat(budget),
        }),
      })

      if (!response.ok) throw new Error("Optimization failed")

      const result = await response.json()
      setOptimizedKols(result.optimizedKols)
      setOptimizationResults(result)
    } catch (error) {
      console.error("Optimization error:", error)
      alert("Failed to optimize KOLs. Please try again.")
    } finally {
      setIsOptimizing(false)
    }
  }

  const handleClearOptimization = () => {
    setOptimizedKols(null)
    setOptimizationResults(null)
  }

  const totalCost = displayKols.reduce((sum, kol) => sum + (kol.price || 0), 0)
  const totalViews = displayKols.reduce((sum, kol) => sum + (kol.view_count || 0), 0)

  const costPerView = totalCost > 0 && totalViews > 0 ? totalCost / totalViews : 0
  const avgEfficiency =
    displayKols.length > 0
      ? displayKols.reduce((sum, kol) => sum + kol.view_count / kol.price, 0) / displayKols.length
      : 0

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-foreground">YouTube Crypto KOL Discovery</h1>
          <p className="text-muted-foreground mt-2">Find and optimize the best crypto influencers for your campaign</p>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Card className="p-8 mb-8 bg-gradient-to-br from-primary/5 via-background to-background border-2">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-start gap-4 mb-6">
              <div className="p-3 rounded-lg bg-primary/10">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-2">AI-Powered Campaign Optimization</h2>
                <p className="text-muted-foreground">
                  Enter your budget and let our algorithm find the perfect mix of influencers to maximize your reach and
                  ROI
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="flex items-center gap-3 p-4 rounded-lg bg-card border">
                <Target className="h-5 w-5 text-primary" />
                <div>
                  <div className="text-sm text-muted-foreground">Smart Selection</div>
                  <div className="font-semibold">Best ROI Match</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-lg bg-card border">
                <Zap className="h-5 w-5 text-primary" />
                <div>
                  <div className="text-sm text-muted-foreground">Instant Results</div>
                  <div className="font-semibold">Optimized in Seconds</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-lg bg-card border">
                <TrendingUp className="h-5 w-5 text-primary" />
                <div>
                  <div className="text-sm text-muted-foreground">Maximum Impact</div>
                  <div className="font-semibold">Highest Efficiency</div>
                </div>
              </div>
            </div>

            <div className="flex gap-4 items-end">
              <div className="flex-1 max-w-md">
                <Label htmlFor="budget-hero" className="text-base font-semibold mb-2">
                  Campaign Budget
                </Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="budget-hero"
                    type="number"
                    placeholder="Enter your budget"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    min="0"
                    step="1000"
                    className="pl-10 h-12 text-lg"
                  />
                </div>
              </div>
              <Button onClick={handleOptimize} disabled={isOptimizing || !budget} size="lg" className="h-12 px-8">
                {isOptimizing ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Optimizing...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-5 w-5" />
                    Optimize Campaign
                  </>
                )}
              </Button>
              {optimizedKols && (
                <Button onClick={handleClearOptimization} variant="outline" size="lg" className="h-12 bg-transparent">
                  Clear
                </Button>
              )}
            </div>
          </div>
        </Card>

        {optimizedKols && optimizationResults && (
          <Card className="p-6 mb-8 border-2 border-primary bg-primary/5">
            <div className="flex items-center gap-2 mb-4">
              <Badge className="bg-primary text-primary-foreground">
                <Sparkles className="h-3 w-3 mr-1" />
                Optimized Campaign
              </Badge>
              <span className="text-sm text-muted-foreground">
                AI-selected {optimizedKols.length} influencer{optimizedKols.length !== 1 ? "s" : ""} for maximum impact
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-lg bg-card border">
                <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                  <DollarSign className="h-4 w-4" />
                  Total Investment
                </div>
                <div className="text-2xl font-bold">${optimizationResults.totalCost.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  ${optimizationResults.remainingBudget.toLocaleString()} remaining
                </div>
              </div>

              <div className="p-4 rounded-lg bg-card border">
                <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                  <Eye className="h-4 w-4" />
                  Estimated Reach
                </div>
                <div className="text-2xl font-bold">{(optimizationResults.totalViews / 1000000).toFixed(1)}M</div>
                <div className="text-xs text-muted-foreground mt-1">total views</div>
              </div>

              <div className="p-4 rounded-lg bg-card border">
                <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                  <TrendingUp className="h-4 w-4" />
                  Cost per View
                </div>
                <div className="text-2xl font-bold">
                  ${(optimizationResults.totalCost / optimizationResults.totalViews).toFixed(4)}
                </div>
                <div className="text-xs text-green-600 mt-1">Optimized efficiency</div>
              </div>

              <div className="p-4 rounded-lg bg-card border">
                <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                  <Target className="h-4 w-4" />
                  Influencers
                </div>
                <div className="text-2xl font-bold">{optimizedKols.length}</div>
                <div className="text-xs text-muted-foreground mt-1">selected</div>
              </div>
            </div>

            <div className="mt-4 p-4 rounded-lg bg-green-500/10 border border-green-500/20">
              <div className="flex items-start gap-3">
                <Zap className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <div className="font-semibold text-green-900 dark:text-green-100">
                    Campaign Optimized Successfully
                  </div>
                  <div className="text-sm text-green-700 dark:text-green-200 mt-1">
                    This selection maximizes your reach within budget by choosing influencers with the best
                    views-per-dollar ratio. Average efficiency: {avgEfficiency.toFixed(0)} views per dollar.
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <aside className="lg:col-span-1">
            <KOLFiltersPanel
              filters={filters}
              onFiltersChange={setFilters}
              categoryOptions={filterOptions.categories}
              archetypeOptions={filterOptions.archetypes}
              languageOptions={filterOptions.languages}
              countryOptions={filterOptions.countries}
            />

            {/* Budget Optimization */}
            <Card className="p-6 mt-6">
              <h3 className="font-semibold text-lg mb-4">Budget Optimization</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="budget">Campaign Budget ($)</Label>
                  <Input
                    id="budget"
                    type="number"
                    placeholder="Enter budget"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    min="0"
                    step="1000"
                  />
                </div>
                <Button onClick={handleOptimize} disabled={isOptimizing || !budget} className="w-full">
                  {isOptimizing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Optimizing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Optimize Selection
                    </>
                  )}
                </Button>
                {optimizedKols && (
                  <Button onClick={handleClearOptimization} variant="outline" className="w-full bg-transparent">
                    Clear Optimization
                  </Button>
                )}
              </div>
            </Card>

            {/* Summary Stats */}
          </aside>

          {/* KOL Grid */}
          <main className="lg:col-span-3">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-foreground">
                  {displayKols.length} KOL{displayKols.length !== 1 ? "s" : ""}
                  {optimizedKols && <Badge className="ml-3 bg-primary">Optimized</Badge>}
                </h2>
                {filteredKols.length !== kols.length && !optimizedKols && (
                  <p className="text-sm text-muted-foreground mt-1">Filtered from {kols.length} total KOLs</p>
                )}
              </div>
              <div className="flex items-center gap-1 border rounded-lg p-1">
                <Button
                  variant={viewMode === "grid" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="h-8 px-3"
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="h-8 px-3"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {displayKols.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No KOLs match your current filters</p>
              </div>
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {displayKols.map((kol) => (
                  <KOLCard key={kol.channel_id} kol={kol} />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {displayKols.map((kol) => (
                  <KOLListItem key={kol.channel_id} kol={kol} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}
