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
  USER: (uuid: string) => ['user', uuid] as const,
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
  STALE_TIME: 30 * 1000, // 30 seconds
} as const

