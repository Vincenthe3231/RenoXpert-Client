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

const baseUserSchema = {
    uuid: z.string().uuid(),
    name: z.string(),
    email: z.string().email(),
    countryCode: z.string().nullable(),
    phoneNo: z.string().nullable(),
    emailVerifiedAt: z.string().datetime().nullable(),
    lastLoginAt: z.string().datetime().nullable(),
    status: userStatusSchema,
};


// Profile schemas (only extra fields)
export const staffProfileSchema = z.object({
    larksuiteOpenId: z.string().nullable(),
    larksuiteUnionId: z.string().nullable(),
    avatarUrl: z.string().url().nullable(),
    avatarBig: z.string().url().nullable(),
    type: z.string().nullable(),
    status: z.string(),
    roles: z.array(z.string()),
});

export const staffUserSchema = z.object({
    ...baseUserSchema,
    userType: z.literal('staff'),
    profile: staffProfileSchema,
});


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

// Backend response structure: { message: string, data: { user: UserResource, accessStatus: string, rejectionReason: string | null } }
export const LoginResponseSchema = z.object({
    message: z.string().optional(),
    data: z.object({
        user: staffUserSchema,
        accessStatus: z.string().optional(),
        rejectionReason: z.string().nullable().optional(),
    }),
})

// Backend /me returns: { message: string, data: { user: UserResource, accessStatus: string, rejectionReason: string | null } }
// But frontend route handler returns { user: null } on error
export const MeResponseSchema = z.union([
    // Success case: { message: string, data: { user: {...}, accessStatus: string, rejectionReason: string | null } }
    z.object({
        message: z.string().optional(),
        data: z.object({
            user: staffUserSchema,
            accessStatus: z.string().optional(),
            rejectionReason: z.string().nullable().optional(),
        }),
    }),
    // Error case: { user: null }
    z.object({
        user: z.null(),
    }),
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