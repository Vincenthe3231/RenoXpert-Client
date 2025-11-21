// User status
export const USER_STATUSES = {
    ACTIVE: {
        value: 'active',
        label: 'Active',
    },
    INACTIVE: {
        value: 'inactive',
        label: 'Inactive',
    },
    VERIFYING: {
        value: 'verifying',
        label: 'Verifying',
    },
    REJECTED: {
        value: 'rejected',
        label: 'Rejected',
    },
} as const;

export type UserStatusValue = typeof USER_STATUSES[keyof typeof USER_STATUSES]['value'];

// Helper to get all status values
export const USER_STATUS_VALUES = Object.values(USER_STATUSES).map(status => status.value);

// Helper to get all status by value
export const getUserStatus = (value: string) => {
    return Object.values(USER_STATUSES).find(s => s.value === value);
}