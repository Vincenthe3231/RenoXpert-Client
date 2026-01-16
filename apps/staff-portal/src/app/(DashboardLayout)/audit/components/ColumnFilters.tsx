"use client"

import { useState } from "react"
import { Filter, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

export type ColumnFilter = {
  column: string
  enabled: boolean
}

export interface ColumnFiltersProps {
  filters: Record<string, boolean>
  onFiltersChange: (filters: Record<string, boolean>) => void
}

const COLUMN_OPTIONS = [
  { id: "user", label: "User (Name & Email)" },
  { id: "role", label: "Role" },
  { id: "action", label: "Action/Event" },
  { id: "type", label: "Type" },
  { id: "performedBy", label: "Performed By" },
  { id: "date", label: "Date" },
  { id: "details", label: "Details" },
] as const

export default function ColumnFilters({
  filters,
  onFiltersChange,
}: ColumnFiltersProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [localFilters, setLocalFilters] = useState(filters)

  const activeFilterCount = Object.values(filters).filter(Boolean).length
  const allColumnsEnabled = Object.values(localFilters).every(Boolean)
  const someColumnsEnabled = Object.values(localFilters).some(Boolean)

  const handleToggle = (columnId: string) => {
    const newFilters = {
      ...localFilters,
      [columnId]: !localFilters[columnId],
    }
    setLocalFilters(newFilters)
  }

  const handleSelectAll = () => {
    const newFilters = Object.fromEntries(
      COLUMN_OPTIONS.map((opt) => [opt.id, true])
    )
    setLocalFilters(newFilters)
  }

  const handleClearAll = () => {
    const newFilters = Object.fromEntries(
      COLUMN_OPTIONS.map((opt) => [opt.id, false])
    )
    setLocalFilters(newFilters)
  }

  const handleApply = () => {
    onFiltersChange(localFilters)
    setIsOpen(false)
  }

  const handleReset = () => {
    setLocalFilters(filters)
    setIsOpen(false)
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="relative"
        >
          <Filter className="h-4 w-4 mr-2" />
          Column Filters
          {activeFilterCount > 0 && (
            <Badge
              variant="secondary"
              className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-semibold">Search Columns</h4>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={handleSelectAll}
              >
                All
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={handleClearAll}
              >
                None
              </Button>
            </div>
          </div>
          <Separator className="mb-4" />
          <div className="space-y-3 max-h-[300px] overflow-y-auto">
            {COLUMN_OPTIONS.map((option) => (
              <div
                key={option.id}
                className="flex items-center space-x-2 cursor-pointer"
                onClick={() => handleToggle(option.id)}
              >
                <Checkbox
                  id={option.id}
                  checked={localFilters[option.id] ?? true}
                  onCheckedChange={() => handleToggle(option.id)}
                />
                <Label
                  htmlFor={option.id}
                  className="text-sm font-normal cursor-pointer flex-1"
                >
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
          <Separator className="my-4" />
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={handleReset}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              className="flex-1"
              onClick={handleApply}
            >
              Apply
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

