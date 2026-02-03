import { useMemo } from 'react'
import { useUsers, useOwners, useVendors, useAuth } from './auth.hooks'
import type { GetUsersParams, User, UserListResponse } from './auth.schemas'

/**
 * Unified hook that abstracts role-based endpoint switching
 * Automatically selects the correct endpoint based on user role
 * and merges data from multiple sources when needed
 */
export function useUnifiedUsers(params?: GetUsersParams) {
  const { data: currentUser } = useAuth()
  
  // Fallback for extracting roles from currentUser.profile in a robust way
  function extractRoles(profile: any): string[] {
    if (!profile) return []
    // Try direct roles property (array of strings)
    if (Array.isArray((profile as any).roles)) {
      return (profile as any).roles.filter((role: unknown) => typeof role === 'string') as string[]
    }
    // Try roles inside a subobject
    if ((profile as any).role && typeof (profile as any).role === 'string') {
      return [((profile as any).role as string)]
    }
    // Known fallback: model with string properties only, no roles
    return []
  }

  // Determine user role
  const isStaff = useMemo(() => {
    if (!currentUser || !currentUser.profile) return false
    const userRoles = extractRoles(currentUser.profile)
    const normalizedUserRoles: string[] = userRoles.map((role: string) => {
      if (typeof role !== 'string') return ''
      return role.toLowerCase().trim().replace(/\s+/g, '-').replace(/_/g, '-')
    }).filter((role: string) => role.length > 0)
    
    const isSuperAdmin = normalizedUserRoles.some((role: string) =>
      role === 'super-admin' || role === 'superadmin'
    )
    const isAdmin = normalizedUserRoles.includes('admin')
    
    // Staff if they have staff role but not admin or super-admin
    return normalizedUserRoles.includes('staff') && !isAdmin && !isSuperAdmin
  }, [currentUser])

  const isAdminOrSuperAdmin = useMemo(() => {
    if (!currentUser || !currentUser.profile) return false
    const userRoles = extractRoles(currentUser.profile)
    const normalizedUserRoles: string[] = userRoles.map((role: string) => {
      if (typeof role !== 'string') return ''
      return role.toLowerCase().trim().replace(/\s+/g, '-').replace(/_/g, '-')
    }).filter((role: string) => role.length > 0)
    
    return normalizedUserRoles.some((role: string) =>
      role === 'super-admin' || role === 'superadmin' || role === 'admin'
    )
  }, [currentUser])

  // Determine effective type filter
  // Staff users always see owners, admin/super-admin see based on params.type
  const effectiveType = useMemo(() => {
    if (isStaff) return 'owner' // Staff users always see owners
    return (params?.type || 'staff') as 'staff' | 'owner' | 'vendor'
  }, [isStaff, params?.type])

  // Create empty query state for disabled queries (backward compatibility)
  const emptyQueryState = {
    data: undefined,
    isLoading: false,
    isFetching: false,
    error: null,
  } as const

  // Automatically select correct endpoint based on role and type filter
  // Only fetch from the relevant endpoint to avoid cross-contamination
  const usersQuery = useUsers(
    !isStaff && effectiveType === 'staff' ? params : undefined
  )
  const ownersQuery = useOwners(
    effectiveType === 'owner' ? { ...params, type: undefined } : undefined
  )
  const vendorsQuery = useVendors(
    !isStaff && effectiveType === 'vendor' ? { ...params, type: undefined } : undefined
  )

  // Merge data from the active source(s) only
  const mergedData = useMemo(() => {
    const allUsers: User[] = []
    const seenUuids = new Set<string>()
    const seenIds = new Set<number>()

    // Add users from staff endpoint (only when type is 'staff' for admin/super-admin)
    if (effectiveType === 'staff' && usersQuery.data?.data) {
      usersQuery.data.data.forEach(user => {
        if (user.uuid && !seenUuids.has(user.uuid)) {
          seenUuids.add(user.uuid)
          if (user.id) seenIds.add(user.id)
          allUsers.push(user)
        } else if (user.id && !seenIds.has(user.id)) {
          seenIds.add(user.id)
          allUsers.push(user)
        }
      })
    }

    // Add owners (only when type is 'owner')
    if (effectiveType === 'owner' && ownersQuery.data?.data) {
      ownersQuery.data.data.forEach(user => {
        if (user.uuid && !seenUuids.has(user.uuid)) {
          seenUuids.add(user.uuid)
          if (user.id) seenIds.add(user.id)
          allUsers.push(user)
        } else if (user.id && !seenIds.has(user.id)) {
          seenIds.add(user.id)
          allUsers.push(user)
        }
      })
    }

    // Add vendors (only when type is 'vendor' for admin/super-admin)
    if (effectiveType === 'vendor' && vendorsQuery.data?.data) {
      vendorsQuery.data.data.forEach(user => {
        if (user.uuid && !seenUuids.has(user.uuid)) {
          seenUuids.add(user.uuid)
          if (user.id) seenIds.add(user.id)
          allUsers.push(user)
        } else if (user.id && !seenIds.has(user.id)) {
          seenIds.add(user.id)
          allUsers.push(user)
        }
      })
    }

    // Create unified response structure
    // Use the meta from the active query only
    const activeQuery = 
      effectiveType === 'staff' ? usersQuery :
      effectiveType === 'owner' ? ownersQuery :
      vendorsQuery

    const totalUsers = activeQuery.data?.meta?.total || allUsers.length

    return {
      data: allUsers,
      meta: {
        total: totalUsers,
        perPage: params?.perPage || 15,
        currentPage: params?.page || 1,
      }
    } as UserListResponse
  }, [usersQuery.data, ownersQuery.data, vendorsQuery.data, params, effectiveType])

  // Combined loading state (only from active query)
  const activeQuery = 
    effectiveType === 'staff' ? usersQuery :
    effectiveType === 'owner' ? ownersQuery :
    vendorsQuery

  const isLoading = activeQuery.isLoading
  const isFetching = activeQuery.isFetching
  const error = activeQuery.error

  return {
    data: mergedData,
    isLoading,
    isFetching,
    error,
    // Expose individual query states for advanced use cases
    usersQuery,
    ownersQuery,
    vendorsQuery,
  }
}

