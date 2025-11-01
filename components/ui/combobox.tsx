"use client"

import * as React from "react"
import { Check, ChevronsUpDown, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"

interface ComboboxProps {
  options: { value: string; label: string }[]
  value?: string | string[]
  onValueChange: (value: string | string[]) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyText?: string
  className?: string
  multiple?: boolean
}

export function Combobox({
  options,
  value,
  onValueChange,
  placeholder = "Select option...",
  searchPlaceholder = "Search...",
  emptyText = "No option found.",
  className,
  multiple = false,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false)

  const selectedValues = multiple ? (Array.isArray(value) ? value : []) : []
  const singleValue = !multiple ? (typeof value === "string" ? value : "") : ""

  const handleSelect = (selectedValue: string) => {
    if (multiple) {
      const newValues = selectedValues.includes(selectedValue)
        ? selectedValues.filter((v) => v !== selectedValue)
        : [...selectedValues, selectedValue]
      onValueChange(newValues)
    } else {
      onValueChange(selectedValue === singleValue ? "" : selectedValue)
      setOpen(false)
    }
  }

  const handleRemove = (valueToRemove: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (multiple) {
      onValueChange(selectedValues.filter((v) => v !== valueToRemove))
    }
  }

  const displayText = React.useMemo(() => {
    if (multiple) {
      if (selectedValues.length === 0) return placeholder
      if (selectedValues.length === 1) {
        return options.find((opt) => opt.value === selectedValues[0])?.label
      }
      return `${selectedValues.length} selected`
    }
    return singleValue ? options.find((option) => option.value === singleValue)?.label : placeholder
  }, [multiple, selectedValues, singleValue, options, placeholder])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
        >
          <span className="truncate">{displayText}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            <CommandEmpty>{emptyText}</CommandEmpty>
            <CommandGroup>
              {multiple && selectedValues.length > 0 && (
                <div className="flex flex-wrap gap-1 p-2 border-b">
                  {selectedValues.map((val) => {
                    const option = options.find((opt) => opt.value === val)
                    return option ? (
                      <Badge key={val} variant="secondary" className="gap-1">
                        {option.label}
                        <X className="h-3 w-3 cursor-pointer" onClick={(e) => handleRemove(val, e)} />
                      </Badge>
                    ) : null
                  })}
                </div>
              )}
              {options.map((option) => {
                const isSelected = multiple ? selectedValues.includes(option.value) : singleValue === option.value

                return (
                  <CommandItem key={option.value} value={option.value} onSelect={() => handleSelect(option.value)}>
                    <Check className={cn("mr-2 h-4 w-4", isSelected ? "opacity-100" : "opacity-0")} />
                    {option.label}
                  </CommandItem>
                )
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
