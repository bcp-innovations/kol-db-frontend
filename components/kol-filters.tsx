"use client"

import type { KOLFilters } from "@/lib/types"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Combobox } from "@/components/ui/combobox"
import { Search, X } from "lucide-react"

interface KOLFiltersPanelProps {
  filters: KOLFilters
  onFiltersChange: (filters: KOLFilters) => void
  categoryOptions: { value: string; label: string }[]
  archetypeOptions: { value: string; label: string }[]
  languageOptions: { value: string; label: string }[]
  countryOptions: { value: string; label: string }[]
}

export function KOLFiltersPanel({
  filters,
  onFiltersChange,
  categoryOptions,
  archetypeOptions,
  languageOptions,
  countryOptions,
}: KOLFiltersPanelProps) {
  const updateFilter = (key: keyof KOLFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  const clearFilters = () => {
    onFiltersChange({})
  }

  const hasActiveFilters = Object.entries(filters).some(([key, value]) => {
    if (value === undefined) return false
    if (Array.isArray(value)) return value.length > 0
    if (typeof value === "string") return value !== ""
    return true
  })

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg">Filters</h3>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {/* Search */}
        <div>
          <Label htmlFor="search">Search</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              placeholder="Search KOLs..."
              value={filters.searchQuery || ""}
              onChange={(e) => updateFilter("searchQuery", e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Subscriber Range */}
        <div>
          <Label>Subscriber Count</Label>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <Input
              type="number"
              placeholder="Min"
              value={filters.minSubscribers || ""}
              onChange={(e) =>
                updateFilter("minSubscribers", e.target.value ? Number.parseInt(e.target.value) : undefined)
              }
            />
            <Input
              type="number"
              placeholder="Max"
              value={filters.maxSubscribers || ""}
              onChange={(e) =>
                updateFilter("maxSubscribers", e.target.value ? Number.parseInt(e.target.value) : undefined)
              }
            />
          </div>
        </div>

        {/* Price Range */}
        <div>
          <Label>Price Range ($)</Label>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <Input
              type="number"
              placeholder="Min"
              value={filters.minPrice || ""}
              onChange={(e) => updateFilter("minPrice", e.target.value ? Number.parseInt(e.target.value) : undefined)}
            />
            <Input
              type="number"
              placeholder="Max"
              value={filters.maxPrice || ""}
              onChange={(e) => updateFilter("maxPrice", e.target.value ? Number.parseInt(e.target.value) : undefined)}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="category">Category</Label>
          <Combobox
            options={categoryOptions}
            value={filters.category || []}
            onValueChange={(value) => updateFilter("category", value)}
            placeholder="Select categories..."
            searchPlaceholder="Search categories..."
            emptyText="No category found."
            className="mt-2"
            multiple={true}
          />
        </div>

        <div>
          <Label htmlFor="archetype">Archetype</Label>
          <Combobox
            options={archetypeOptions}
            value={filters.archetype || []}
            onValueChange={(value) => updateFilter("archetype", value)}
            placeholder="Select archetypes..."
            searchPlaceholder="Search archetypes..."
            emptyText="No archetype found."
            className="mt-2"
            multiple={true}
          />
        </div>

        {/* Country */}
        <div>
          <Label htmlFor="country">Country</Label>
          <Combobox
            options={countryOptions}
            value={filters.country || []}
            onValueChange={(value) => updateFilter("country", value)}
            placeholder="Select countries..."
            searchPlaceholder="Search countries..."
            emptyText="No country found."
            className="mt-2"
            multiple={true}
          />
        </div>

        {/* Primary Language */}
        <div>
          <Label htmlFor="language">Primary Language</Label>
          <Combobox
            options={languageOptions}
            value={filters.language || []}
            onValueChange={(value) => updateFilter("language", value)}
            placeholder="Select languages..."
            searchPlaceholder="Search languages..."
            emptyText="No language found."
            className="mt-2"
            multiple={true}
          />
        </div>
      </div>
    </Card>
  )
}
