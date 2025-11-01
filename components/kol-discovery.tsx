"use client"

import { useState, useMemo, useEffect } from "react"
import type { KOL, KOLFilters } from "@/lib/types"
import { KOLCard } from "@/components/kol-card"
import { KOLListItem } from "@/components/kol-list-item"
import { KOLFiltersPanel } from "@/components/kol-filters"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Sparkles,
  Loader2,
  LayoutGrid,
  List,
  TrendingUp,
  DollarSign,
  Eye,
  Target,
  Zap,
  Download,
  ArrowUpDown,
  Filter,
  AlertCircle,
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface KOLDiscoveryProps {
  initialKols: KOL[]
}

type SortOption = "price-asc" | "price-desc" | "subscribers-desc" | "subscribers-asc" | "engagement-desc" | "views-desc"

export function KOLDiscovery({ initialKols }: KOLDiscoveryProps) {
  const [kols] = useState<KOL[]>(initialKols)
  const [filters, setFilters] = useState<KOLFilters>({})
  const [budget, setBudget] = useState<string>("")
  const [selectedKols, setSelectedKols] = useState<Set<string>>(new Set())
  const [excludedKols, setExcludedKols] = useState<Set<string>>(new Set())
  const [includedKols, setIncludedKols] = useState<Set<string>>(new Set())
  const [optimizedKols, setOptimizedKols] = useState<KOL[] | null>(null)
  const [optimizationResults, setOptimizationResults] = useState<any>(null)
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [isOptimizationStale, setIsOptimizationStale] = useState(false)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [sortBy, setSortBy] = useState<SortOption>("subscribers-desc")
  const [showFilters, setShowFilters] = useState(true)
  const [showFilterPrompt, setShowFilterPrompt] = useState(false)

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

  const sortedKols = useMemo(() => {
    const kolsToSort = [...filteredKols]

    switch (sortBy) {
      case "price-asc":
        return kolsToSort.sort((a, b) => (a.price || 0) - (b.price || 0))
      case "price-desc":
        return kolsToSort.sort((a, b) => (b.price || 0) - (a.price || 0))
      case "subscribers-asc":
        return kolsToSort.sort((a, b) => (a.subscriber_count || 0) - (b.subscriber_count || 0))
      case "subscribers-desc":
        return kolsToSort.sort((a, b) => (b.subscriber_count || 0) - (a.subscriber_count || 0))
      case "engagement-desc":
        return kolsToSort.sort((a, b) => {
          const getEngagement = (kol: KOL) => {
            if (!kol.engagement_rate) return 0
            try {
              const data =
                typeof kol.engagement_rate === "string" ? JSON.parse(kol.engagement_rate) : kol.engagement_rate
              return data.eng_p50 || 0
            } catch {
              return 0
            }
          }
          return getEngagement(b) - getEngagement(a)
        })
      case "views-desc":
        return kolsToSort.sort((a, b) => {
          const getViews = (kol: KOL) => {
            if (!kol.views) return kol.view_count || 0
            try {
              const data = typeof kol.views === "string" ? JSON.parse(kol.views) : kol.views
              return data.views_p50 || data.p50 || kol.view_count || 0
            } catch {
              return kol.view_count || 0
            }
          }
          return getViews(b) - getViews(a)
        })
      default:
        return kolsToSort
    }
  }, [filteredKols, sortBy])

  const displayKols = optimizedKols || sortedKols

  const activeFilterCount = useMemo(() => {
    let count = 0
    if (filters.minSubscribers) count++
    if (filters.maxSubscribers) count++
    if (filters.minPrice) count++
    if (filters.maxPrice) count++
    if (filters.category && filters.category.length > 0) count++
    if (filters.archetype && filters.archetype.length > 0) count++
    if (filters.country && filters.country.length > 0) count++
    if (filters.language && filters.language.length > 0) count++
    if (filters.searchQuery) count++
    if (excludedKols.size > 0) count++
    return count
  }, [filters, excludedKols])

  const preOptimizationMetrics = useMemo(() => {
    const totalCost = filteredKols.reduce((sum, kol) => sum + (kol.price || 0), 0)
    const totalViews = filteredKols.reduce((sum, kol) => {
      if (!kol.views) return sum + (kol.view_count || 0)
      try {
        const data = typeof kol.views === "string" ? JSON.parse(kol.views) : kol.views
        return sum + (data.views_p50 || data.p50 || kol.view_count || 0)
      } catch {
        return sum + (kol.view_count || 0)
      }
    }, 0)
    return { totalCost, totalViews, count: filteredKols.length }
  }, [filteredKols])

  useEffect(() => {
    if (optimizedKols && optimizationResults) {
      setIsOptimizationStale(true)
    }
  }, [excludedKols])

  const handleOptimize = async () => {
    const budgetNum = Number.parseFloat(budget)

    if (!budget || budgetNum <= 0) {
      alert("Please enter a valid budget")
      return
    }

    if (activeFilterCount === 0) {
      setShowFilterPrompt(true)
      return
    }

    await runOptimization(budgetNum)
  }

  const runOptimization = async (budgetNum: number) => {
    const kolsForOptimization = filteredKols.filter((kol) => !excludedKols.has(kol.channel_id))

    if (kolsForOptimization.length === 0) {
      alert("No KOLs available for optimization. All KOLs are excluded.")
      return
    }

    const minPrice = Math.min(...kolsForOptimization.map((k) => k.price || 0))
    if (budgetNum < minPrice) {
      alert(`Budget too low. Minimum price among available KOLs is $${minPrice.toLocaleString()}`)
      return
    }

    setIsOptimizing(true)
    setIsOptimizationStale(false)
    try {
      const response = await fetch("/api/optimize-kols", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kols: kolsForOptimization,
          budget: budgetNum,
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
    setIsOptimizationStale(false)
  }

  const handleExport = () => {
    const kolsToExport = optimizedKols || displayKols
    const csvContent = [
      ["Channel ID", "Title", "Subscribers", "Price", "Category", "Country", "Archetype"].join(","),
      ...kolsToExport.map((kol) =>
        [
          kol.channel_id,
          `"${kol.title?.replace(/"/g, '""') || ""}"`,
          kol.subscriber_count,
          kol.price,
          kol.category || "",
          kol.country || "",
          typeof kol.archetype === "object" ? kol.archetype.archetype_primary : "",
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `kol-campaign-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const handleExportCampaign = () => {
    const campaignKols = kols.filter((kol) => includedKols.has(kol.channel_id))

    if (campaignKols.length === 0) {
      alert("No KOLs in campaign. Add KOLs to your campaign first.")
      return
    }

    const csvContent = [
      ["Channel ID", "Title", "Subscribers", "Price", "Category", "Country", "Archetype", "Primary Language"].join(","),
      ...campaignKols.map((kol) =>
        [
          kol.channel_id,
          `"${kol.title?.replace(/"/g, '""') || ""}"`,
          kol.subscriber_count,
          kol.price,
          kol.category || "",
          kol.country || "",
          typeof kol.archetype === "object" ? kol.archetype.archetype_primary : "",
          typeof kol.language === "object" ? kol.language.primary_language : "",
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `my-campaign-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const totalCost = displayKols.reduce((sum, kol) => sum + (kol.price || 0), 0)
  const totalViews = displayKols.reduce((sum, kol) => sum + (kol.view_count || 0), 0)

  const costPerView = totalCost > 0 && totalViews > 0 ? totalCost / totalViews : 0
  const avgEfficiency =
    displayKols.length > 0
      ? displayKols.reduce((sum, kol) => sum + kol.view_count / kol.price, 0) / displayKols.length
      : 0

  const campaignMetrics = useMemo(() => {
    const campaignKols = kols.filter((kol) => includedKols.has(kol.channel_id))
    const totalCost = campaignKols.reduce((sum, kol) => sum + (kol.price || 0), 0)
    const totalViews = campaignKols.reduce((sum, kol) => {
      if (!kol.views) return sum + (kol.view_count || 0)
      try {
        const data = typeof kol.views === "string" ? JSON.parse(kol.views) : kol.views
        return sum + (data.views_p50 || data.p50 || kol.view_count || 0)
      } catch {
        return sum + (kol.view_count || 0)
      }
    }, 0)
    return { count: campaignKols.length, totalCost, totalViews }
  }, [kols, includedKols])

  const formatViews = (views: number) => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M`
    }
    return `${(views / 1000).toFixed(1)}K`
  }

  const toggleExcludeKol = (channelId: string) => {
    setExcludedKols((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(channelId)) {
        newSet.delete(channelId)
      } else {
        newSet.add(channelId)
      }
      return newSet
    })
  }

  const toggleIncludeKol = (channelId: string) => {
    setIncludedKols((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(channelId)) {
        newSet.delete(channelId)
      } else {
        newSet.add(channelId)
      }
      return newSet
    })
  }

  const handleAddAllOptimizedToCampaign = () => {
    if (!optimizedKols) return

    setIncludedKols((prev) => {
      const newSet = new Set(prev)
      optimizedKols.forEach((kol) => {
        newSet.add(kol.channel_id)
      })
      return newSet
    })
  }

  const allOptimizedIncluded = useMemo(() => {
    if (!optimizedKols) return false
    return optimizedKols.every((kol) => includedKols.has(kol.channel_id))
  }, [optimizedKols, includedKols])

  const currentStep = useMemo(() => {
    if (includedKols.size > 0) return 5 // Ready to download
    if (optimizedKols) return 4 // Add KOLs to campaign
    if (budget && Number.parseFloat(budget) > 0) return 3 // Ready to optimize
    if (activeFilterCount > 0) return 2 // Filtering
    return 1 // Just arrived
  }, [activeFilterCount, budget, optimizedKols, includedKols])

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
        <Card className="p-8 mb-6 bg-gradient-to-br from-primary/5 via-background to-background border-2">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-3xl font-bold">AI-Powered Campaign Optimization</h2>
            </div>
            <p className="text-lg text-muted-foreground mb-6">
              Our algorithm automatically selects the optimal combination of influencers to{" "}
              <strong className="text-foreground">maximize your total views</strong> while staying within your budget.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-4 rounded-lg bg-card border">
                <Target className="h-6 w-6 text-primary" />
                <div className="text-left">
                  <div className="text-sm text-muted-foreground">Smart Selection</div>
                  <div className="font-semibold">Best ROI Match</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-lg bg-card border">
                <Zap className="h-6 w-6 text-primary" />
                <div className="text-left">
                  <div className="text-sm text-muted-foreground">Instant Results</div>
                  <div className="font-semibold">Optimized in Seconds</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-lg bg-card border">
                <TrendingUp className="h-6 w-6 text-primary" />
                <div className="text-left">
                  <div className="text-sm text-muted-foreground">Maximum Impact</div>
                  <div className="font-semibold">Highest Efficiency</div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <div className="mb-8 flex items-center justify-center gap-2 text-sm flex-wrap">
          <div className={`flex items-center gap-2 ${currentStep >= 1 ? "text-primary" : "text-muted-foreground"}`}>
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${currentStep >= 1 ? "bg-primary text-primary-foreground" : "bg-muted"}`}
            >
              1
            </div>
            <span className="hidden sm:inline font-medium">Browse</span>
          </div>
          <div className="h-px w-8 bg-border" />
          <div className={`flex items-center gap-2 ${currentStep >= 2 ? "text-primary" : "text-muted-foreground"}`}>
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${currentStep >= 2 ? "bg-primary text-primary-foreground" : "bg-muted"}`}
            >
              2
            </div>
            <span className="hidden sm:inline font-medium">Filter</span>
          </div>
          <div className="h-px w-8 bg-border" />
          <div className={`flex items-center gap-2 ${currentStep >= 3 ? "text-primary" : "text-muted-foreground"}`}>
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${currentStep >= 3 ? "bg-primary text-primary-foreground" : "bg-muted"}`}
            >
              3
            </div>
            <span className="hidden sm:inline font-medium">Optimize</span>
          </div>
          <div className="h-px w-8 bg-border" />
          <div className={`flex items-center gap-2 ${currentStep >= 4 ? "text-primary" : "text-muted-foreground"}`}>
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${currentStep >= 4 ? "bg-primary text-primary-foreground" : "bg-muted"}`}
            >
              4
            </div>
            <span className="hidden sm:inline font-medium">Add to Campaign</span>
          </div>
          <div className="h-px w-8 bg-border" />
          <div className={`flex items-center gap-2 ${currentStep >= 5 ? "text-primary" : "text-muted-foreground"}`}>
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${currentStep >= 5 ? "bg-primary text-primary-foreground" : "bg-muted"}`}
            >
              5
            </div>
            <span className="hidden sm:inline font-medium">Download</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <aside className="lg:col-span-1">
            <div className="lg:hidden mb-4">
              <Button onClick={() => setShowFilters(!showFilters)} variant="outline" className="w-full">
                <Filter className="h-4 w-4 mr-2" />
                {showFilters ? "Hide" : "Show"} Workflow
                {activeFilterCount > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
            </div>

            <div className={`space-y-4 ${showFilters ? "block" : "hidden lg:block"}`}>
              {/* Step 2: Filters */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                    2
                  </div>
                  <h3 className="font-semibold">Filter KOLs</h3>
                </div>
                <KOLFiltersPanel
                  filters={filters}
                  onFiltersChange={setFilters}
                  categoryOptions={filterOptions.categories}
                  archetypeOptions={filterOptions.archetypes}
                  languageOptions={filterOptions.languages}
                  countryOptions={filterOptions.countries}
                />
              </div>

              {/* Step 3: Budget & Optimize */}
              <Card className="p-4 border-2 border-primary/20">
                <div className="flex items-center gap-2 mb-3">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${currentStep >= 3 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
                  >
                    3
                  </div>
                  <h3 className="font-semibold">Optimize Campaign</h3>
                </div>

                <div className="space-y-3">
                  <div>
                    <Label htmlFor="budget-sidebar" className="text-sm font-medium mb-1.5">
                      Campaign Budget
                    </Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="budget-sidebar"
                        type="number"
                        placeholder="Enter budget"
                        value={budget}
                        onChange={(e) => setBudget(e.target.value)}
                        min="0"
                        step="1000"
                        className="pl-9"
                      />
                    </div>
                    {budget && Number.parseFloat(budget) > 0 && filteredKols.length > 0 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Min: ${Math.min(...filteredKols.map((k) => k.price || 0)).toLocaleString()}
                      </p>
                    )}
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
                        Optimize
                      </>
                    )}
                  </Button>

                  {optimizedKols && (
                    <Button
                      onClick={handleClearOptimization}
                      variant="outline"
                      size="sm"
                      className="w-full bg-transparent"
                    >
                      Clear Results
                    </Button>
                  )}

                  <p className="text-xs text-muted-foreground text-center">
                    <Eye className="h-3 w-3 inline mr-1" />
                    Maximize views within budget
                  </p>
                </div>
              </Card>

              {/* Step 4: Optimization Results */}
              {optimizedKols && optimizationResults && (
                <Card className="p-4 border-2 border-primary bg-primary/5">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                      4
                    </div>
                    <h3 className="font-semibold">Optimization Results</h3>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="p-3 rounded-lg bg-card border">
                      <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                        <Target className="h-3 w-3" />
                        Selected KOLs
                      </div>
                      <div className="text-xl font-bold">{optimizedKols.length}</div>
                      <div className="text-xs text-muted-foreground">of {preOptimizationMetrics.count} available</div>
                    </div>

                    <div className="p-3 rounded-lg bg-card border">
                      <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                        <DollarSign className="h-3 w-3" />
                        Total Cost
                      </div>
                      <div className="text-xl font-bold">
                        $
                        {optimizationResults.total_cost?.toLocaleString() ||
                          optimizationResults.totalCost?.toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        ${Math.max(0, optimizationResults.remainingBudget || 0).toLocaleString()} remaining
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-card border">
                      <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                        <Eye className="h-3 w-3" />
                        Expected Views
                      </div>
                      <div className="text-xl font-bold">
                        {formatViews(optimizationResults.expected_views || optimizationResults.totalViews || 0)}
                      </div>
                      <div className="text-xs text-green-600">Optimized reach</div>
                    </div>

                    <div className="p-3 rounded-lg bg-card border">
                      <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                        <TrendingUp className="h-3 w-3" />
                        Cost per View
                      </div>
                      <div className="text-xl font-bold">
                        $
                        {(
                          (optimizationResults.total_cost || optimizationResults.totalCost || 0) /
                          (optimizationResults.expected_views || optimizationResults.totalViews || 1)
                        ).toFixed(4)}
                      </div>
                      <div className="text-xs text-green-600">Best efficiency</div>
                    </div>
                  </div>

                  <Button
                    onClick={handleAddAllOptimizedToCampaign}
                    disabled={allOptimizedIncluded}
                    className="w-full mb-2"
                  >
                    {allOptimizedIncluded ? (
                      <>
                        <Target className="h-4 w-4 mr-2" />
                        All Added ✓
                      </>
                    ) : (
                      <>
                        <Target className="h-4 w-4 mr-2" />
                        Add All to Campaign
                      </>
                    )}
                  </Button>

                  <Button onClick={handleExport} variant="outline" size="sm" className="w-full bg-transparent">
                    <Download className="h-3.5 w-3.5 mr-2" />
                    Export Results CSV
                  </Button>
                </Card>
              )}

              {/* Step 5: Campaign Management */}
              {includedKols.size > 0 && (
                <Card className="p-4 border-2 border-primary bg-primary/5">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                      5
                    </div>
                    <h3 className="font-semibold">My Campaign</h3>
                    <Badge variant="default" className="ml-auto bg-primary">
                      {includedKols.size}
                    </Badge>
                  </div>

                  <div className="space-y-2 mb-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Total Cost:</span>
                      <span className="font-semibold">${campaignMetrics.totalCost.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Est. Views:</span>
                      <span className="font-semibold">{formatViews(campaignMetrics.totalViews)}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Button variant="default" onClick={handleExportCampaign} className="w-full">
                      <Download className="h-4 w-4 mr-2" />
                      Download Campaign
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setIncludedKols(new Set())} className="w-full">
                      Clear Campaign
                    </Button>
                  </div>
                </Card>
              )}

              {/* Excluded KOLs */}
              {excludedKols.size > 0 && (
                <Card className="p-4 border-destructive/50 bg-destructive/5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Excluded KOLs</span>
                    <Badge variant="destructive">{excludedKols.size}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">Won't appear in optimization</p>
                  <Button variant="outline" size="sm" onClick={() => setExcludedKols(new Set())} className="w-full">
                    Clear Exclusions
                  </Button>
                </Card>
              )}
            </div>
          </aside>

          {/* KOL Grid */}
          <main className="lg:col-span-3">
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-bold text-foreground">
                    {displayKols.length} KOL{displayKols.length !== 1 ? "s" : ""}
                  </h2>
                  {optimizedKols && <Badge className="bg-primary">Optimized</Badge>}
                  {activeFilterCount > 0 && !optimizedKols && (
                    <Badge variant="secondary">
                      {activeFilterCount} filter{activeFilterCount !== 1 ? "s" : ""}
                    </Badge>
                  )}
                  {excludedKols.size > 0 && <Badge variant="destructive">{excludedKols.size} excluded</Badge>}
                  {includedKols.size > 0 && <Badge className="bg-primary">{includedKols.size} in campaign</Badge>}
                </div>
                {filteredKols.length !== kols.length && !optimizedKols && (
                  <p className="text-sm text-muted-foreground mt-1">Filtered from {kols.length} total KOLs</p>
                )}
              </div>

              <div className="flex items-center gap-2">
                {!optimizedKols && (
                  <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
                    <SelectTrigger className="w-[180px]">
                      <ArrowUpDown className="h-4 w-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="subscribers-desc">Most Subscribers</SelectItem>
                      <SelectItem value="subscribers-asc">Least Subscribers</SelectItem>
                      <SelectItem value="price-asc">Lowest Price</SelectItem>
                      <SelectItem value="price-desc">Highest Price</SelectItem>
                      <SelectItem value="engagement-desc">Best Engagement</SelectItem>
                      <SelectItem value="views-desc">Most Views</SelectItem>
                    </SelectContent>
                  </Select>
                )}

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
            </div>

            {displayKols.length === 0 ? (
              <Card className="p-12 text-center">
                <div className="max-w-md mx-auto">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                    <Filter className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">No KOLs Found</h3>
                  <p className="text-muted-foreground mb-4">
                    No influencers match your current filters. Try adjusting your criteria to see more results.
                  </p>
                  {activeFilterCount > 0 && (
                    <Button onClick={() => setFilters({})} variant="outline">
                      Clear All Filters
                    </Button>
                  )}
                </div>
              </Card>
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {displayKols.map((kol) => (
                  <KOLCard
                    key={kol.channel_id}
                    kol={kol}
                    isExcluded={excludedKols.has(kol.channel_id)}
                    onToggleExclude={() => toggleExcludeKol(kol.channel_id)}
                    isIncluded={includedKols.has(kol.channel_id)}
                    onToggleInclude={() => toggleIncludeKol(kol.channel_id)}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {displayKols.map((kol) => (
                  <KOLListItem
                    key={kol.channel_id}
                    kol={kol}
                    isExcluded={excludedKols.has(kol.channel_id)}
                    onToggleExclude={() => toggleExcludeKol(kol.channel_id)}
                    isIncluded={includedKols.has(kol.channel_id)}
                    onToggleInclude={() => toggleIncludeKol(kol.channel_id)}
                  />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Re-optimize notification */}
      {isOptimizationStale && (
        <div className="fixed bottom-6 left-6 z-50 max-w-md animate-in slide-in-from-bottom-5">
          <Card className="p-4 shadow-2xl border-2 border-amber-500 bg-amber-50 dark:bg-amber-950/50 backdrop-blur-sm">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-full bg-amber-500/20">
                <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-amber-900 dark:text-amber-100 mb-1">Optimization Outdated</div>
                <p className="text-sm text-amber-700 dark:text-amber-300 mb-3">
                  You've excluded KOLs since the last optimization. Re-run to get updated results.
                </p>
                <div className="flex gap-2">
                  <Button
                    onClick={handleOptimize}
                    disabled={isOptimizing}
                    size="sm"
                    className="bg-amber-600 hover:bg-amber-700 text-white"
                  >
                    {isOptimizing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Re-optimizing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Re-Optimize Now
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={() => setIsOptimizationStale(false)}
                    variant="ghost"
                    size="sm"
                    className="text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/30"
                  >
                    Dismiss
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Filter Prompt Dialog */}
      <Dialog open={showFilterPrompt} onOpenChange={setShowFilterPrompt}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              No Filters Applied
            </DialogTitle>
            <DialogDescription className="space-y-3 pt-2">
              <p>
                You haven't applied any filters yet. Without filters, the optimization will consider all {kols.length}{" "}
                KOLs in the database.
              </p>
              <p className="font-medium text-foreground">For better results, we recommend filtering by:</p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Category (e.g., Crypto, DeFi, NFTs)</li>
                <li>Language (e.g., English, Spanish)</li>
                <li>Country/Region</li>
                <li>Subscriber range</li>
                <li>Price range</li>
              </ul>
              <p className="text-sm">This ensures you get influencers that match your campaign's target audience.</p>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={async () => {
                setShowFilterPrompt(false)
                const budgetNum = Number.parseFloat(budget)
                await runOptimization(budgetNum)
              }}
              disabled={isOptimizing}
              className="w-full sm:w-auto"
            >
              Continue with All KOLs
            </Button>
            <Button
              onClick={() => {
                setShowFilterPrompt(false)
                setShowFilters(true)
                // Scroll to filters section on mobile
                if (window.innerWidth < 1024) {
                  window.scrollTo({ top: 400, behavior: "smooth" })
                }
              }}
              className="w-full sm:w-auto"
            >
              <Filter className="h-4 w-4 mr-2" />
              Add Filters First
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
