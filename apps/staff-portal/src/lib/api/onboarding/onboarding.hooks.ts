import { keepPreviousData, useMutation, useQuery, useQueryClient, queryOptions } from "@tanstack/react-query";

import { StaffType } from "../auth/auth.schemas";
import { ONBOARDING_QUERY_KEYS, ONBOARDING_QUERY_CONFIG } from "./constants";
import { getOnboardings, onboardingApproval, onboardingRejection } from ".";
import { GetOnboardingParams, OnboardingListResponse } from "./onboarding.schemas";

// Re-export for backward compatibility
export const ONBOARDINGS_QUERY_KEY = ONBOARDING_QUERY_KEYS.LIST

/**
 * Query options factory for onboardings list
 */
export function onboardingsQueryOptions(params?: GetOnboardingParams) {
    return queryOptions({
        queryKey: [...ONBOARDING_QUERY_KEYS.LIST, params],
        queryFn: () => getOnboardings(params),
        placeholderData: keepPreviousData,
        staleTime: ONBOARDING_QUERY_CONFIG.STALE_TIME,
    })
}

export function useOnboardings(params?: GetOnboardingParams) {
    return useQuery(onboardingsQueryOptions(params))
}

export function useApproveOnboarding() {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: ({ onboardingId, staffType, department }: { onboardingId: number; staffType: StaffType; department?: string }) =>
            onboardingApproval(onboardingId, staffType, department),
        onSuccess: () => qc.invalidateQueries({ queryKey: ONBOARDING_QUERY_KEYS.LIST }),
    });
}

export function useRejectOnboarding() {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: ({ onboardingId, reason }: { onboardingId: number; reason: string }) =>
            onboardingRejection(onboardingId, reason),
        onSuccess: () => qc.invalidateQueries({ queryKey: ONBOARDING_QUERY_KEYS.LIST }),
    });
}