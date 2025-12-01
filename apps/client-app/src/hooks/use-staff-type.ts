// hooks/use-staff-type.ts
"use client"
import { useUser } from '@/app/context/UserContext';
import { StaffType, hasStaffType, hasAnyStaffType, hasAllStaffTypes, isExactStaffType, getStaffTypeLevel } from '@/utils/staff-type-helper';

export const useStaffType = () => {
    const { user } = useUser();

    const staffType = user?.staffType as StaffType | undefined;

    return {
        staffType,
        hasStaffType: (requiredStaffType: StaffType) => hasStaffType(staffType, requiredStaffType),
        hasAnyStaffType: (requiredStaffTypes: StaffType[]) => hasAnyStaffType(staffType, requiredStaffTypes),
        hasAllStaffTypes: (requiredStaffTypes: StaffType[]) => hasAllStaffTypes(staffType, requiredStaffTypes),
        isExactStaffType: (requiredStaffType: StaffType) => isExactStaffType(staffType, requiredStaffType),
        getStaffTypeLevel: () => getStaffTypeLevel(staffType),
        isSuperAdmin: staffType === 'super_admin',
        isAdmin: staffType === 'admin' || staffType === 'super_admin',
        isStaff: staffType === 'staff' || staffType === 'admin' || staffType === 'super_admin',
    };
};