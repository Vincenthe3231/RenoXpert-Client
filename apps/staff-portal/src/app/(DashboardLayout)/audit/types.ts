import { Onboarding } from "@/lib/api/onboarding";
import { ActivityLog } from "@/lib/api/activity-logs";

/**
 * Unified audit entry type that can represent either:
 * - An onboarding decision (approved/rejected)
 * - A user management activity log (deactivated, activated, role_changed, profile_updated)
 */
export type AuditEntry = 
  | { type: 'onboarding'; data: Onboarding }
  | { type: 'activity_log'; data: ActivityLog };

/**
 * Get the timestamp for an audit entry (for sorting)
 */
export function getAuditEntryTimestamp(entry: AuditEntry): number {
  if (entry.type === 'onboarding') {
    return entry.data.reviewedAt 
      ? new Date(entry.data.reviewedAt).getTime() 
      : entry.data.createdAt 
        ? new Date(entry.data.createdAt).getTime() 
        : 0;
  } else {
    return new Date(entry.data.createdAt).getTime();
  }
}

