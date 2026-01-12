import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import { login, getMe, logout, getUsers, getUser } from './auth'
import type {
    StaffUser,
    LoginInput,
    GetUsersParams,
    UserListResponse,
    User,
} from './auth.schemas'

export const AUTH_QUERY_KEY = ['auth', 'me']
export const USERS_QUERY_KEY = ['users']

export function useAuth() {
    return useQuery<StaffUser | null>({
        queryKey: AUTH_QUERY_KEY,
        queryFn: getMe,
        retry: false,
        staleTime: Infinity,
    })
}

export function useLogin() {
    const queryClient = useQueryClient()

    return useMutation<StaffUser, Error, LoginInput>({
        mutationFn: login,
        onSuccess: (user) => {
            // Set the user data and invalidate to trigger refetch
            queryClient.setQueryData(AUTH_QUERY_KEY, user)
            // Invalidate to ensure fresh data is fetched on next useAuth() call
            queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEY })
        },
    })
}

export function useLogout() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: logout,
        onSuccess: () => {
            queryClient.removeQueries({ queryKey: AUTH_QUERY_KEY })
        },
    })
}

export function useUsers(params?: GetUsersParams) {
    return useQuery<UserListResponse>({
        queryKey: [...USERS_QUERY_KEY, params],
        queryFn: () => getUsers(params),
        placeholderData: keepPreviousData,
        staleTime: 30 * 1000, // 30 seconds
    })
}

export function useUser(uuid: string | null) {
    return useQuery<User | null>({
        queryKey: ['user', uuid],
        queryFn: () => uuid ? getUser(uuid) : null,
        enabled: !!uuid,
        staleTime: 30 * 1000, // 30 seconds
    })
}