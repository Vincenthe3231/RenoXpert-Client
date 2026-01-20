import { z } from 'zod'

// User Types
export type UserType = "staff" | "owner";
export type StaffType = "super-admin" | "admin" | "staff";
export type OwnerType = "owner";
export type UserStatus = "active" | "deactivated" | "verifying" | "rejected";

// Zod Schemas
export const userTypeSchema = z.enum(["staff", "owner"]);
export const staffRoleSchema = z.enum(["super-admin", "admin", "staff"]);
export const ownerRoleSchema = z.enum(["owner"]);
export const userStatusSchema = z.enum(["active", "deactivated", "verifying", "rejected"]);

// Custom datetime schema that accepts both ISO 8601 and space-separated formats
// Backend may return: "2026-01-16T11:42:26.000000Z" (ISO 8601) or "2026-01-16 11:42:26" (space-separated)
const datetimeSchema = z.union([
  z.string().datetime(), // ISO 8601 format: "2026-01-16T11:42:26.000000Z"
  z.string().regex(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/), // Space-separated: "2026-01-16 11:42:26"
]).nullable()

const baseUserSchema = {
    id: z.number().optional(), // Integer ID for endpoints that require it (deactivate, activate, etc.)
    uuid: z.string().uuid(),
    name: z.string(),
    email: z.string().email(),
    countryCode: z.string().nullable().optional(),
    phoneNo: z.string().nullable().optional(),
    emailVerifiedAt: z.string().datetime().nullable().optional(),
    lastLoginAt: datetimeSchema, // Use the more lenient schema to accept both formats
    status: userStatusSchema,
};


// Profile schemas (only extra fields)
// Based on StaffResource: larksuiteOpenId, larksuiteUnionId, avatarUrl, avatarBig, status, roles, permissions
// Made more lenient to handle variations in backend responses for staff users
export const staffProfileSchema = z.object({
    larksuiteOpenId: z.string().nullable().optional(),
    larksuiteUnionId: z.string().nullable().optional(),
    avatarUrl: z.string().nullable().optional(), // Can be any string (URL, empty string) or null
    avatarBig: z.string().nullable().optional(), // Can be any string (URL, empty string) or null
    status: z.string().optional(),
    roles: z.array(z.string()).optional().default([]),
    permissions: z.array(z.string()).optional().default([]), // Always returned (even if empty array)
}).passthrough(); // Allow extra fields that might be present

export const staffUserSchema = z.object({
    ...baseUserSchema,
    userType: z.literal('staff'),
    profile: staffProfileSchema,
}).passthrough(); // Allow extra fields that might be present in backend response


export const ownerProfileSchema = z.object({
    salutation: z.string().nullable(),
    ic: z.string().nullable(),
    address1: z.string().nullable(),
    address2: z.string().nullable(),
    city: z.string().nullable(),
    state: z.string().nullable(),
    postcode: z.string().nullable(),
});

export const ownerUserSchema = z.object({
    ...baseUserSchema,
    userType: z.literal('owner'),
    profile: ownerProfileSchema,
});

export const vendorUserSchema = z.object({
    ...baseUserSchema,
    userType: z.literal('vendor'),
    profile: z.record(z.any(), z.any()),
});

// Full user types with proper inheritance + discriminator
export const userSchema = z.discriminatedUnion('userType', [
    staffUserSchema,
    ownerUserSchema,
    vendorUserSchema,
]);

export const LoginInputSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
})

// Backend response structure: { message: string, data: { user: UserResource, accessStatus: string, rejectionReason: string | null, token: string } }
export const LoginResponseSchema = z.object({
    message: z.string().optional(),
    data: z.object({
        user: staffUserSchema,
        accessStatus: z.string().optional(),
        rejectionReason: z.string().nullable().optional(),
        token: z.string().optional(),
    }).passthrough(), // Allow extra fields
}).passthrough(); // Allow extra fields at root level

// Backend /me returns: { message: string, data: { user: UserResource, accessStatus: string, rejectionReason: string | null, token?: string } }
// But frontend route handler returns { user: null } on error
export const MeResponseSchema = z.union([
    // Success case: { message: string, data: { user: {...}, accessStatus: string, rejectionReason: string | null, token?: string } }
    z.object({
        message: z.string().optional(),
        data: z.object({
            user: staffUserSchema,
            accessStatus: z.string().optional(),
            rejectionReason: z.string().nullable().optional(),
            token: z.string().optional(),
        }).passthrough(), // Allow extra fields
    }).passthrough(), // Allow extra fields at root level
    // Error case: { user: null }
    z.object({
        user: z.null(),
    }).passthrough(), // Allow extra fields
])

export const userListSchema = z.object({
    data: z.array(userSchema),
    links: z.object({
        first: z.string().url().nullable(),
        last: z.string().url().nullable(),
        prev: z.string().url().nullable(),
        next: z.string().url().nullable(),
    }),
    meta: z.object({
        currentPage: z.number(),
        lastPage: z.number().optional(),
        perPage: z.number().optional(),
        total: z.number().optional(),
    }),
});

// More lenient schema for owners endpoint that may return different structure
// This handles cases where the backend returns owner profile data directly
export const ownersListSchema = z.object({
    data: z.array(z.any()), // Accept any structure for now
    links: z.object({
        first: z.string().url().nullable(),
        last: z.string().url().nullable(),
        prev: z.string().url().nullable(),
        next: z.string().url().nullable(),
    }).optional(),
    meta: z.object({
        currentPage: z.number(),
        lastPage: z.number().optional(),
        perPage: z.number().optional(),
        total: z.number().optional(),
        from: z.number().optional(),
        to: z.number().optional(),
        path: z.string().optional(),
        links: z.array(z.any()).optional(),
    }).optional(),
    message: z.string().optional(),
}).passthrough();

export const getUsersParamsSchema = z.object({
    status: userStatusSchema.optional(),
    type: userTypeSchema.optional(),
    role: staffRoleSchema.optional(),
    search: z.string().optional(),
    page: z.number().optional(),
    perPage: z.number().optional(),
});

// Types inferred from schemas
export type LoginInput = z.infer<typeof LoginInputSchema>
export type GetUsersParams = z.infer<typeof getUsersParamsSchema>
export type UserListResponse = z.infer<typeof userListSchema>

// Inferred types
export type User = z.infer<typeof userSchema>;
export type StaffUser = z.infer<typeof staffUserSchema>;
export type OwnerUser = z.infer<typeof ownerUserSchema>;
export type VendorUser = z.infer<typeof vendorUserSchema>;