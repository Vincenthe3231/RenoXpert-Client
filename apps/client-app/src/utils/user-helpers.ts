// Map user_type to a label for display
export const getUserTypeLabel = (userType?: string) => {
  switch (userType) {
    case 'super_admin':
      return 'Super Admin';
    case 'admin':
      return 'Admin';
    case 'staff':
      return 'Staff';
    default:
      return 'User';
  }
};

// Map user_type to a badge color for display
export const getUserTypeBadge = (userType?: string) => {
  switch (userType) {
    case 'super_admin':
      return 'lightinfo';
    case 'admin':
      return 'lightsuccess';
    case 'staff':
      return 'lightprimary';
    default:
      return 'lightsecondary';
  }
};

// Map user_status to a label for display
export const getUserStatusLabel = (userStatus?: string) => {
  switch (userStatus) {
    case 'active':
      return 'Active';
    case 'verifying':
      return 'Verifying';
    case 'rejected':
      return 'Rejected';
    default:
      return 'Not Set';
  }
};

// Map user_status to a badge color for display
export const getUserStatusBadge = (userStatus?: string) => {
  switch (userStatus) {
    case 'active':
      return 'lightsuccess';
    case 'verifying':
      return 'lightwarning';
    case 'rejected':
      return 'lighterror';
    default:
      return 'lightsecondary';
  }
};

/**
 * Check if the current user can edit a target user based on RBAC rules
 * 
 * Rules:
 * - super_admin: can edit everyone
 * - admin: cannot edit super_admin and admin
 * - staff: cannot edit super_admin, admin, and staff
 * - Owners can always be edited by all staff types
 * 
 * @param currentUserStaffType - The staff type of the current logged-in user
 * @param targetUserType - The user type of the target user ('staff' or 'owner')
 * @param targetUserStaffType - The staff type of the target user (only if targetUserType is 'staff')
 * @returns boolean - true if the current user can edit the target user
 */
export const canEditUser = (
  currentUserStaffType?: string,
  targetUserType?: string,
  targetUserStaffType?: string
): boolean => {
  // If current user is not a staff member, they cannot edit
  if (!currentUserStaffType) {
    return false;
  }

  // Owners can always be edited by all staff types
  if (targetUserType === 'owner') {
    return true;
  }

  // If target is a staff member, check staff type restrictions
  if (targetUserType === 'staff' && targetUserStaffType) {
    // super_admin can edit everyone
    if (currentUserStaffType === 'super_admin') {
      return true;
    }

    // admin cannot edit super_admin and admin
    if (currentUserStaffType === 'admin') {
      return targetUserStaffType !== 'super_admin' && targetUserStaffType !== 'admin';
    }

    // staff cannot edit super_admin, admin, and staff
    if (currentUserStaffType === 'staff') {
      return false; // staff cannot edit any staff members
    }
  }

  return false;
};