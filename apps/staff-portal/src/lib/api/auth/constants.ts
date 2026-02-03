/**
 * Auth API Constants
 * 
 * Centralized constants for the authentication and user management module.
 * Includes query keys, error messages, and configuration values.
 */

/**
 * React Query keys for auth-related queries
 */
export const AUTH_QUERY_KEYS = {
  ME: ['auth', 'me'] as const,
  USERS: ['users'] as const,
  OWNERS: ['users', 'owners'] as const,
  VENDORS: ['users', 'vendors'] as const,
  USER: (uuid: string) => ['user', uuid] as const,
  USERS_ALL: ['users', 'all'] as const, // For aggregated views
} as const

/**
 * Default configuration values
 */
export const AUTH_CONFIG = {
  STALE_TIME: Infinity, // Auth state should never be stale
  RETRY: false, // Don't retry auth failures automatically
} as const

/**
 * User query configuration
 */
export const USER_QUERY_CONFIG = {
  STALE_TIME: 5 * 60 * 1000, // 5 minutes (increased from 30 seconds for better cache utilization)
  GC_TIME: 10 * 60 * 1000, // 10 minutes (garbage collection time)
} as const

