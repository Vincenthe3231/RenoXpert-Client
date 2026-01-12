import type { StaffUser } from "@/lib/api/auth/auth.schemas";

/**
 * Minimal authorization helpers based on backend middleware logic
 * Uses profile.type (staff.type from backend) as the source of truth
 * 
 * Backend middleware:
 * - CheckSuperAdmin: checks staff.type === 'super_admin'
 * - CheckUserModuleAccess: checks staff.type === 'super_admin' OR 'admin'
 */

export function isSuperAdmin(user: StaffUser | null): boolean {
  if (!user || user.userType !== "staff") return false;
  return user.profile?.type === "super_admin";
}

export function isAdmin(user: StaffUser | null): boolean {
  if (!user || user.userType !== "staff") return false;
  return user.profile?.type === "admin";
}

export function canAccessUserModule(user: StaffUser | null): boolean {
  if (!user || user.userType !== "staff") return false;
  const staffType = user.profile?.type;
  return staffType === "super_admin" || staffType === "admin";
}

export function hasActiveAccount(user: StaffUser | null): boolean {
  if (!user) return false;
  return user.status === "active";
}

