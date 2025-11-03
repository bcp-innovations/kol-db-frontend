export interface KOL {
  channel_id: string
  title: string
  description: string
  subscriber_count: number
  view_count: number
  video_count: number
  engagement_rate: any
  views: any
  price: number
  thumbnail_url: string
  category: string
  country: string
  language: any
  archetype: any
  focus: any
  socials: any
  keywords: string
  published_at: string
}

export interface KOLFilters {
  minSubscribers?: number
  maxSubscribers?: number
  minPrice?: number
  maxPrice?: number
  category?: string[]
  archetype?: string[]
  country?: string[]
  language?: string[]
  searchQuery?: string
}

export interface ExpectedViewsStats {
  mean: number
  p10: number
  p50: number
  p90: number
}
