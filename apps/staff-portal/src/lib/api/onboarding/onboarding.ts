import axios from "axios"
import { GetOnboardingParams, OnboardingListResponse, onboardingListSchema } from "."

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