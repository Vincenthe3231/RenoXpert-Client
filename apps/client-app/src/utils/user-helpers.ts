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