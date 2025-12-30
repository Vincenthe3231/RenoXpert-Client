import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { GetOnboardingParams, OnboardingListResponse } from "./onboarding.schemas";
import { getOnboardings } from ".";

export const ONBOARDINGS_QUERY_KEY = ['onboardings']

export function useOnboardings(params?: GetOnboardingParams) {
    return useQuery<OnboardingListResponse>({
        queryKey: [...ONBOARDINGS_QUERY_KEY, params],
        queryFn: () => getOnboardings(params),
        placeholderData: keepPreviousData,
        staleTime: 30 * 1000, // 30 seconds
    })
}