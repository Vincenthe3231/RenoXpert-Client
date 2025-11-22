import z from "zod";
import { staffSchema } from "./staff.schemas";
import { USER_STATUS_VALUES } from "../constants/statuses/user.statuses";
import { ONBOARDING_STATUS_VALUES } from "../constants/statuses/onboarding.statuses";

export const onboardingSchema = z.object({
    id: z.number().optional(),
    userId: z.number().nullable(),
    reviewedBy: z.number().nullable(),
    reviewedAt: z.string().nullable(),
    status: z.enum(ONBOARDING_STATUS_VALUES),
    assignedUserType: z.enum(USER_STATUS_VALUES),
    rejectionReason: z.string().nullable(),
    staff: staffSchema.nullable(),
});

export type Onboarding = z.infer<typeof onboardingSchema>;