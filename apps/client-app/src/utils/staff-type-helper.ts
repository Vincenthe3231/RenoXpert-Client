export type StaffType = 'super_admin' | 'admin' | 'staff';

/**
 * Staff type hierarchy: super_admin > admin > staff
 * Higher staff types have access to lower staff type permissions
 */
const typeHierarchy: Record<StaffType, number> = {
    super_admin: 3,
    admin: 2,
    staff: 1,
};

export const getStaffTypeHierarchy = (type: StaffType) => {
    return typeHierarchy[type];
};

/**
 * Check if user has a specific staff type (with hierarchy)
 */
export const hasStaffType = (userStaffType: StaffType | undefined, requiredStaffType: StaffType): boolean => {
    if (!userStaffType) return false;
    return typeHierarchy[userStaffType] >= typeHierarchy[requiredStaffType];
};

/**
 * Check if user has any of the specified staff types
 */
export const hasAnyStaffType = (userStaffType: StaffType | undefined, requiredStaffTypes: StaffType[]): boolean => {
    if (!userStaffType) return false;
    return requiredStaffTypes.some(type => hasStaffType(userStaffType, type));
};

/**
 * Check if user has all of the specified staff types
 */
export const hasAllStaffTypes = (userStaffType: StaffType | undefined, requiredStaffTypes: StaffType[]): boolean => {
    if (!userStaffType) return false;
    return requiredStaffTypes.every(type => hasStaffType(userStaffType, type));
};

/**
 * Check if user is exactly a specific staff type (no hierarchy)
 */
export const isExactStaffType = (userStaffType: StaffType | undefined, requiredStaffType: StaffType): boolean => {
    return userStaffType === requiredStaffType;
};

/**
 * Get staff type level (higher number = more permissions)
 */
export const getStaffTypeLevel = (userStaffType: StaffType | undefined): number => {
    if (!userStaffType) return 0;
    return typeHierarchy[userStaffType] || 0;
};