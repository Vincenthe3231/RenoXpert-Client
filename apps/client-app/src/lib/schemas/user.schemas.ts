// schemas/user.schema.ts
import { z } from "zod";
import { USER_STATUS_VALUES } from "../constants/statuses/user.statuses";

// Base user (shared by all types)
const BaseUserSchema = z.object({
    id: z.number(),
    uuid: z.string().uuid(),
    userType: z.enum(["staff", "owner", "vendor"]),
    name: z.string(),
    email: z.string().email(),
    countryCode: z.string().nullable().optional(),
    phoneNo: z.string().nullable().optional(),
    emailVerifiedAt: z.string().datetime().nullable().optional(),
    lastLoginAt: z.string().datetime().nullable().optional(),
    status: z.enum(USER_STATUS_VALUES),
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
export const StaffSchema = BaseUserSchema.extend({
    userType: z.literal("staff"), // override with literal
}).and(StaffProfileSchema);

export const OwnerSchema = BaseUserSchema.extend({
    userType: z.literal("owner"),
}).and(OwnerProfileSchema);

export const VendorSchema = BaseUserSchema.extend({
    userType: z.literal("vendor"),
}).and(VendorProfileSchema);


// Edit schemas
// For staff, only allow editing of staff type
export const editStaffSchema = z.object({
    staffType: z.enum(["super_admin", "admin", "staff"]),
    userType: z.literal("staff"),
});

// For owner, only allow editing of name, email, phone number, country code, salutation, ic, address1, address2, city, state, postcode
export const editOwnerSchema = z.object({
    name: z.string(),
    email: z.string().email(),
    phoneNo: z.string(),
    countryCode: z.string(),
    salutation: z.string(),
    ic: z.string(),
    address1: z.string(),
    address2: z.string(),
    city: z.string(),
    state: z.string(),
    postcode: z.string(),
    userType: z.literal("owner"),
});

// Create owner schema - required fields for creating a new owner
export const createOwnerSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.union([
        z.string().email("Invalid email address"),
        z.literal("")
    ]).optional(),
    phoneNo: z.string().min(1, "Phone number is required"),
    countryCode: z.string().min(1, "Country code is required"),
    salutation: z.string().optional(),
    ic: z.string().optional(),
    address1: z.string().optional(),
    address2: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    postcode: z.string().optional(),
    userType: z.literal("owner"),
});

// Inferred types
export type Staff = z.infer<typeof StaffSchema>;
export type Owner = z.infer<typeof OwnerSchema>;
export type Vendor = z.infer<typeof VendorSchema>;

export type EditStaffInput = z.infer<typeof editStaffSchema>;
export type EditOwnerInput = z.infer<typeof editOwnerSchema>;
export type CreateOwnerInput = z.infer<typeof createOwnerSchema>;