import { z } from 'zod'

// User Types
export type UserType = "staff" | "owner";
export type StaffRole = "super-admin" | "admin" | "staff";
export type OwnerRole = "owner";
export type UserRole = StaffRole | OwnerRole;
export type UserStatus = "active" | "deactivated" | "verifying" | "rejected";

// Zod Schemas
export const userTypeSchema = z.enum(["staff", "owner"]);
export const staffRoleSchema = z.enum(["super-admin", "admin", "staff"]);
export const ownerRoleSchema = z.enum(["owner"]);
export const userStatusSchema = z.enum(["active", "deactivated", "verifying", "rejected"]);

export const userSchema = z.object({
    id: z.number(),
    uuid: z.string().uuid(),
    userType: userTypeSchema,
    name: z.string().min(1).max(100),
    email: z.string().email(),
    countryCode: z.string().nullable().optional(),
    phoneNo: z.string().nullable().optional(),
    emailVerifiedAt: z.string().datetime().nullable().optional(),
    lastLoginAt: z.string().datetime().nullable().optional(),
    status: userStatusSchema,
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
    deletedAt: z.string().datetime().nullable().optional(),
});


// Profile schemas (only extra fields)
const StaffProfileSchema = z.object({
    larksuiteOpenId: z.string().nullable().optional(),
    larksuiteUnionId: z.string().nullable().optional(),
    avatarUrl: z.string().url().nullable().optional(),
    avatarBig: z.string().url().nullable().optional(),
    staffType: z.enum(["super_admin", "admin", "staff"]),
    roles: z.array(z.string()).default([]),
});

const OwnerProfileSchema = z.object({
    salutation: z.string().nullable().optional(),
    ic: z.string().nullable().optional(),
    address1: z.string().nullable().optional(),
    address2: z.string().nullable().optional(),
    city: z.string().nullable().optional(),
    state: z.string().nullable().optional(),
    postcode: z.string().nullable().optional(),
});

const VendorProfileSchema = z.object({
    // Add vendor fields later
});

// Full user types with proper inheritance + discriminator
export const StaffSchema = userSchema.extend({
    userType: z.literal("staff"), // override with literal
}).and(StaffProfileSchema);

export const OwnerSchema = userSchema.extend({
    userType: z.literal("owner"),
}).and(OwnerProfileSchema);

export const VendorSchema = userSchema.extend({
    userType: z.literal("vendor"),
}).and(VendorProfileSchema);


export const LoginInputSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
})

export const LoginResponseSchema = z.object({
    user: StaffSchema,
})

export const MeResponseSchema = z.object({
    user: StaffSchema.nullable(),
})

// Types inferred from schemas
export type User = z.infer<typeof userSchema>
export type LoginInput = z.infer<typeof LoginInputSchema>

// Inferred types
export type Staff = z.infer<typeof StaffSchema>;
export type Owner = z.infer<typeof OwnerSchema>;
export type Vendor = z.infer<typeof VendorSchema>;

// Helper functions
export const isStaffUser = (user: User): boolean => user.userType === "staff";
export const isOwnerUser = (user: User): boolean => user.userType === "owner";