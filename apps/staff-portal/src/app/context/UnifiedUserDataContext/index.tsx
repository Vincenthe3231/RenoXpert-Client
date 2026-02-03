'use client'

import React, { createContext, useContext, useMemo, useEffect } from 'react'
import { useUnifiedUsers } from '@/lib/api/auth/useUnifiedUsers'
import { useAuth } from '@/lib/api/auth/auth.hooks'
import type { GetUsersParams, User } from '@/lib/api/auth/auth.schemas'

/**
 * Loading strategy for user data fetching
 * - 'eager': Always fetch immediately with large page size
 * - 'lazy': Only fetch when explicitly requested
 * - 'smart': Eager load for admin/super-admin, lazy for others
 */
type LoadingStrategy = 'eager' | 'lazy' | 'smart'

interface UnifiedUserDataProviderProps {
  children: React.ReactNode
  params?: GetUsersParams
  strategy?: LoadingStrategy
}

/**
 * Context for unified user data across the application
 * Provides a single source of truth for user data fetching
 * Automatically handles role-based endpoint selection and data merging
 */
type UnifiedUserDataContextType = {
  // Unified user data (merged from all sources)
  allUsers: User[]
  isLoading: boolean
  isFetching: boolean
  error: Error | null
  strategy: LoadingStrategy
  isEagerLoaded: boolean
  
  // Individual query states (for advanced use cases)
  usersQuery: ReturnType<typeof useUnifiedUsers>['usersQuery']
  ownersQuery: ReturnType<typeof useUnifiedUsers>['ownersQuery']
  vendorsQuery: ReturnType<typeof useUnifiedUsers>['vendorsQuery']
  
  // Helper functions
  getUserById: (id: number | string | null | undefined) => User | undefined
  getUserByUuid: (uuid: string | null | undefined) => User | undefined
  getUserByName: (name: string | null | undefined) => User | undefined
  getUserAvatarUrl: (user: User | null | undefined) => string | null
}

const UnifiedUserDataContext = createContext<UnifiedUserDataContextType | undefined>(undefined)

/**
 * Provider component that wraps the application with unified user data
 * Pre-fetches commonly needed user data with optimal parameters
 * Supports smart loading strategy for performance optimization
 */
export function UnifiedUserDataProvider({ 
  children,
  params,
  strategy = 'smart'
}: UnifiedUserDataProviderProps) {
  const { data: currentUser } = useAuth()
  
  // Determine if we should eager load based on strategy and user role
  const shouldEagerLoad = useMemo(() => {
    if (strategy === 'eager') return true
    if (strategy === 'lazy') return false
    
    // Smart: eager load only for admin/super-admin
    if (!currentUser?.profile) return false
    
    // Type-safe role extraction
    const profile = currentUser.profile as any
    const userRoles = (profile?.roles || []) as string[]
    const roles = userRoles.map((r: string) => 
      typeof r === 'string' ? r.toLowerCase().trim().replace(/\s+/g, '-').replace(/_/g, '-') : ''
    ).filter((r: string) => r.length > 0)
    
    return roles.some((role: string) => 
      role === 'admin' || 
      role === 'super-admin' || 
      role === 'superadmin'
    )
  }, [strategy, currentUser])
  
  // Adjust params based on loading strategy
  const defaultParams: GetUsersParams = {
    perPage: shouldEagerLoad ? 1000 : 50,
    ...params,
  }
  
  // Only fetch if eager loading or params provided
  const effectiveParams = shouldEagerLoad ? defaultParams : params
  
  const {
    data,
    isLoading,
    isFetching,
    error,
    usersQuery,
    ownersQuery,
    vendorsQuery,
  } = useUnifiedUsers(effectiveParams)

  const allUsers = data?.data || []

  // Create lookup maps for O(1) access
  const userMapById = useMemo(() => {
    const map = new Map<number | string, User>()
    allUsers.forEach(user => {
      if (user.id != null) {
        map.set(user.id, user)
        // Also map string version of ID
        map.set(String(user.id), user)
      }
    })
    return map
  }, [allUsers])

  const userMapByUuid = useMemo(() => {
    const map = new Map<string, User>()
    allUsers.forEach(user => {
      if (user.uuid) {
        map.set(user.uuid, user)
      }
    })
    return map
  }, [allUsers])

  // Helper functions for easy user lookup
  const getUserById = (id: number | string | null | undefined): User | undefined => {
    if (id == null) return undefined
    return userMapById.get(id)
  }

  const getUserByUuid = (uuid: string | null | undefined): User | undefined => {
    if (!uuid) return undefined
    return userMapByUuid.get(uuid)
  }

  const getUserByName = (name: string | null | undefined): User | undefined => {
    if (!name) return undefined
    return allUsers.find(u => u.name === name)
  }

  const getUserAvatarUrl = (user: User | null | undefined): string | null => {
    if (!user?.profile) return null
    const profile = user.profile as any
    return profile?.avatarUrl || null
  }

  // Performance monitoring in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[UnifiedUserData] Strategy:', strategy)
      console.log('[UnifiedUserData] Eager load:', shouldEagerLoad)
      console.log('[UnifiedUserData] Users loaded:', allUsers.length)
      const memoryEstimate = JSON.stringify(allUsers).length / 1024
      console.log('[UnifiedUserData] Memory estimate:', memoryEstimate.toFixed(2) + 'KB')
    }
  }, [allUsers, strategy, shouldEagerLoad])

  const value: UnifiedUserDataContextType = {
    allUsers,
    isLoading,
    isFetching,
    error: error as Error | null,
    strategy,
    isEagerLoaded: shouldEagerLoad,
    usersQuery,
    ownersQuery,
    vendorsQuery,
    getUserById,
    getUserByUuid,
    getUserByName,
    getUserAvatarUrl,
  }

  return (
    <UnifiedUserDataContext.Provider value={value}>
      {children}
    </UnifiedUserDataContext.Provider>
  )
}

/**
 * Hook to access unified user data context
 * Throws error if used outside provider
 */
export function useAllUsers() {
  const context = useContext(UnifiedUserDataContext)
  if (context === undefined) {
    throw new Error('useAllUsers must be used within UnifiedUserDataProvider')
  }
  return context
}



