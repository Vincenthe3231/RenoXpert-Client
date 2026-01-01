import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { GetOnboardingParams, OnboardingListResponse } from "./onboarding.schemas";
import { getOnboardings, onboardingApproval } from ".";

export const ONBOARDINGS_QUERY_KEY = ['onboardings']

export function useOnboardings(params?: GetOnboardingParams) {
    return useQuery<OnboardingListResponse>({
        queryKey: [...ONBOARDINGS_QUERY_KEY, params],
        queryFn: () => getOnboardings(params),
        placeholderData: keepPreviousData,
        staleTime: 30 * 1000, // 30 seconds
    })
}

export function useApproveOnboarding() {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: ({ onboardingId, staffType }: { onboardingId: number; staffType: string }) =>
            onboardingApproval(onboardingId, staffType),
        onSuccess: () => qc.invalidateQueries({ queryKey: ONBOARDINGS_QUERY_KEY }),
    });
}