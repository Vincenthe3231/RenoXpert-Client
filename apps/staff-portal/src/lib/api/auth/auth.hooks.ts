import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { login, getMe, logout } from './auth'
import type { Staff, LoginInput } from './auth.schemas'

export const AUTH_QUERY_KEY = ['auth', 'me']

export function useAuth() {
    return useQuery<Staff | null>({
        queryKey: AUTH_QUERY_KEY,
        queryFn: getMe,
        retry: false,
        staleTime: Infinity,
    })
}

export function useLogin() {
    const queryClient = useQueryClient()

    return useMutation<Staff, Error, LoginInput>({
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
