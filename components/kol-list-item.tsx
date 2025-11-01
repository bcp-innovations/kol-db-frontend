"use client"

import type { KOL } from "@/lib/types"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Users,
  DollarSign,
  TrendingUp,
  Eye,
  Globe,
  XCircle,
  CheckCircle,
  Mail,
  Plus,
  ExternalLink,
  Target,
} from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface KOLListItemProps {
  kol: KOL
  isExcluded?: boolean
  onToggleExclude?: () => void
  isIncluded?: boolean
  onToggleInclude?: () => void
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

export function KOLListItem({
  kol,
  isExcluded = false,
  onToggleExclude,
  isIncluded = false,
  onToggleInclude,
}: KOLListItemProps) {
  const viewsPercentiles = getViewsPercentiles(kol.views)
  const engagementPercentiles = getEngagementPercentiles(kol.engagement_rate)

  const primaryArchetype = kol.archetype && typeof kol.archetype === "object" ? kol.archetype.archetype_primary : null
  const primaryLanguage = kol.language && typeof kol.language === "object" ? kol.language.primary_language : null
  const secondaryLanguage = kol.language && typeof kol.language === "object" ? kol.language.secondary_language : null

  const hasContactInfo = () => {
    if (!kol.socials) return false
    try {
      const socialsData = typeof kol.socials === "string" ? JSON.parse(kol.socials) : kol.socials
      return (
        (Array.isArray(socialsData.emails) && socialsData.emails.length > 0) ||
        (Array.isArray(socialsData.twitter) && socialsData.twitter.length > 0) ||
        (Array.isArray(socialsData.telegram) && socialsData.telegram.length > 0)
      )
    } catch (e) {
      return false
    }
  }

  return (
    <Card
      className={`p-4 hover:shadow-md transition-shadow ${
        isExcluded
          ? "border-2 border-destructive bg-destructive/5"
          : isIncluded
            ? "border-2 border-primary bg-primary/5"
            : ""
      }`}
    >
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
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-lg truncate">{kol.title || "Unknown Channel"}</h3>
                {isExcluded && (
                  <Badge variant="destructive" className="text-xs">
                    Excluded
                  </Badge>
                )}
                {isIncluded && <Badge className="text-xs bg-primary">In Campaign</Badge>}
                {hasContactInfo() && (
                  <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                    <Mail className="h-3 w-3 mr-1" />
                    Contact
                  </Badge>
                )}
              </div>
              <div className="flex flex-wrap gap-2 mt-1">
                {kol.category && (
                  <Badge variant="secondary" className="text-xs">
                    {kol.category}
                  </Badge>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Price - Prominent */}
              <div className="flex items-center gap-2 bg-primary/10 px-3 py-2 rounded-lg">
                <DollarSign className="h-5 w-5 text-primary" />
                <span className="font-bold text-lg">${formatNumber(kol.price || 0)}</span>
              </div>

              {/* View Channel button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(`https://www.youtube.com/channel/${kol.channel_id}`, "_blank")}
                className="h-9"
                title="Open YouTube Channel"
              >
                <ExternalLink className="h-4 w-4 mr-1.5" />
                View Channel
              </Button>

              <Button
                variant={isIncluded ? "default" : "ghost"}
                size="sm"
                onClick={onToggleInclude}
                className="h-9"
                disabled={isExcluded}
              >
                {isIncluded ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Added
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                  </>
                )}
              </Button>

              <Button
                variant={isExcluded ? "destructive" : "ghost"}
                size="sm"
                onClick={onToggleExclude}
                className="h-9"
              >
                {isExcluded ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Include
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4 mr-1" />
                    Exclude
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Metrics Row */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-3">
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

            {/* Archetype - with tooltip on entire cell */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-2 cursor-help">
                    <Target className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">{primaryArchetype || "N/A"}</div>
                      <div className="text-xs text-muted-foreground">Archetype</div>
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p className="font-semibold mb-1">Content Creator Archetype</p>
                  <p className="text-sm">
                    Describes the creator's content style and approach (e.g., Broadcaster, Educator, Entertainer,
                    Community).
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

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
