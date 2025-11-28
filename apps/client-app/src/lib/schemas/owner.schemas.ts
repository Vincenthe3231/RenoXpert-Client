import z from "zod";
import { baseUserEditSchema, userSchema } from "./user.schemas";

// Owner edit schema
export const editOwnerSchema = baseUserEditSchema.extend({
    userType: z.literal('owner'),
    profile: z.object({
        salutation: z.string().nullable().optional(),
        ic: z.string().nullable().optional(),
        address1: z.string().nullable().optional(),
        address2: z.string().nullable().optional(),
        city: z.string().nullable().optional(),
        state: z.string().nullable().optional(),
        postcode: z.string().nullable().optional(),
        country: z.string().nullable().optional(),
    }),
});

export const ownerSchema = userSchema.extend({
    profile: z.object({
        id: z.number().nullable(),
        salutation: z.string().nullable(),
        ic: z.string().nullable(),
        address1: z.string().nullable(),
        address2: z.string().nullable(),
        city: z.string().nullable(),
        state: z.string().nullable(),
        postcode: z.string().nullable(),
        country: z.string().nullable(),
    }),
});

export type Owner = z.infer<typeof ownerSchema>;
export type EditOwnerInput = z.infer<typeof editOwnerSchema>;