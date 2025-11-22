// Onboarding status
export const ONBOARDING_STATUS_VALUES = [
    'pending',
    'approved',
    'rejected',
] as const;

export type OnboardingStatusValue = typeof ONBOARDING_STATUS_VALUES[number];

export const ONBOARDING_STATUSES = {
    PENDING: { value: ONBOARDING_STATUS_VALUES[0], label: 'Pending' },
    APPROVED: { value: ONBOARDING_STATUS_VALUES[1], label: 'Approved' },
    REJECTED: { value: ONBOARDING_STATUS_VALUES[2], label: 'Rejected' },
} as const;

// Helper to get all status by value
export const getOnboardingStatus = (value: string) => {
    return Object.values(ONBOARDING_STATUSES).find(s => s.value === value);
}