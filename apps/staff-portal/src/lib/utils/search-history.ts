"use client"

const SEARCH_HISTORY_KEY = "audit-search-history"
const MAX_HISTORY_ITEMS = 10

export interface SearchHistoryItem {
  query: string
  timestamp: number
}

/**
 * Get search history from localStorage
 */
export function getSearchHistory(): SearchHistoryItem[] {
  if (typeof window === "undefined") return []
  
  try {
    const stored = localStorage.getItem(SEARCH_HISTORY_KEY)
    if (!stored) return []
    
    const history = JSON.parse(stored) as SearchHistoryItem[]
    // Sort by timestamp (newest first) and limit to MAX_HISTORY_ITEMS
    return history
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, MAX_HISTORY_ITEMS)
  } catch (error) {
    console.error("Error reading search history:", error)
    return []
  }
}

/**
 * Add a search query to history
 */
export function addToSearchHistory(query: string): void {
  if (typeof window === "undefined" || !query.trim()) return
  
  try {
    const history = getSearchHistory()
    const trimmedQuery = query.trim()
    
    // Remove duplicate queries (case-insensitive)
    const filteredHistory = history.filter(
      item => item.query.toLowerCase() !== trimmedQuery.toLowerCase()
    )
    
    // Add new query at the beginning
    const newHistory: SearchHistoryItem[] = [
      { query: trimmedQuery, timestamp: Date.now() },
      ...filteredHistory
    ].slice(0, MAX_HISTORY_ITEMS)
    
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(newHistory))
  } catch (error) {
    console.error("Error saving search history:", error)
  }
}

/**
 * Clear search history
 */
export function clearSearchHistory(): void {
  if (typeof window === "undefined") return
  
  try {
    localStorage.removeItem(SEARCH_HISTORY_KEY)
  } catch (error) {
    console.error("Error clearing search history:", error)
  }
}

/**
 * Remove a specific item from search history
 */
export function removeFromSearchHistory(query: string): void {
  if (typeof window === "undefined") return
  
  try {
    const history = getSearchHistory()
    const filteredHistory = history.filter(
      item => item.query.toLowerCase() !== query.toLowerCase()
    )
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(filteredHistory))
  } catch (error) {
    console.error("Error removing from search history:", error)
  }
}

