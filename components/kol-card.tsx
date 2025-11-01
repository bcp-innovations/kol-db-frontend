"use client"

import type { KOL } from "@/lib/types"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Eye, Video, DollarSign, TrendingUp } from "lucide-react"
import Image from "next/image"

interface KOLCardProps {
  kol: KOL
}

export function KOLCard({ kol }: KOLCardProps) {
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  const getViewsPercentiles = () => {
    if (!kol.views) return null
    try {
      const viewsData = typeof kol.views === "string" ? JSON.parse(kol.views) : kol.views
      if (viewsData && (viewsData.views_p50 !== undefined || viewsData.p50 !== undefined)) {
        return {
          p10: viewsData.views_p10 || viewsData.p10 || 0,
          p50: viewsData.views_p50 || viewsData.p50 || 0,
          p90: viewsData.views_p90 || viewsData.p90 || 0,
        }
      }
    } catch (e) {
      // Silent fail, will use fallback
    }
    return null
  }

  const getEngagementPercentiles = () => {
    if (!kol.engagement_rate) return null
    try {
      const engagementData =
        typeof kol.engagement_rate === "string" ? JSON.parse(kol.engagement_rate) : kol.engagement_rate

      if (engagementData && engagementData.eng_p50 !== undefined) {
        return {
          p10: engagementData.eng_p10 || 0,
          p50: engagementData.eng_p50 || 0,
          p90: engagementData.eng_p90 || 0,
        }
      }
    } catch (e) {
      // Silent fail
    }
    return null
  }

  const getLanguages = () => {
    if (!kol.language) return null
    try {
      const langData = typeof kol.language === "string" ? JSON.parse(kol.language) : kol.language
      return {
        primary: langData.primary_language || null,
        secondary: langData.secondary_language || null,
      }
    } catch (e) {
      return null
    }
  }

  const getArchetypes = () => {
    if (!kol.archetype) return null
    try {
      const archetypeData = typeof kol.archetype === "string" ? JSON.parse(kol.archetype) : kol.archetype
      return {
        primary: archetypeData.archetype_primary || null,
        secondary: archetypeData.archetype_secondary || null,
      }
    } catch (e) {
      return null
    }
  }

  const viewsPercentiles = getViewsPercentiles()
  const engagementPercentiles = getEngagementPercentiles()
  const languages = getLanguages()
  const archetypes = getArchetypes()

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardHeader className="p-4 pb-3">
        <div className="flex items-start gap-3">
          <div className="relative w-14 h-14 flex-shrink-0">
            {kol.thumbnail_url ? (
              <Image
                src={kol.thumbnail_url || "/placeholder.svg"}
                alt={kol.title || "KOL thumbnail"}
                fill
                className="object-cover rounded-full"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-muted rounded-full">
                <Video className="h-6 w-6 text-muted-foreground" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base line-clamp-2 mb-2">{kol.title || "Untitled Channel"}</h3>
            <div className="flex flex-wrap gap-1.5">
              {kol.category && (
                <Badge variant="secondary" className="text-xs font-medium">
                  {kol.category}
                </Badge>
              )}
              {kol.country && (
                <Badge variant="outline" className="text-xs">
                  📍 {kol.country}
                </Badge>
              )}
              {languages?.primary && (
                <Badge variant="outline" className="text-xs">
                  🗣️ {languages.primary.toUpperCase()}
                </Badge>
              )}
            </div>
          </div>
        </div>
        {(archetypes?.primary || archetypes?.secondary) && (
          <div className="flex flex-wrap gap-1.5 mt-2 pt-2 border-t">
            {archetypes?.primary && (
              <Badge variant="outline" className="text-xs">
                {archetypes.primary}
              </Badge>
            )}
            {archetypes?.secondary && (
              <Badge variant="outline" className="text-xs opacity-75">
                {archetypes.secondary}
              </Badge>
            )}
          </div>
        )}
      </CardHeader>
      <CardContent className="p-4 pt-0 space-y-3">
        {/* Key Metric: Subscribers */}
        <div className="flex items-center justify-between py-2 border-b">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="h-4 w-4" />
            <span className="text-sm font-medium">Subscribers</span>
          </div>
          <span className="font-semibold text-base">{formatNumber(kol.subscriber_count || 0)}</span>
        </div>

        {/* Performance Metrics Section */}
        <div className="space-y-2">
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Performance</div>

          {/* Views per Video */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Eye className="h-4 w-4 mt-0.5" />
              <div className="flex flex-col">
                <span className="text-sm">Views/Video</span>
                {viewsPercentiles && (
                  <span className="text-xs opacity-75">
                    Range: {formatNumber(viewsPercentiles.p10)}-{formatNumber(viewsPercentiles.p90)}
                  </span>
                )}
              </div>
            </div>
            <span className="font-semibold">
              {viewsPercentiles ? formatNumber(viewsPercentiles.p50) : formatNumber(kol.view_count || 0)}
            </span>
          </div>

          {/* Engagement Rate */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2 text-muted-foreground">
              <TrendingUp className="h-4 w-4 mt-0.5" />
              <div className="flex flex-col">
                <span className="text-sm">Engagement</span>
                {engagementPercentiles && (
                  <span className="text-xs opacity-75">
                    Range: {engagementPercentiles.p10.toFixed(1)}%-{engagementPercentiles.p90.toFixed(1)}%
                  </span>
                )}
              </div>
            </div>
            <span className="font-semibold">
              {engagementPercentiles ? `${engagementPercentiles.p50.toFixed(1)}%` : "N/A"}
            </span>
          </div>
        </div>

        {/* Price Section */}
        <div className="flex items-center justify-between py-2 border-t bg-muted/30 -mx-4 px-4 -mb-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <DollarSign className="h-4 w-4" />
            <span className="text-sm font-medium">Price per Video</span>
          </div>
          <span className="font-bold text-lg text-primary">${formatNumber(kol.price || 0)}</span>
        </div>
      </CardContent>
    </Card>
  )
}
