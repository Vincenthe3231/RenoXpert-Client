import {
  CheckCircle2,
  XCircle,
  Clock,
  UserX,
  UserCheck,
  UserCog,
  UserPen,
  Loader2,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

export type AuditType = "Onboarding" | "User Management" | "Department Management"

export interface ActionDisplay {
  icon: LucideIcon
  label: string
  className: string
}

/**
 * Get the type label for an audit entry
 */
export function getAuditTypeLabel(
  logName?: string,
  entryType?: string,
  properties?: any
): AuditType {
  if (entryType === "onboarding" || logName === "onboarding" || properties?.module === "onboarding") {
    return "Onboarding"
  }
  if (logName === "department") {
    return "Department Management"
  }
  return "User Management"
}

/**
 * Get action display configuration for an audit entry
 * Handles all event types including onboarding statuses, user management events, and department events
 * 
 * Color Scheme (Semantic Meaning):
 * - Green: Success/Positive Actions (Approved, Activated)
 * - Red: Error/Negative Actions (Rejected)
 * - Yellow: Pending/Warning Actions (Pending, Verifying)
 * - Blue: Information/Update Actions (Role Changed, Updated)
 * - Purple: Profile Actions (Profile Updated)
 * - Pink: Deactivation Actions (Deactivated)
 * - Gray: Neutral/Default Actions (Created, Deleted, Unknown)
 */
export function getAuditActionDisplay(
  event: string,
  logName?: string,
  log?: any
): ActionDisplay {
  // Special case: 'pending' event that represents an approval
  // Backend sends event: 'pending' when status changes from pending → approved
  if (
    event === "pending" &&
    logName === "onboarding" &&
    log?.properties?.old?.status === "pending" &&
    log?.properties?.attributes?.status === "approved"
  ) {
    return {
      icon: CheckCircle2,
      label: "Pending", // Shows previous status before approval
      // Yellow: Pending/Warning Actions
      className:
        "gap-1 bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800",
    }
  }

  // Handle department management events
  if (logName === "department") {
    switch (event) {
      case "created":
        return {
          icon: CheckCircle2,
          label: "Created",
          // Gray: Neutral/Default Actions
          className:
            "gap-1 bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800",
        }
      case "updated":
        return {
          icon: UserPen,
          label: "Updated",
          // Blue: Information/Update Actions
          className:
            "gap-1 bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800",
        }
      case "deleted":
        return {
          icon: UserX,
          label: "Deleted",
          // Gray: Neutral/Default Actions
          className:
            "gap-1 bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800",
        }
      default:
        const capitalizedLabel =
          event && typeof event === "string"
            ? event.charAt(0).toUpperCase() + event.slice(1).toLowerCase()
            : "Unknown"
        return {
          icon: Clock,
          label: capitalizedLabel,
          // Gray: Neutral/Default Actions
          className:
            "gap-1 bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800",
        }
    }
  }

  // Handle user management and onboarding events
  switch (event) {
    case "deactivated":
      return {
        icon: UserX,
        label: "Deactivated",
        // Pink: Deactivation Actions
        className:
          "gap-1 bg-pink-50 text-pink-500/90 border-pink-500/30 hover:bg-pink-500/20 dark:bg-pink-900/20 dark:text-pink-400 dark:border-pink-800",
      }
    case "activated":
      return {
        icon: UserCheck,
        label: "Activated",
        // Green: Success/Positive Actions
        className:
          "gap-1 bg-green-50 text-green-700 border-green-200 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800",
      }
    case "role_changed":
      return {
        icon: UserCog,
        label: "Role Changed",
        // Blue: Information/Update Actions
        className:
          "gap-1 bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800",
      }
    case "profile_updated":
      return {
        icon: UserPen,
        label: "Profile Updated",
        // Purple: Profile Actions
        className:
          "gap-1 bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800",
      }
    case "verifying":
      return {
        icon: Loader2,
        label: "Verifying",
        // Yellow: Pending/Warning Actions
        className:
          "gap-1 bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800",
      }
    case "pending":
      // Regular pending status (not an approval)
      return {
        icon: Clock,
        label: "Pending",
        // Yellow: Pending/Warning Actions
        className:
          "gap-1 bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800",
      }
    case "approved":
      return {
        icon: CheckCircle2,
        label: "Approved",
        // Green: Success/Positive Actions
        className:
          "gap-1 bg-green-50 text-green-700 border-green-200 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800",
      }
    case "rejected":
      return {
        icon: XCircle,
        label: "Rejected",
        // Red: Error/Negative Actions
        className:
          "gap-1 bg-red-50 text-red-700 border-red-200 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800",
      }
    case "updated":
      return {
        icon: UserPen,
        label: "Updated",
        // Blue: Information/Update Actions
        className:
          "gap-1 bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800",
      }
    default:
      return {
        icon: Clock,
        label:
          event && typeof event === "string"
            ? event.charAt(0).toUpperCase() + event.slice(1).toLowerCase()
            : "Unknown",
        // Gray: Neutral/Default Actions
        className:
          "gap-1 bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800",
      }
  }
}

