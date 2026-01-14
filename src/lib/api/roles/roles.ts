import axios from 'axios'
import {
    rolesListResponseSchema,
    roleResponseSchema,
    permissionsListResponseSchema,
    updateRolePermissionsSchema,
    updateRolePermissionsResponseSchema,
    RolesListResponse,
    RoleResponse,
    PermissionsListResponse,
    UpdateRolePermissionsInput,
    UpdateRolePermissionsResponse,
} from './roles.schemas'
import { API_ROUTES } from '../constants'

export async function getRoles(): Promise<RolesListResponse> {
    const { data } = await axios.get(API_ROUTES.ROLES.LIST)
    const result = rolesListResponseSchema.safeParse(data)
    if (!result.success) {
        console.error('Roles list response validation failed:', result.error.issues)
        console.error('Received data:', JSON.stringify(data, null, 2))
        throw new Error(`Invalid roles list response: ${result.error.message}`)
    }
    return result.data
}

export async function getRole(id: number): Promise<RoleResponse> {
    const { data } = await axios.get(API_ROUTES.ROLES.GET(id))
    const result = roleResponseSchema.safeParse(data)
    if (!result.success) {
        console.error('Role response validation failed:', result.error.issues)
        console.error('Received data:', JSON.stringify(data, null, 2))
        throw new Error(`Invalid role response: ${result.error.message}`)
    }
    return result.data
}

export async function getPermissions(): Promise<PermissionsListResponse> {
    const { data } = await axios.get(API_ROUTES.ROLES.PERMISSIONS)
    const result = permissionsListResponseSchema.safeParse(data)
    if (!result.success) {
        console.error('Permissions list response validation failed:', result.error.issues)
        console.error('Received data:', JSON.stringify(data, null, 2))
        throw new Error(`Invalid permissions list response: ${result.error.message}`)
    }
    return result.data
}

export async function updateRolePermissions(
    id: number,
    payload: UpdateRolePermissionsInput
): Promise<UpdateRolePermissionsResponse> {
    updateRolePermissionsSchema.parse(payload)
    const { data } = await axios.put(API_ROUTES.ROLES.UPDATE_PERMISSIONS(id), payload)
    const result = updateRolePermissionsResponseSchema.safeParse(data)
    if (!result.success) {
        console.error('Update role permissions response validation failed:', result.error.issues)
        console.error('Received data:', JSON.stringify(data, null, 2))
        throw new Error(`Invalid update role permissions response: ${result.error.message}`)
    }
    return result.data
}

