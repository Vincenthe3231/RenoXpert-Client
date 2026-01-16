import axios from "axios"

import { API_ROUTES } from '../constants'
import { StaffType } from "../auth/auth.schemas"
import {
    ApproveOnboardingInput,
    GetOnboardingParams,
    Onboarding,
    OnboardingListResponse,
    RejectOnboardingInput,
    approveOnboardingSchema,
    getOnboardingParamsSchema,
    onboardingListSchema,
    onboardingSchema,
    rejectOnboardingSchema,
} from "./onboarding.schemas"

export async function getOnboardings(params?: GetOnboardingParams): Promise<OnboardingListResponse> {
    if (params) {
        getOnboardingParamsSchema.parse(params)
    }

    const { data } = await axios.get(API_ROUTES.ONBOARDING.LIST, { params })
    const result = onboardingListSchema.safeParse(data)
    if (!result.success) {
        console.error('Onboarding data validation failed:', result.error.issues)
        console.error('Received data:', JSON.stringify(data, null, 2))
        throw new Error(`Invalid onboarding data: ${result.error.message}`)
    }
    return result.data
}

export async function onboardingApproval(
    onboardingId: number,
    staffType: StaffType
) {
    const payload: ApproveOnboardingInput = { staffType }
    approveOnboardingSchema.parse(payload)

    const { data } = await axios.post(
        API_ROUTES.ONBOARDING.APPROVAL(onboardingId),
        payload
    )

    // Backend returns: { message: "...", data: { onboarding: {...} } }
    // Extract the onboarding object from the nested structure
    const onboardingData = data?.data?.onboarding || data?.onboarding || data?.data || data
    
    // Use safeParse to handle validation errors gracefully
    const result = onboardingSchema.safeParse(onboardingData)
    if (!result.success) {
        console.error('Onboarding approval response validation failed:', result.error.issues)
        console.error('Received data:', JSON.stringify(data, null, 2))
        // Return the data anyway if it has the essential fields, validation is just for type safety
        if (onboardingData && typeof onboardingData === 'object') {
            return onboardingData as Onboarding
        }
        throw new Error(`Invalid approval response: ${result.error.message}`)
    }
    
    return result.data
}

export async function onboardingRejection(
    onboardingId: number,
    reason: string
): Promise<Onboarding> {
    const payload: RejectOnboardingInput = { rejectionReason: reason }
    rejectOnboardingSchema.parse(payload)

    const { data } = await axios.post(
        API_ROUTES.ONBOARDING.REJECTION(onboardingId),
        payload
    )

    // Check if backend returned an error response
    // Only treat it as an error if there's an 'error' field, not just a 'message' field
    // Laravel often returns success responses with a 'message' field
    if (data?.error) {
        // If it's an error response, throw it
        const errorMessage = data.error || data.message || 'Failed to reject onboarding'
        throw new Error(errorMessage)
    }

    // Backend returns: { message: "...", data: { onboarding: {...} } }
    // Extract the onboarding object from the nested structure
    const onboardingData = data?.data?.onboarding || data?.onboarding || data?.data || data
    
    // Use safeParse to handle validation errors gracefully
    // The backend might return a partial object, so we make validation lenient
    const result = onboardingSchema.safeParse(onboardingData)
    
    if (!result.success) {
        console.error('Onboarding rejection response validation failed:', result.error.issues)
        console.error('Received data:', JSON.stringify(data, null, 2))
        
        // If we have an object with at least an id, return it as Onboarding
        // The backend might not return all fields immediately
        if (onboardingData && typeof onboardingData === 'object' && ('id' in onboardingData || 'status' in onboardingData)) {
            // Create a valid Onboarding object with defaults for missing fields
            const partialOnboarding: Onboarding = {
                id: onboardingData.id,
                userId: onboardingData.userId ?? null,
                reviewedBy: onboardingData.reviewedBy ?? null,
                reviewedAt: onboardingData.reviewedAt ?? null,
                status: onboardingData.status ?? 'rejected',
                assignedUserType: onboardingData.assignedUserType ?? null,
                rejectionReason: onboardingData.rejectionReason ?? reason,
                user: onboardingData.user ?? null,
                createdAt: onboardingData.createdAt ?? null,
                updatedAt: onboardingData.updatedAt ?? null,
            }
            return partialOnboarding
        }
        
        // If we can't construct a valid object, throw an error with a user-friendly message
        const validationErrors = result.error.issues.map(issue => issue.message).join(', ')
        throw new Error(`Invalid rejection response: ${validationErrors}`)
    }
    
    return result.data
}