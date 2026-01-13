import { useQuery, useMutation, useQueryClient, keepPreviousData, queryOptions } from '@tanstack/react-query'
import { login, getMe, logout, getUsers, getUser } from './auth'
import type {
    StaffUser,
    LoginInput,
    GetUsersParams,
    UserListResponse,
    User,
} from './auth.schemas'
import { AUTH_QUERY_KEYS, AUTH_CONFIG, USER_QUERY_CONFIG } from './constants'

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
            // Set the user data and invalidate to trigger refetch
            queryClient.setQueryData(AUTH_QUERY_KEYS.ME, user)
            // Invalidate to ensure fresh data is fetched on next useAuth() call
            queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.ME })
        },
    })
}

export function useLogout() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: logout,
        onSuccess: () => {
            queryClient.removeQueries({ queryKey: AUTH_QUERY_KEYS.ME })
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
        placeholderData: keepPreviousData,
        staleTime: USER_QUERY_CONFIG.STALE_TIME,
    })
}

export function useUsers(params?: GetUsersParams) {
    return useQuery(usersQueryOptions(params))
}

/**
 * Query options factory for single user
 */
export function userQueryOptions(uuid: string | null) {
    return queryOptions({
        queryKey: AUTH_QUERY_KEYS.USER(uuid!),
        queryFn: () => uuid ? getUser(uuid) : null,
        enabled: !!uuid,
        staleTime: USER_QUERY_CONFIG.STALE_TIME,
    })
}

export function useUser(uuid: string | null) {
    return useQuery(userQueryOptions(uuid))
}