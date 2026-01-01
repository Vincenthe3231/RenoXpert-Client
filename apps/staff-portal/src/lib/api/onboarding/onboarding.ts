import axios from "axios"
import { GetOnboardingParams, Onboarding, OnboardingListResponse, approveOnboardingSchema, onboardingListSchema, onboardingSchema } from "."

export async function getOnboardings(params?: GetOnboardingParams): Promise<OnboardingListResponse> {
    const { data } = await axios.get('/api/onboarding', { params })
    const result = onboardingListSchema.safeParse(data)
    if (!result.success) {
        console.error('Onboarding data validation failed:', result.error.issues)
        console.error('Received data:', JSON.stringify(data, null, 2))
        throw new Error(`Invalid onboarding data: ${result.error.message}`)
    }
    return result.data
}

// Approval
export async function onboardingApproval(onboardingId: number, staffType: string) {
    const { data } = await axios.post(`/api/onboarding/${onboardingId}/approval`, { staffType });
    return onboardingSchema.parse(data);
  }

// Rejection
export async function onboardingRejection(onboardingId: number, reason: string): Promise<Onboarding> {
    const { data } = await axios.post(`/api/onboarding/${onboardingId}/rejection`, { reason });
    return onboardingSchema.parse(data);
}