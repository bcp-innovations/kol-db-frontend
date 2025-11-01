import type { KOL } from "@/lib/types"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, DollarSign, TrendingUp, Eye, Globe } from "lucide-react"

interface KOLListItemProps {
  kol: KOL
}

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
  return num.toString()
}

function getViewsPercentiles(views: any) {
  if (!views || typeof views !== "object") return null
  return {
    p10: views.p10 || views.views_p10,
    p50: views.p50 || views.views_p50,
    p90: views.p90 || views.views_p90,
  }
}

function getEngagementPercentiles(engagement: any) {
  if (!engagement || typeof engagement !== "object") return null
  return {
    p10: engagement.eng_p10,
    p50: engagement.eng_p50,
    p90: engagement.eng_p90,
  }
}

export function KOLListItem({ kol }: KOLListItemProps) {
  const viewsPercentiles = getViewsPercentiles(kol.views)
  const engagementPercentiles = getEngagementPercentiles(kol.engagement_rate)

  const primaryArchetype = kol.archetype && typeof kol.archetype === "object" ? kol.archetype.archetype_primary : null
  const primaryLanguage = kol.language && typeof kol.language === "object" ? kol.language.primary_language : null
  const secondaryLanguage = kol.language && typeof kol.language === "object" ? kol.language.secondary_language : null

  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        {/* Thumbnail */}
        <img
          src={kol.thumbnail_url || "/placeholder.svg?height=80&width=80"}
          alt={kol.title || "KOL"}
          className="w-20 h-20 rounded-full object-cover flex-shrink-0"
        />

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 mb-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg truncate">{kol.title || "Unknown Channel"}</h3>
              <div className="flex flex-wrap gap-2 mt-1">
                {kol.category && (
                  <Badge variant="secondary" className="text-xs">
                    {kol.category}
                  </Badge>
                )}
                {primaryArchetype && (
                  <Badge variant="outline" className="text-xs">
                    {primaryArchetype}
                  </Badge>
                )}
              </div>
            </div>

            {/* Price - Prominent */}
            <div className="flex items-center gap-2 bg-primary/10 px-3 py-2 rounded-lg flex-shrink-0">
              <DollarSign className="h-5 w-5 text-primary" />
              <span className="font-bold text-lg">${formatNumber(kol.price || 0)}</span>
            </div>
          </div>

          {/* Metrics Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
            {/* Subscribers */}
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <div className="min-w-0">
                <div className="text-sm font-medium">{formatNumber(kol.subscriber_count || 0)}</div>
                <div className="text-xs text-muted-foreground">Subscribers</div>
              </div>
            </div>

            {/* Views per Video */}
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <div className="min-w-0">
                <div className="text-sm font-medium">
                  {viewsPercentiles ? formatNumber(viewsPercentiles.p50) : "N/A"}
                </div>
                <div className="text-xs text-muted-foreground">
                  {viewsPercentiles
                    ? `${formatNumber(viewsPercentiles.p10)}-${formatNumber(viewsPercentiles.p90)}`
                    : "Views/Video"}
                </div>
              </div>
            </div>

            {/* Engagement */}
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <div className="min-w-0">
                <div className="text-sm font-medium">
                  {engagementPercentiles ? `${engagementPercentiles.p50.toFixed(1)}%` : "N/A"}
                </div>
                <div className="text-xs text-muted-foreground">
                  {engagementPercentiles
                    ? `${engagementPercentiles.p10.toFixed(1)}-${engagementPercentiles.p90.toFixed(1)}%`
                    : "Engagement"}
                </div>
              </div>
            </div>

            {/* Location & Language */}
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <div className="min-w-0">
                <div className="text-sm font-medium">{kol.country || "N/A"}</div>
                <div className="text-xs text-muted-foreground">
                  {primaryLanguage ? primaryLanguage.toUpperCase() : "N/A"}
                  {secondaryLanguage && `, ${secondaryLanguage.toUpperCase()}`}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}
