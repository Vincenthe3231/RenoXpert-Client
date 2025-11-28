import z from "zod";
import { USER_STATUS_VALUES } from "../constants/statuses/user.statuses";
import { EditStaffInput } from "./staff.schemas";
import { EditOwnerInput } from "./owner.schemas";

// Base user edit schema (common fields for both staff and owner)
export const baseUserEditSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email address"),
    countryCode: z.string().nullable().optional(),
    phoneNo: z.string().nullable().optional(),
    status: z.enum(USER_STATUS_VALUES, {
        errorMap: () => ({ message: "Invalid status" }),
    }),
});

export const userSchema = z.object({
    id: z.number().optional(),
    uuid: z.string(),
    userType: z.enum(['staff', 'owner']),
    name: z.string(),
    email: z.string().email(),
    emailVerifiedAt: z.string().nullable(),
    countryCode: z.string().nullable(),
    phoneNo: z.string().nullable(),
    lastLoginAt: z.string().nullable(),
    status: z.enum(USER_STATUS_VALUES),
    createdAt: z.string().nullable(),
    updatedAt: z.string().nullable(),
});

export type User = z.infer<typeof userSchema>;
export type EditUserInput = EditStaffInput | EditOwnerInput;