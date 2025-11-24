export const USER_STATUS_VALUES = [
    'active',
    'inactive',
    'verifying',
    'rejected',
] as const;

export type UserStatusValue = typeof USER_STATUS_VALUES[number];

export const USER_STATUSES = {
    ACTIVE: { value: USER_STATUS_VALUES[0], label: 'Active' },
    INACTIVE: { value: USER_STATUS_VALUES[1], label: 'Inactive' },
    VERIFYING: { value: USER_STATUS_VALUES[2], label: 'Verifying' },
    REJECTED: { value: USER_STATUS_VALUES[3], label: 'Rejected' },
} as const;

// Helper to get all status by value
export const getUserStatus = (value: string) => {
    return Object.values(USER_STATUSES).find(s => s.value === value);
}