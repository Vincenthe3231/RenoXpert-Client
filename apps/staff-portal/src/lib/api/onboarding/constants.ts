/**
 * Onboarding API Constants
 * 
 * Centralized constants for the onboarding workflow module.
 * Includes query keys, error messages, and configuration values.
 */

/**
 * React Query keys for onboarding-related queries
 */
export const ONBOARDING_QUERY_KEYS = {
  LIST: ['onboardings'] as const,
  DETAIL: (id: number) => ['onboarding', id] as const,
} as const

/**
 * Onboarding query configuration
 */
export const ONBOARDING_QUERY_CONFIG = {
  STALE_TIME: 30 * 1000, // 30 seconds
} as const

/**
 * Default onboarding filter values
 */
export const ONBOARDING_DEFAULTS = {
  STATUS: 'pending' as const,
} as const

