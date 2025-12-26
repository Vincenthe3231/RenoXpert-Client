import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import { login, getMe, logout, getUsers } from './auth'
import type {
    StaffUser,
    LoginInput,
    GetUsersParams,
    UserListResponse,
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
            queryClient.setQueryData(AUTH_QUERY_KEY, user)
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