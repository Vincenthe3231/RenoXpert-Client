import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
    getRoles,
    getRole,
    getPermissions,
    updateRolePermissions,
} from './roles'
import type {
    RolesListResponse,
    RoleResponse,
    PermissionsListResponse,
    UpdateRolePermissionsInput,
    UpdateRolePermissionsResponse,
} from './roles.schemas'

export const ROLES_QUERY_KEYS = {
    ALL: ['roles'] as const,
    LIST: () => [...ROLES_QUERY_KEYS.ALL, 'list'] as const,
    DETAIL: (id: number) => [...ROLES_QUERY_KEYS.ALL, 'detail', id] as const,
    PERMISSIONS: () => [...ROLES_QUERY_KEYS.ALL, 'permissions'] as const,
} as const

export function useRoles() {
    return useQuery<RolesListResponse, Error>({
        queryKey: ROLES_QUERY_KEYS.LIST(),
        queryFn: getRoles,
        staleTime: 5 * 60 * 1000, // 5 minutes - roles don't change often
    })
}

export function useRole(id: number) {
    return useQuery<RoleResponse, Error>({
        queryKey: ROLES_QUERY_KEYS.DETAIL(id),
        queryFn: () => getRole(id),
        enabled: !!id,
        staleTime: 5 * 60 * 1000,
    })
}

export function usePermissions() {
    return useQuery<PermissionsListResponse, Error>({
        queryKey: ROLES_QUERY_KEYS.PERMISSIONS(),
        queryFn: getPermissions,
        staleTime: 5 * 60 * 1000, // 5 minutes - permissions don't change often
    })
}

export function useUpdateRolePermissions() {
    const queryClient = useQueryClient()

    return useMutation<UpdateRolePermissionsResponse, Error, { id: number; payload: UpdateRolePermissionsInput }>({
        mutationFn: ({ id, payload }) => updateRolePermissions(id, payload),
        onSuccess: (data, variables) => {
            // Invalidate and refetch related queries
            queryClient.invalidateQueries({ queryKey: ROLES_QUERY_KEYS.LIST() })
            queryClient.invalidateQueries({ queryKey: ROLES_QUERY_KEYS.DETAIL(variables.id) })
        },
    })
}

