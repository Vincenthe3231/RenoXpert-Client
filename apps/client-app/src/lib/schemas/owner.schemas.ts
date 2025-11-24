import z from "zod";
import { userSchema } from "./user.schemas";

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