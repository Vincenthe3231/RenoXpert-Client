import { useQuery, useMutation, useQueryClient, keepPreviousData, queryOptions } from '@tanstack/react-query'
import { login, getMe, logout, getUsers, getUser, deactivateUser, activateUser, getOwners, getOwner, updateOwner, deleteOwner } from './auth'
import type {
    StaffUser,
    LoginInput,
    GetUsersParams,
    UserListResponse,
    User,
} from './auth.schemas'
import { AUTH_QUERY_KEYS, AUTH_CONFIG, USER_QUERY_CONFIG } from './constants'
import { ONBOARDING_QUERY_KEYS } from '../onboarding/constants'

// Re-export for backward compatibility
export const AUTH_QUERY_KEY = AUTH_QUERY_KEYS.ME
export const USERS_QUERY_KEY = AUTH_QUERY_KEYS.USERS

/**
 * Query options for auth/me endpoint
 */
export const authQueryOptions = queryOptions({
    queryKey: AUTH_QUERY_KEYS.ME,
    queryFn: getMe,
    retry: AUTH_CONFIG.RETRY,
    staleTime: AUTH_CONFIG.STALE_TIME,
})

export function useAuth() {
    return useQuery(authQueryOptions)
}

export function useLogin() {
    const queryClient = useQueryClient()

    return useMutation<StaffUser, Error, LoginInput>({
        mutationFn: login,
        onSuccess: (user) => {
            // Clear all queries first to ensure no stale data
            queryClient.clear()
            // Set the user data
            queryClient.setQueryData(AUTH_QUERY_KEYS.ME, user)
            // Invalidate to ensure fresh data is fetched on next useAuth() call
            queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.ME })
            // Invalidate onboarding queries to ensure Super Admins see any new pending requests
            // This is especially important when a rejected user logs in again and status is refreshed to "pending"
            queryClient.invalidateQueries({ queryKey: ONBOARDING_QUERY_KEYS.LIST })
        },
    })
}

export function useLogout() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: logout,
        onSuccess: () => {
            // Clear all queries to ensure no cached data remains
            queryClient.clear()
        },
    })
}

/**
 * Query options factory for users list
 */
export function usersQueryOptions(params?: GetUsersParams) {
    return queryOptions({
        queryKey: [...AUTH_QUERY_KEYS.USERS, params],
        queryFn: () => getUsers(params),
        enabled: params !== undefined,
        placeholderData: keepPreviousData,
        staleTime: USER_QUERY_CONFIG.STALE_TIME,
    })
}

export function useUsers(params?: GetUsersParams) {
    return useQuery(usersQueryOptions(params))
}

/**
 * Query options factory for owners list (for staff users)
 */
export function ownersQueryOptions(params?: GetUsersParams) {
    return queryOptions({
        queryKey: ['owners', params],
        queryFn: () => getOwners(params),
        enabled: params !== undefined,
        placeholderData: keepPreviousData,
        staleTime: USER_QUERY_CONFIG.STALE_TIME,
    })
}

/**
 * Hook to fetch owners list
 * Used by staff users who don't have permission to access /users endpoint
 */
export function useOwners(params?: GetUsersParams) {
    return useQuery(ownersQueryOptions(params))
}

/**
 * Query options factory for single owner (for staff users)
 */
export function ownerQueryOptions(id: string | null) {
    return queryOptions({
        queryKey: ['owner', id],
        queryFn: () => id ? getOwner(id) : null,
        enabled: !!id,
        staleTime: USER_QUERY_CONFIG.STALE_TIME,
    })
}

/**
 * Hook to fetch single owner by ID
 * Used by staff users who don't have permission to access /api/auth/users/{id}
 */
export function useOwner(id: string | null) {
    return useQuery(ownerQueryOptions(id))
}

/**
 * Query options factory for single user
 */
export function userQueryOptions(id: string | null) {
    return queryOptions({
        queryKey: AUTH_QUERY_KEYS.USER(id!),
        queryFn: () => id ? getUser(id) : null,
        enabled: !!id,
        staleTime: USER_QUERY_CONFIG.STALE_TIME,
    })
}

export function useUser(id: string | null) {
    return useQuery(userQueryOptions(id))
}

export function useDeactivateUser() {
    const queryClient = useQueryClient()

    return useMutation<User, Error, string>({
        mutationFn: deactivateUser,
        onSuccess: (updatedUser, userId) => {
            // Invalidate users list to refresh the table
            queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.USERS })
            // Invalidate owners list as well (for staff users)
            queryClient.invalidateQueries({ queryKey: ['owners'] })
            // Update the specific user in cache if it exists
            queryClient.setQueryData(AUTH_QUERY_KEYS.USER(updatedUser.uuid), updatedUser)
            // Update owner cache as well
            queryClient.setQueryData(['owner', updatedUser.uuid], updatedUser)
            // Invalidate auth/me in case the deactivated user is the current user
            queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.ME })
        },
    })
}

export function useActivateUser() {
    const queryClient = useQueryClient()

    return useMutation<User, Error, string>({
        mutationFn: activateUser,
        onSuccess: (updatedUser, userId) => {
            // Invalidate users list to refresh the table
            queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.USERS })
            // Invalidate owners list as well (for staff users)
            queryClient.invalidateQueries({ queryKey: ['owners'] })
            // Update the specific user in cache if it exists
            queryClient.setQueryData(AUTH_QUERY_KEYS.USER(updatedUser.uuid), updatedUser)
            // Update owner cache as well
            queryClient.setQueryData(['owner', updatedUser.uuid], updatedUser)
            // Invalidate auth/me in case the activated user is the current user
            queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.ME })
        },
    })
}

/**
 * Hook to update owner
 * Uses PUT /api/owners/{id} endpoint
 */
export function useUpdateOwner() {
    const queryClient = useQueryClient()

    return useMutation<
        User,
        Error,
        { id: string; data: Parameters<typeof updateOwner>[1] }
    >({
        mutationFn: ({ id, data }) => updateOwner(id, data),
        onSuccess: (updatedOwner) => {
            // Invalidate owners list to refresh the table
            queryClient.invalidateQueries({ queryKey: ['owners'] })
            // Update the specific owner in cache
            queryClient.setQueryData(['owner', updatedOwner.uuid], updatedOwner)
            // Also invalidate users list in case owner appears there
            queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.USERS })
            // Update user cache if it exists
            queryClient.setQueryData(AUTH_QUERY_KEYS.USER(updatedOwner.uuid), updatedOwner)
        },
    })
}

/**
 * Hook to delete owner
 * Uses DELETE /api/owners/{id} endpoint
 */
export function useDeleteOwner() {
    const queryClient = useQueryClient()

    return useMutation<void, Error, string>({
        mutationFn: deleteOwner,
        onSuccess: (_, deletedId) => {
            // Invalidate owners list to refresh the table
            queryClient.invalidateQueries({ queryKey: ['owners'] })
            // Remove the specific owner from cache
            queryClient.removeQueries({ queryKey: ['owner', deletedId] })
            // Also invalidate users list
            queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.USERS })
            // Remove from user cache if it exists
            queryClient.removeQueries({ queryKey: AUTH_QUERY_KEYS.USER(deletedId) })
        },
    })
}