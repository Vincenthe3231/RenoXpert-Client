/**
 * Activity Logs API Constants
 * 
 * Centralized constants for the activity logs module.
 * Includes query keys, error messages, and configuration values.
 */

/**
 * React Query keys for activity logs-related queries
 */
export const ACTIVITY_LOGS_QUERY_KEYS = {
  LIST: ['activity-logs'] as const,
  DETAIL: (id: number) => ['activity-log', id] as const,
} as const

/**
 * Activity Logs query configuration
 */
export const ACTIVITY_LOGS_QUERY_CONFIG = {
  STALE_TIME: 30 * 1000, // 30 seconds
} as const

