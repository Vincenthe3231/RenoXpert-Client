/**
 * API Route Constants
 * 
 * Centralized definition of all API routes used across the application.
 * Organized by domain/module for easy navigation and maintenance.
 * 
 * Benefits:
 * - Single source of truth for all routes
 * - Type safety with autocomplete
 * - Easier refactoring (change once, update everywhere)
 * - Self-documenting code structure
 */

export const API_ROUTES = {
  // Authentication & User Management Domain
  AUTH: {
    LOGIN: '/api/auth/login',
    ME: '/api/auth/me',
    LOGOUT: '/api/auth/logout',
    USERS: '/api/auth/users',
    USER: (uuid: string) => `/api/auth/users/${uuid}`,
    RESUBMIT: '/api/auth/resubmit',
    DEACTIVATE_USER: (id: string) => `/api/auth/users/${id}/deactivate`,
  },
  
  // Onboarding Workflow Domain
  ONBOARDING: {
    LIST: '/api/onboarding',
    APPROVAL: (id: number) => `/api/onboarding/${id}/approval`,
    REJECTION: (id: number) => `/api/onboarding/${id}/rejection`,
  },
  
  // Roles & Permissions Domain
  ROLES: {
    LIST: '/api/roles',
    GET: (id: number) => `/api/roles/${id}`,
    PERMISSIONS: '/api/permissions',
    UPDATE_PERMISSIONS: (id: number) => `/api/roles/${id}/permissions`,
  },
} as const

/**
 * Default pagination values
 */
export const DEFAULT_PAGINATION = {
  PAGE: 1,
  PER_PAGE: 15,
} as const

