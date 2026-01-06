import { z } from "zod";
import { staffUserSchema, userSchema } from "../auth/auth.schemas";
import { staffProfileSchema } from "../auth/auth.schemas";
import { staffRoleSchema } from "../auth/auth.schemas";

export const onboardingUserTypeSchema = z.enum(["staff", "owner", "vendor"]).nullable();
export const onboardingStatusSchema = z.enum(["pending", "approved", "rejected"]).nullable();

export const onboardingSchema = z.object({
    id: z.number().optional(),
    userId: z.number().nullable(),
    reviewedBy: z.number().nullable(),
    reviewedAt: z.string().nullable(),
    status: onboardingStatusSchema,
    assignedUserType: staffRoleSchema.nullable(),
    rejectionReason: z.string().nullable(),
    user: userSchema.nullable(),
    createdAt: z.string().datetime().nullable(),
});

export const onboardingListSchema = z.object({
    data: z.array(onboardingSchema),
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

export const getOnboardingParamsSchema = z.object({
    search: z.string().optional(),
    page: z.number().optional(),
    perPage: z.number().optional(),
});

export const approveOnboardingSchema = z.object({
    staffType: staffRoleSchema,
});

export const rejectOnboardingSchema = z.object({
    rejectionReason: z.string().min(5, "Reason must be at least 5 characters").max(500),
});

export type Onboarding = z.infer<typeof onboardingSchema>;
export type OnboardingListResponse = z.infer<typeof onboardingListSchema>;
export type GetOnboardingParams = z.infer<typeof getOnboardingParamsSchema>;
export type ApproveOnboardingInput = z.infer<typeof approveOnboardingSchema>;
export type RejectOnboardingInput = z.infer<typeof rejectOnboardingSchema>;