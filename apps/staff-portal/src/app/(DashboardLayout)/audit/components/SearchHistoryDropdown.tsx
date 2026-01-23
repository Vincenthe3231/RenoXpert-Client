"use client"

import { useState, useEffect, useRef } from "react"
import { Clock, X, History } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { getSearchHistory, removeFromSearchHistory, clearSearchHistory, type SearchHistoryItem } from "@/lib/utils/search-history"
import { formatDistanceToNow } from "date-fns"

interface SearchHistoryDropdownProps {
  onSelectQuery: (query: string) => void
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

export default function SearchHistoryDropdown({
  onSelectQuery,
  isOpen,
  onOpenChange,
}: SearchHistoryDropdownProps) {
  const [history, setHistory] = useState<SearchHistoryItem[]>([])
  const triggerRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (isOpen) {
      setHistory(getSearchHistory())
    }
  }, [isOpen])

  const handleSelect = (query: string) => {
    onSelectQuery(query)
    onOpenChange(false)
  }

  const handleRemove = (e: React.MouseEvent, query: string) => {
    e.stopPropagation()
    removeFromSearchHistory(query)
    setHistory(getSearchHistory())
  }

  const handleClearAll = () => {
    clearSearchHistory()
    setHistory([])
  }

  if (history.length === 0) {
    return null
  }

  return (
    <Popover open={isOpen} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button
          ref={triggerRef}
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => onOpenChange(!isOpen)}
        >
          <History className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-80 p-0" 
        align="end"
        side="bottom"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className="flex items-center justify-between p-3 border-b">
          <h4 className="text-sm font-semibold">Recent Searches</h4>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
            onClick={handleClearAll}
          >
            Clear All
          </Button>
        </div>
        <ScrollArea className="h-[300px]">
          <div className="p-2">
            {history.map((item, index) => (
              <div
                key={`${item.query}-${item.timestamp}`}
                className="group flex items-center justify-between gap-2 p-2 rounded-md hover:bg-muted/50 cursor-pointer transition-colors"
                onClick={() => handleSelect(item.query)}
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <Clock className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                  <span className="text-sm truncate flex-1">{item.query}</span>
                  <span className="text-xs text-muted-foreground flex-shrink-0">
                    {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => handleRemove(e, item.query)}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}

