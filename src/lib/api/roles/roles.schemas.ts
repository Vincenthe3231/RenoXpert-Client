import { z } from 'zod'

// Permission schema
export const permissionSchema = z.object({
    id: z.number(),
    name: z.string(),
    guardName: z.string().optional(),
    createdAt: z.string().datetime().optional(),
    updatedAt: z.string().datetime().optional(),
})

// Role schema
export const roleSchema = z.object({
    id: z.number(),
    name: z.string(),
    guardName: z.string().optional(),
    permissions: z.array(permissionSchema),
    createdAt: z.string().datetime().optional(),
    updatedAt: z.string().datetime().optional(),
})

// Get all roles response
export const rolesListResponseSchema = z.object({
    message: z.string().optional(),
    data: z.array(roleSchema),
})

// Get single role response
export const roleResponseSchema = z.object({
    message: z.string().optional(),
    data: z.object({
        role: roleSchema,
    }),
})

// Get all permissions response
export const permissionsListResponseSchema = z.object({
    message: z.string().optional(),
    data: z.array(permissionSchema),
})

// Update role permissions request
export const updateRolePermissionsSchema = z.object({
    permissions: z.array(z.string()),
})

// Update role permissions response
export const updateRolePermissionsResponseSchema = z.object({
    message: z.string().optional(),
    data: z.object({
        role: roleSchema,
    }),
})

// Error response schemas
export const validationErrorSchema = z.object({
    error: z.literal('VALIDATION_ERROR'),
    message: z.string(),
    status: z.literal(422),
    fields: z.record(z.array(z.string())),
})

export const roleNotFoundErrorSchema = z.object({
    error: z.literal('ROLE_NOT_FOUND'),
    message: z.string(),
    status: z.literal(404),
})

export const roleProtectedErrorSchema = z.object({
    error: z.literal('ROLE_PROTECTED'),
    message: z.string(),
    status: z.literal(403),
})

// Types
export type Permission = z.infer<typeof permissionSchema>
export type Role = z.infer<typeof roleSchema>
export type RolesListResponse = z.infer<typeof rolesListResponseSchema>
export type RoleResponse = z.infer<typeof roleResponseSchema>
export type PermissionsListResponse = z.infer<typeof permissionsListResponseSchema>
export type UpdateRolePermissionsInput = z.infer<typeof updateRolePermissionsSchema>
export type UpdateRolePermissionsResponse = z.infer<typeof updateRolePermissionsResponseSchema>

