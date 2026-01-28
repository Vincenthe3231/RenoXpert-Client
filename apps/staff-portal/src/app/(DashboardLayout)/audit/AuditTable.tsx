import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { CheckCircle, XCircle, History, Loader2, UserX, UserCheck, UserCog, UserPen, ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react"
import { format } from "date-fns"
import { AuditEntry, getAuditEntryTimestamp } from "./types"
import { User } from "@/lib/api/auth"
import AuditEmptyState from "./components/AuditEmptyState"
import RoleBadge from "@/app/(DashboardLayout)/users/components/RoleBadge"
import UserStatusBadge from "@/app/(DashboardLayout)/users/components/UserStatusBadge"
import { motion, AnimatePresence } from "framer-motion"

interface AuditTableProps {
  auditEntries: AuditEntry[]
  isLoading: boolean
  getReviewerName: (reviewedBy: number | null | undefined) => string
  getCauserName: (causer: { id?: number; uuid?: string; name?: string } | null | undefined) => string
  getInitials: (name: string) => string
  users: User[]
  activityLogs: any[] // Activity logs to find historical user data for onboarding entries
  userMapById?: Map<number | null | undefined, User> // O(1) lookup map by user ID for performance
  userMapByUuid?: Map<string | null | undefined, User> // O(1) lookup map by user UUID for performance
}

type SortDirection = "asc" | "desc" | null
type SortColumn = "user" | "type" | "action" | "role" | "performedBy" | "date" | "details"

interface SortConfig {
  column: SortColumn | null
  direction: SortDirection
}

interface SortableHeaderProps {
  label: string
  column: SortColumn
  sortConfig: SortConfig
  onSort: (column: SortColumn) => void
}

const SortableHeader = ({ label, column, sortConfig, onSort }: SortableHeaderProps) => {
  const isActive = sortConfig.column === column
  const direction = isActive ? sortConfig.direction : null

  return (
    <motion.button
      onClick={() => onSort(column)}
      className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/80 hover:text-foreground transition-all duration-300 cursor-pointer group"
      whileTap={{ scale: 0.97 }}
    >
      <span>{label}</span>
      <motion.span
        className="flex items-center justify-center w-5 h-5 rounded-md bg-muted/50 group-hover:bg-muted transition-colors"
        initial={false}
        animate={{ 
          opacity: isActive ? 1 : 0.5,
          scale: isActive ? 1 : 0.9
        }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      >
        <AnimatePresence mode="wait">
          {direction === "asc" ? (
            <motion.span
              key="asc"
              initial={{ opacity: 0, rotate: -90 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: 90 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            >
              <ArrowUp className="h-3 w-3 text-primary" />
            </motion.span>
          ) : direction === "desc" ? (
            <motion.span
              key="desc"
              initial={{ opacity: 0, rotate: 90 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: -90 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            >
              <ArrowDown className="h-3 w-3 text-primary" />
            </motion.span>
          ) : (
            <motion.span
              key="none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="group-hover:opacity-80"
            >
              <ArrowUpDown className="h-3 w-3" />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.span>
    </motion.button>
  )
}

const AuditTable = ({ auditEntries, isLoading, getReviewerName, getCauserName, getInitials, users, activityLogs, userMapById, userMapByUuid }: AuditTableProps) => {
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    column: null,
    direction: null,
  })

  const handleSort = (column: SortColumn) => {
    setSortConfig((prev) => {
      if (prev.column !== column) {
        return { column, direction: "asc" }
      }
      if (prev.direction === "asc") {
        return { column, direction: "desc" }
      }
      return { column: null, direction: null }
    })
  }
  // Helper to get user avatar URL
  // Optimized to use O(1) map lookups instead of O(n) .find() operations for better performance
  const getUserAvatarUrl = (user: { profile?: any; id?: any; uuid?: string } | null | undefined) => {
    // First check if user has profile with avatarUrl
    if (user?.profile && 'avatarUrl' in user.profile) {
      const avatarUrl = user.profile.avatarUrl || undefined
      return avatarUrl
    }
    // Fallback: if user has ID, try to find avatar from users list using O(1) map lookup
    if (user?.id || user?.uuid) {
      const subjectId = user.id
      const subjectUuid = user.uuid
      
      // Use map lookups for O(1) performance if maps are available
      let foundUser: User | undefined
      if (userMapById && subjectId != null) {
        foundUser = userMapById.get(subjectId)
      }
      if (!foundUser && userMapByUuid && subjectUuid) {
        foundUser = userMapByUuid.get(subjectUuid)
      }
      
      // Fallback to .find() if maps are not available (backward compatibility)
      if (!foundUser && (!userMapById || !userMapByUuid)) {
        foundUser = users.find((u) => {
          if (subjectId != null && u.id != null && Number(u.id) === Number(subjectId)) return true
          if (subjectUuid && u.uuid && String(u.uuid) === String(subjectUuid)) return true
          if (subjectId != null && u.id != null && String(u.id) === String(subjectId)) return true
          return false
        })
      }
      
      if (foundUser?.profile && 'avatarUrl' in foundUser.profile) {
        const avatarUrl = foundUser.profile.avatarUrl || undefined
        return avatarUrl
      }
    }
    return undefined
  }

  // Helper to format details from log properties
  // Shows what changed in a concise format: "Field: old → new"
  const formatLogDetails = (log: any): string => {
    const props = log.properties
    if (!props) {
      return "—"
    }

    const changes: string[] = []
    const oldValues = props.old || {}
    const newValues = props.attributes || {}
    
    // Get all unique keys from both old and new values
    const allKeys = new Set([...Object.keys(oldValues), ...Object.keys(newValues)])
    
    for (const key of allKeys) {
      const oldVal = oldValues[key]
      const newVal = newValues[key]
      
      // Skip if values are the same
      if (oldVal === newVal) continue
      
      // Format the change
      const formatValue = (val: any): string => {
        if (val === null || val === undefined) return "—"
        if (typeof val === 'boolean') return val ? 'Yes' : 'No'
        if (typeof val === 'object') return JSON.stringify(val)
        return String(val)
      }
      
      const oldFormatted = formatValue(oldVal)
      const newFormatted = formatValue(newVal)
      
      // Human-readable field names
      const fieldName = key
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, str => str.toUpperCase())
        .trim()
      
      if (oldVal === null || oldVal === undefined) {
        changes.push(`${fieldName}: ${newFormatted}`)
      } else if (newVal === null || newVal === undefined) {
        changes.push(`${fieldName}: ${oldFormatted} → —`)
      } else {
        changes.push(`${fieldName}: ${oldFormatted} → ${newFormatted}`)
      }
    }
    
    if (changes.length === 0) {
      return "—"
    }
    
    return changes.join(", ")
  }

  // Component to render truncated details with tooltip
  const TruncatedDetails = ({ details, maxLength = 50 }: { details: string; maxLength?: number }) => {
    if (details === "—") {
      return <span className="text-sm text-muted-foreground/70">—</span>
    }

    const shouldTruncate = details.length > maxLength
    const displayText = shouldTruncate ? details.slice(0, maxLength) + "..." : details

    if (!shouldTruncate) {
      return <span className="text-sm text-muted-foreground/70">{details}</span>
    }

    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="cursor-help text-sm text-muted-foreground/70 block truncate max-w-[200px]">
            {displayText}
          </span>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs bg-popover/95 backdrop-blur-sm">
          <p className="text-sm whitespace-pre-wrap">{details}</p>
        </TooltipContent>
      </Tooltip>
    )
  }

  // Helper to get event icon and badge - using same styling as UserStatusBadge
  const getEventDisplay = (event: string) => {
    switch (event) {
      case 'deactivated':
        return {
          icon: UserX,
          label: 'Deactivated',
          variant: 'outline' as const,
          className: 'gap-1 bg-pink-50 text-pink-500/90 border-pink-500/30 hover:bg-pink-500/20',
        }
      case 'activated':
        return {
          icon: UserCheck,
          label: 'Activated',
          variant: 'outline' as const,
          className: 'gap-1 bg-green-50 text-green-700 border-green-200 hover:bg-green-100',
        }
      case 'role_changed':
        return {
          icon: UserCog,
          label: 'Role Changed',
          variant: 'outline' as const,
          className: 'gap-1 bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100',
        }
      case 'profile_updated':
        return {
          icon: UserPen,
          label: 'Profile Updated',
          variant: 'outline' as const,
          className: 'gap-1 bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100',
        }
      default:
        return {
          icon: History,
          label: event,
          variant: 'outline' as const,
          className: 'gap-1 bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100',
        }
    }
  }

  /**
   * Helper to get user from audit entry
   * 
   * AUDIT TRAIL INTEGRITY: This function prioritizes historical data from activity logs
   * to preserve audit trail integrity. Activity logs are immutable and append-only.
   * 
   * Priority order:
   * 1. log.subject (historical user data at time of event)
   * 2. log.properties.attributes (new values after change) or log.properties.old (old values before change)
   * 3. log.description (for activated/deactivated/role_changed events)
   * 4. Current users list (ONLY as last resort for email/avatar, NEVER for name to preserve integrity)
   * 
   * For role_changed events: We NEVER use current name from users list - only historical data.
   * This ensures that historical names are preserved even if user's name changes later.
   */
  const getUserFromEntry = (entry: AuditEntry) => {
    if (entry.type === 'onboarding') {
      // CRITICAL AUDIT TRAIL INTEGRITY ISSUE:
      // entry.data.user might contain CURRENT user data (after profile updates) instead of HISTORICAL data
      // We need to preserve the historical name that was used at the time of onboarding
      const onboardingUser = entry.data.user
      const onboardingId = entry.data.id
      const userId = entry.data.userId
      const reviewedAt = entry.data.reviewedAt
      
      // PRIORITY 1: Find the onboarding activity log itself (most reliable source of historical data)
      // The onboarding activity log has logName: "onboarding" and contains the historical name in its description
      // Example: "Staff onboarding approved for Law Wen Sen with role: staff"
      // This is IMMUTABLE data created at the time of onboarding approval
      let historicalUserData = null
      if (onboardingId && reviewedAt && activityLogs && activityLogs.length > 0) {
        const reviewedAtTime = new Date(reviewedAt).getTime()
        
        // First, look for the onboarding activity log itself
        // It has logName: "onboarding", event: "approved" or "rejected", and subjectId matches onboardingId
        const onboardingActivityLog = activityLogs.find((log: any) => {
          if (log.logName !== 'onboarding') return false
          if (log.event !== 'approved' && log.event !== 'rejected') return false
          // Match by onboarding ID (subjectId in onboarding log is the onboarding ID, not user ID)
          if (log.subjectId && log.subjectId === onboardingId) return true
          // Also check by timestamp (within 1 minute of reviewedAt)
          const logTime = new Date(log.createdAt).getTime()
          const timeDiff = Math.abs(reviewedAtTime - logTime)
          return timeDiff < 60000 // Within 1 minute
        })
        
        // Extract historical name from onboarding activity log description
        // Format: "Staff onboarding approved for {name} with role: {role}"
        // or: "Staff onboarding rejected for {name}"
        if (onboardingActivityLog && onboardingActivityLog.description) {
          const descriptionMatch = onboardingActivityLog.description.match(
            /Staff onboarding (?:approved|rejected) for (.+?)(?:\s+with role:|$)/i
          )
          if (descriptionMatch && descriptionMatch[1]) {
            const extractedName = descriptionMatch[1].trim()
            if (extractedName && extractedName !== 'for') {
              historicalUserData = {
                name: extractedName,
                email: onboardingUser?.email || null,
                id: userId || null,
                uuid: onboardingUser?.uuid || null,
                status: onboardingUser?.status || null,
                userType: onboardingUser?.userType || null,
                profile: onboardingUser?.profile || undefined,
              }
              // Return immediately - this is the most reliable historical data
              if (historicalUserData.name) {
                return historicalUserData
              }
            }
          }
        }
        
        // PRIORITY 2: Look for activity logs with the same subjectId (userId) created before onboarding
        // This helps find historical data from user-related logs before the name change
        const relatedLogs = activityLogs.filter((log: any) => {
          if (!log.subjectId || log.subjectId !== userId) return false
          // Skip the onboarding log itself (already checked above)
          if (log.logName === 'onboarding') return false
          const logTime = new Date(log.createdAt).getTime()
          const timeDiff = reviewedAtTime - logTime // Positive if log is before reviewedAt
          // Include logs created up to 1 hour before onboarding review, or 1 minute after
          return (timeDiff >= 0 && timeDiff < 3600000) || (timeDiff < 0 && Math.abs(timeDiff) < 60000)
        })
        
        // Sort by creation time (newest first, but prioritize logs before reviewedAt)
        relatedLogs.sort((a: any, b: any) => {
          const aTime = new Date(a.createdAt).getTime()
          const bTime = new Date(b.createdAt).getTime()
          const aBefore = aTime <= reviewedAtTime
          const bBefore = bTime <= reviewedAtTime
          // Prioritize logs created before reviewedAt
          if (aBefore && !bBefore) return -1
          if (!aBefore && bBefore) return 1
          // If both before or both after, sort by time (newest first)
          return bTime - aTime
        })
        
        // Extract historical user data from the most relevant activity log
        // For onboarding entries, prioritize OLD values (properties.old) over NEW values (properties.attributes)
        // because we want the name that existed BEFORE any changes, which is what was used at onboarding time
        // Priority: log.subject > log.properties.old > log.description (extract name) > log.properties.attributes
        for (const log of relatedLogs) {
          // Check log.subject first (most reliable historical data)
          if (log.subject && typeof log.subject === 'object' && log.subject !== null && (log.subject as any).name) {
            historicalUserData = {
              name: (log.subject as any).name,
              email: (log.subject as any).email || onboardingUser?.email || null,
              id: log.subjectId || userId || null,
              uuid: (log.subject as any).uuid || onboardingUser?.uuid || null,
              status: (log.subject as any).status || onboardingUser?.status || null,
              userType: (log.subject as any).userType || onboardingUser?.userType || null,
              profile: (log.subject as any).profile || onboardingUser?.profile || undefined,
            }
            break
          }
          
          // Check log.properties.old FIRST (old values before change) - this is the historical name
          // For onboarding, we want the name that existed BEFORE any profile updates
          if (log.properties?.old && typeof log.properties.old === 'object' && log.properties.old.name) {
            historicalUserData = {
              name: log.properties.old.name,
              email: log.properties.old.email || onboardingUser?.email || null,
              id: log.subjectId || userId || null,
              uuid: log.properties.old.uuid || onboardingUser?.uuid || null,
              status: log.properties.old.status || onboardingUser?.status || null,
              userType: log.properties.old.userType || onboardingUser?.userType || null,
              profile: log.properties.old.profile || onboardingUser?.profile || undefined,
            }
            break
          }
          
          // Try to extract name from description field (e.g., "Role changed for Law Wen Sen: admin → staff")
          if (log.description) {
            const descriptionMatch = log.description.match(/role\s+changed\s+for\s+([^:]+?)\s*:/i) ||
                                     log.description.match(/(?:activated|deactivated):\s*(.+)$/i)
            if (descriptionMatch && descriptionMatch[1]) {
              const extractedName = descriptionMatch[1].trim()
              if (extractedName && extractedName !== 'for') {
                historicalUserData = {
                  name: extractedName,
                  email: onboardingUser?.email || null,
                  id: log.subjectId || userId || null,
                  uuid: onboardingUser?.uuid || null,
                  status: onboardingUser?.status || null,
                  userType: onboardingUser?.userType || null,
                  profile: onboardingUser?.profile || undefined,
                }
                break
              }
            }
          }
          
          // Last resort: Check log.properties.attributes (new values after change)
          // Only use this if we haven't found historical data yet
          if (!historicalUserData && log.properties?.attributes && typeof log.properties.attributes === 'object' && log.properties.attributes.name) {
            historicalUserData = {
              name: log.properties.attributes.name,
              email: log.properties.attributes.email || onboardingUser?.email || null,
              id: log.subjectId || userId || null,
              uuid: log.properties.attributes.uuid || onboardingUser?.uuid || null,
              status: log.properties.attributes.status || onboardingUser?.status || null,
              userType: log.properties.attributes.userType || onboardingUser?.userType || null,
              profile: log.properties.attributes.profile || onboardingUser?.profile || undefined,
            }
            break
          }
        }
      }
      
      // If we found historical data, use it instead of current user data
      // This preserves audit trail integrity by showing the name that was used at the time of onboarding
      if (historicalUserData && historicalUserData.name) {
        return historicalUserData
      }
      
      // If no historical data found, return the user data from onboarding entry
      // This might be current data, but we have no other option
      return onboardingUser
    } else {
      const log = entry.data
      
      // SPECIAL CASE: For onboarding activity logs, extract historical name from description
      // This ensures immutability - the description contains the name at the time of onboarding
      // Format: "Staff onboarding approved for {name} with role: {role}"
      if (log.logName === 'onboarding' && (log.event === 'approved' || log.event === 'rejected')) {
        if (log.description) {
          const descriptionMatch = log.description.match(
            /Staff onboarding (?:approved|rejected) for (.+?)(?:\s+with role:|$)/i
          )
          if (descriptionMatch && descriptionMatch[1]) {
            const extractedName = descriptionMatch[1].trim()
            if (extractedName && extractedName !== 'for') {
              // Use the historical name from the immutable activity log description
              // This preserves audit trail integrity even if user name changes later
              return {
                name: extractedName,
                email: log.subject?.email || null,
                id: log.subjectId || null,
                uuid: log.subject?.uuid || null,
                status: log.subject?.status || null,
                userType: log.subject?.userType || null,
                profile: log.subject?.profile || undefined,
              } as any
            }
          }
        }
      }
      
      // Priority 1: If subject object exists, use it (historical data at time of event)
      if (log.subject && typeof log.subject === 'object' && log.subject !== null) {
        if ((log.subject as any).name || (log.subject as any).email || (log.subject as any).id) {
          return log.subject as any
        }
      }

      // Priority 2: Check properties FIRST for ALL events to get historical data
      // This prevents showing the current name instead of the historical name
      // All activity logs (activated, deactivated, profile_updated, role_changed) have historical data in properties
      const isProfileUpdate = log.event === 'profile_updated' || log.event === 'updated'
      
      // Check properties for ALL events (not just profile updates) to extract historical user data
      if (log.properties && typeof log.properties === 'object') {
        const props: any = log.properties

        const tryBuildUser = (source: any) => {
          if (!source || typeof source !== 'object') return null
          if (source.name || source.email) {
            return {
              name: source.name || 'Unknown User',
              email: source.email || null,
              id: (log as any).subjectId ?? source.id ?? null,
              uuid: source.uuid ?? null,
              status: source.status ?? null,
              userType: source.user_type ?? source.userType ?? null,
            } as any
          }
          if (source.user && typeof source.user === 'object' && (source.user.name || source.user.email)) {
            return source.user
          }
          if (source.profile && typeof source.profile === 'object' && (source.profile.name || source.profile.email)) {
            return {
              name: source.profile.name || 'Unknown User',
              email: source.profile.email || null,
              id: (log as any).subjectId ?? source.profile.user_id ?? source.profile.id ?? source.id ?? null,
              uuid: source.profile.uuid ?? source.uuid ?? null,
              status: source.profile.status ?? source.status ?? null,
              userType: source.profile.user_type ?? source.user_type ?? source.userType ?? null,
            } as any
          }
          return null
        }

        // For profile updates: show the name AFTER the change (attributes)
        // This shows what the name BECAME after this change, not what it was before
        // Each log entry shows the value that was set by that specific change
        let fromAttributes: any = null
        
        // Direct check: props.attributes might have name directly
        if (props.attributes && typeof props.attributes === 'object') {
          if (props.attributes.name) {
            // We have a name in attributes - use it (this is the new value after change)
            // Include profile if available
            const profile = props.attributes.profile || null
            fromAttributes = {
              name: props.attributes.name || 'Unknown User',
              email: props.attributes.email || null,
              id: (log as any).subjectId ?? props.attributes.id ?? null,
              uuid: props.attributes.uuid ?? null,
              status: props.attributes.status ?? null,
              userType: props.attributes.user_type ?? props.attributes.userType ?? null,
              profile: profile ? { avatarUrl: profile.avatarUrl || null } : undefined,
            }
          } else {
            // Try the tryBuildUser helper for nested structures
            fromAttributes = tryBuildUser(props.attributes)
          }
        }
        
        if (fromAttributes && fromAttributes.name) {
          // We have the new name from attributes - use it
          // If email is missing, try to get email from old or users list
          if (!fromAttributes.email) {
            const fromOld = tryBuildUser(props.old)
            if (fromOld?.email) {
              fromAttributes.email = fromOld.email
            } else if (log.subjectId) {
              // Try to get email from users list lookup
              const subjectId = log.subjectId as any
              const subjectIdStr = String(subjectId)
              const foundUser = users.find((u) => {
                if (u.id != null && Number(u.id) === Number(subjectId)) return true
                if (u.id != null && String(u.id) === subjectIdStr) return true
                if (u.uuid && String(u.uuid) === subjectIdStr) return true
                // eslint-disable-next-line eqeqeq
                if (u.id != null && (u.id as any) == subjectId) return true
                return false
              })
              if (foundUser?.email) {
                fromAttributes.email = foundUser.email
              }
            }
          }
          return fromAttributes as any
        }
        
        // Fallback to old if attributes doesn't have name
        // For events like activated/deactivated, old might have the historical name
        const fromOld = tryBuildUser(props.old)
        if (fromOld && fromOld.name) {
          // If email is missing, try to get it from attributes or users list
          if (!fromOld.email) {
            const fromAttributes = tryBuildUser(props.attributes)
            if (fromAttributes?.email) {
              fromOld.email = fromAttributes.email
            } else if (log.subjectId) {
              const subjectId = log.subjectId as any
              const subjectIdStr = String(subjectId)
              const foundUser = users.find((u) => {
                if (u.id != null && Number(u.id) === Number(subjectId)) return true
                if (u.id != null && String(u.id) === subjectIdStr) return true
                if (u.uuid && String(u.uuid) === subjectIdStr) return true
                // eslint-disable-next-line eqeqeq
                if (u.id != null && (u.id as any) == subjectId) return true
                  return false
                })
              if (foundUser?.email) {
                fromOld.email = foundUser.email
              }
            }
          }
          return fromOld as any
        }

        const fromSubject = tryBuildUser(props.subject)
        if (fromSubject) return fromSubject as any
      }

      // For activated/deactivated events, properties might only have status, not name
      // Try to extract name from description field as fallback
      // Format: "User account activated: {name}" or "User account deactivated: {name}"
      if ((log.event === 'activated' || log.event === 'deactivated') && log.description) {
        // Match everything after "activated:" or "deactivated:" until end of string
        const descriptionMatch = log.description.match(/(?:activated|deactivated):\s*(.+)$/i)
        if (descriptionMatch && descriptionMatch[1]) {
          const extractedName = descriptionMatch[1].trim()
          // Try to get email from users list (only for email, not name)
          let email = null
          if (log.subjectId) {
            const subjectId = log.subjectId as any
            const subjectIdStr = String(subjectId)
            const foundUser = users.find((u) => {
              if (u.id != null && Number(u.id) === Number(subjectId)) return true
              if (u.id != null && String(u.id) === subjectIdStr) return true
              if (u.uuid && String(u.uuid) === subjectIdStr) return true
              // eslint-disable-next-line eqeqeq
              if (u.id != null && (u.id as any) == subjectId) return true
              return false
            })
            email = foundUser?.email || null
          }
          // Try to get profile/avatarUrl from users list if we have subjectId
          let profile = undefined
          if (log.subjectId) {
            const subjectId = log.subjectId as any
            const subjectIdStr = String(subjectId)
            const foundUser = users.find((u) => {
              if (u.id != null && Number(u.id) === Number(subjectId)) return true
              if (u.id != null && String(u.id) === subjectIdStr) return true
              if (u.uuid && String(u.uuid) === subjectIdStr) return true
              // eslint-disable-next-line eqeqeq
              if (u.id != null && (u.id as any) == subjectId) return true
              return false
            })
            if (foundUser?.profile && 'avatarUrl' in foundUser.profile) {
              profile = { avatarUrl: foundUser.profile.avatarUrl || null }
            }
          }
          return {
            name: extractedName,
            email: email,
            id: log.subjectId || null,
            uuid: null,
            status: null,
            userType: null,
            profile: profile,
          } as any
        }
      }

      // Check log.subject for historical user data (if available)
      // This is historical data stored at the time of the event
      if (log.subject && typeof log.subject === 'object') {
        const tryBuildUser = (source: any) => {
          if (!source || typeof source !== 'object') return null
          if (source.name || source.email) {
            // Include profile if available in source
            const profile = source.profile || (source.user?.profile) || null
            return {
              name: source.name || 'Unknown User',
              email: source.email || null,
              id: (log as any).subjectId ?? source.id ?? null,
              uuid: source.uuid ?? null,
              status: source.status ?? null,
              userType: source.user_type ?? source.userType ?? null,
              profile: profile ? { avatarUrl: profile.avatarUrl || null } : undefined,
            } as any
          }
          if (source.user && typeof source.user === 'object' && (source.user.name || source.user.email)) {
            // Include profile if available
            const profile = source.user.profile || null
            return {
              ...source.user,
              profile: profile ? { avatarUrl: profile.avatarUrl || null } : undefined,
            }
          }
          if (source.profile && typeof source.profile === 'object' && (source.profile.name || source.profile.email)) {
            return {
              name: source.profile.name || 'Unknown User',
              email: source.profile.email || null,
              id: (log as any).subjectId ?? source.profile.user_id ?? source.profile.id ?? source.id ?? null,
              uuid: source.profile.uuid ?? source.uuid ?? null,
              status: source.profile.status ?? source.status ?? null,
              userType: source.profile.user_type ?? source.user_type ?? source.userType ?? null,
              profile: { avatarUrl: source.profile.avatarUrl || null },
            } as any
          }
          return null
        }
        const fromSubject = tryBuildUser(log.subject)
        if (fromSubject && fromSubject.name) {
          // If profile/avatarUrl is missing, try to get it from users list
          if (!fromSubject.profile?.avatarUrl && log.subjectId) {
            const subjectId = log.subjectId as any
            const subjectIdStr = String(subjectId)
            const foundUser = users.find((u) => {
              if (u.id != null && Number(u.id) === Number(subjectId)) return true
              if (u.id != null && String(u.id) === subjectIdStr) return true
              if (u.uuid && String(u.uuid) === subjectIdStr) return true
              // eslint-disable-next-line eqeqeq
              if (u.id != null && (u.id as any) == subjectId) return true
              return false
            })
            if (foundUser?.profile && 'avatarUrl' in foundUser.profile) {
              fromSubject.profile = { avatarUrl: foundUser.profile.avatarUrl || null }
            }
          }
          return fromSubject as any
        }
      }

      // Look up by subjectId from users list (returns CURRENT user data)
      // Only use this as a last resort if properties don't have historical data
      // DO NOT use this for activated/deactivated/role_changed events - they should have historical data elsewhere
      // For role_changed, properties only have roles, not name, so we should check log.subject first (above)
      if (log.subjectId && log.event !== 'activated' && log.event !== 'deactivated' && log.event !== 'role_changed') {
        // Try to find by integer ID first
        const userById = users.find(u => u.id === log.subjectId)
        if (userById) {
          return userById
        }
        
        // If not found, try to find by UUID (for owners, subjectId might be a UUID string)
        // Check if subjectId is a string UUID
        const subjectIdStr = String(log.subjectId)
        const userByUuid = users.find(u => {
          // Try matching UUID directly
          if (u.uuid === subjectIdStr) return true
          // Also try matching string representation of ID
          if (String(u.id) === subjectIdStr) return true
          return false
        })
        if (userByUuid) {
          return userByUuid
        }
      }

      // For role_changed events, we must preserve integrity - do NOT use current name
      // Only use historical data from log.subject or description field
      if (log.event === 'role_changed' && log.subjectId) {
        // Priority 1: Check log.subject for historical name
        let historicalName = null
        if (log.subject && typeof log.subject === 'object' && (log.subject as any).name) {
          historicalName = (log.subject as any).name
        }
        
        // Priority 2: Try to extract name from description field (if available)
        // Format: "Role changed for {name}: {old_role} → {new_role}"
        if (!historicalName && log.description) {
          // Match pattern: "Role changed for {name}:" or "role changed for {name}:"
          // Use a more explicit pattern: match "Role changed for " then capture everything until ":"
          // The pattern ensures we capture the full name, not just "for"
          const descriptionMatch = log.description.match(/role\s+changed\s+for\s+([^:]+?)\s*:/i)
          if (descriptionMatch && descriptionMatch[1]) {
            historicalName = descriptionMatch[1].trim()
          }
        }
        
        // Only return user data if we have historical name - preserve integrity
        // Do NOT use current name from users list as it breaks audit trail integrity
        if (historicalName) {
          // Get email and profile from users list (these don't change as often)
          const subjectId = log.subjectId as any
          const subjectIdStr = String(subjectId)
          const foundUser = users.find((u) => {
            if (u.id != null && Number(u.id) === Number(subjectId)) return true
            if (u.id != null && String(u.id) === subjectIdStr) return true
            if (u.uuid && String(u.uuid) === subjectIdStr) return true
            // eslint-disable-next-line eqeqeq
            if (u.id != null && (u.id as any) == subjectId) return true
            return false
          })
          // Include profile/avatarUrl from foundUser if available
          const profile = foundUser?.profile && 'avatarUrl' in foundUser.profile 
            ? { avatarUrl: foundUser.profile.avatarUrl || null }
            : undefined
          return {
            name: historicalName, // Use ONLY historical name - preserve integrity
            email: foundUser?.email || null,
            id: log.subjectId || null,
            uuid: foundUser?.uuid || null,
            status: foundUser?.status || null,
            userType: foundUser?.userType || null,
            profile: profile,
          } as any
        }
        // If no historical name available, return null to preserve integrity
        // This is better than showing current name which would be incorrect
      }

      return null
    }
  }

  // Helper to get action performer
  const getActionPerformer = (entry: AuditEntry) => {
    if (entry.type === 'onboarding') {
      return getReviewerName(entry.data.reviewedBy)
    } else {
      return getCauserName(entry.data.causer)
    }
  }

  // Helper to get timestamp
  const getTimestamp = (entry: AuditEntry) => {
    if (entry.type === 'onboarding') {
      return entry.data.reviewedAt || entry.data.createdAt
    } else {
      return entry.data.createdAt
    }
  }

  // Helper to generate unique key for each entry
  const getEntryKey = (entry: AuditEntry, index: number) => {
    if (entry.type === 'onboarding') {
      const decision = entry.data
      // Use ID, timestamp, user ID, reviewedBy, and status to ensure uniqueness
      const id = decision.id ? String(decision.id) : null
      const timestamp = decision.reviewedAt || decision.createdAt || null
      const userId = decision.userId ? String(decision.userId) : (decision.user?.id ? String(decision.user.id) : decision.user?.uuid || null)
      const reviewedBy = decision.reviewedBy ? String(decision.reviewedBy) : null
      const status = decision.status || 'unknown'
      // Combine all identifiers to create a truly unique key
      return `onboarding-${id || 'no-id'}-${timestamp || 'no-time'}-${userId || 'no-user'}-${reviewedBy || 'no-reviewer'}-${status}-${index}`
    } else {
      const log = entry.data
      // Use ID, subjectId, timestamp, event, and causer to ensure uniqueness
      const id = log.id ? String(log.id) : null
      const subjectId = log.subjectId ? String(log.subjectId) : null
      const timestamp = log.createdAt || null
      const event = log.event || 'unknown'
      const causerId = log.causer?.id ? String(log.causer.id) : log.causer?.uuid || null
      // Combine all identifiers to create a truly unique key
      return `activity-log-${id || 'no-id'}-${subjectId || 'no-subject'}-${timestamp || 'no-time'}-${event}-${causerId || 'no-causer'}-${index}`
    }
  }

  // Sort entries based on sortConfig
  const sortedEntries = useMemo(() => {
    if (!sortConfig.column || !sortConfig.direction) {
      return auditEntries
    }

    // Create a copy to avoid mutating the original array
    const entries = [...auditEntries]
    const direction = sortConfig.direction === "asc" ? 1 : -1

    return entries.sort((a, b) => {
      let comparison = 0

      switch (sortConfig.column) {
        case "user": {
          const userA = getUserFromEntry(a)
          const userB = getUserFromEntry(b)
          const nameA = userA?.name || "Unknown"
          const nameB = userB?.name || "Unknown"
          comparison = nameA.localeCompare(nameB, undefined, { sensitivity: 'base' })
          break
        }
        case "type": {
          // Use numeric comparison: Onboarding = 0, User Management = 1
          const typeValueA = a.type === 'onboarding' ? 0 : 1
          const typeValueB = b.type === 'onboarding' ? 0 : 1
          comparison = typeValueA - typeValueB
          break
        }
        case "action": {
          let actionA = ""
          let actionB = ""
          if (a.type === 'onboarding') {
            actionA = a.data.status || "Unknown"
          } else {
            const eventDisplay = getEventDisplay(a.data.event)
            actionA = eventDisplay.label
          }
          if (b.type === 'onboarding') {
            actionB = b.data.status || "Unknown"
          } else {
            const eventDisplay = getEventDisplay(b.data.event)
            actionB = eventDisplay.label
          }
          comparison = actionA.localeCompare(actionB, undefined, { sensitivity: 'base' })
          break
        }
        case "role": {
          let roleA = ""
          let roleB = ""
          if (a.type === 'onboarding') {
            roleA = a.data.assignedUserType || ""
          } else {
            const log = a.data
            if (log.properties?.attributes?.roles?.[0]) {
              roleA = log.properties.attributes.roles[0]
            } else if (log.properties?.old?.roles?.[0]) {
              roleA = log.properties.old.roles[0]
            } else {
              const user = getUserFromEntry(a)
              roleA = user?.userType === 'staff' && user.profile?.roles?.[0] ? user.profile.roles[0] : ""
            }
          }
          if (b.type === 'onboarding') {
            roleB = b.data.assignedUserType || ""
          } else {
            const log = b.data
            if (log.properties?.attributes?.roles?.[0]) {
              roleB = log.properties.attributes.roles[0]
            } else if (log.properties?.old?.roles?.[0]) {
              roleB = log.properties.old.roles[0]
            } else {
              const user = getUserFromEntry(b)
              roleB = user?.userType === 'staff' && user.profile?.roles?.[0] ? user.profile.roles[0] : ""
            }
          }
          comparison = roleA.localeCompare(roleB, undefined, { sensitivity: 'base' })
          break
        }
        case "performedBy": {
          let performerA = ""
          let performerB = ""
          if (a.type === 'onboarding') {
            performerA = getReviewerName(a.data.reviewedBy)
          } else {
            performerA = getCauserName(a.data.causer)
          }
          if (b.type === 'onboarding') {
            performerB = getReviewerName(b.data.reviewedBy)
          } else {
            performerB = getCauserName(b.data.causer)
          }
          comparison = performerA.localeCompare(performerB, undefined, { sensitivity: 'base' })
          break
        }
        case "date": {
          const timestampA = getAuditEntryTimestamp(a)
          const timestampB = getAuditEntryTimestamp(b)
          comparison = timestampA - timestampB
          break
        }
        case "details": {
          let detailsA = ""
          let detailsB = ""
          if (a.type === 'onboarding') {
            detailsA = a.data.rejectionReason || ""
          } else {
            detailsA = formatLogDetails(a.data)
          }
          if (b.type === 'onboarding') {
            detailsB = b.data.rejectionReason || ""
          } else {
            detailsB = formatLogDetails(b.data)
          }
          comparison = detailsA.localeCompare(detailsB, undefined, { sensitivity: 'base' })
          break
        }
        default:
          return 0
      }

      return comparison * direction
    })
  }, [auditEntries, sortConfig.column, sortConfig.direction, getReviewerName, getCauserName, users])

  return (
    <TooltipProvider>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="w-full rounded-2xl border border-white/20 dark:border-white/10 bg-card/80 backdrop-blur-xl shadow-xl shadow-primary/5 overflow-hidden"
      >
      {/* Header with Glassmorphism */}
      <div className="relative border-b border-white/10 dark:border-white/5 bg-gradient-to-r from-muted/50 via-muted/30 to-muted/50 backdrop-blur-sm px-8 py-6">
        {/* Decorative gradient orb */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        
        <div className="relative flex items-center gap-4">
          <motion.div 
            className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/25"
            whileHover={{ scale: 1.05, rotate: 5 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
          >
            <History className="h-6 w-6" />
          </motion.div>
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-foreground">
              Decision History & Audit Trail
            </h2>
            <p className="text-sm text-muted-foreground/80 mt-0.5">
              Complete record of all onboarding decisions and user management activities
            </p>
          </div>
        </div>
      </div>

      {/* Table Content */}
      <div className="bg-card/50 backdrop-blur-sm">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : auditEntries.length === 0 ? (
          <AuditEmptyState />
        ) : (
          <div className="overflow-x-auto">
            <div className="rounded-md border border-border/30">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-border/50 bg-muted/30 backdrop-blur-sm">
                    <TableHead className="py-4 px-6 text-left">
                      <SortableHeader
                        label="User"
                        column="user"
                        sortConfig={sortConfig}
                        onSort={handleSort}
                      />
                    </TableHead>
                    <TableHead className="py-4 px-6 text-left">
                      <SortableHeader
                        label="Type"
                        column="type"
                        sortConfig={sortConfig}
                        onSort={handleSort}
                      />
                    </TableHead>
                    <TableHead className="py-4 px-6 text-left">
                      <SortableHeader
                        label="Action"
                        column="action"
                        sortConfig={sortConfig}
                        onSort={handleSort}
                      />
                    </TableHead>
                    <TableHead className="py-4 px-6 text-left">
                      <SortableHeader
                        label="Role"
                        column="role"
                        sortConfig={sortConfig}
                        onSort={handleSort}
                      />
                    </TableHead>
                    <TableHead className="py-4 px-6 text-left">
                      <SortableHeader
                        label="Performed By"
                        column="performedBy"
                        sortConfig={sortConfig}
                        onSort={handleSort}
                      />
                    </TableHead>
                    <TableHead className="py-4 px-6 text-left">
                      <SortableHeader
                        label="Date"
                        column="date"
                        sortConfig={sortConfig}
                        onSort={handleSort}
                      />
                    </TableHead>
                    <TableHead className="py-4 px-6 text-left">
                      <SortableHeader
                        label="Details"
                        column="details"
                        sortConfig={sortConfig}
                        onSort={handleSort}
                      />
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                    {sortedEntries.map((entry, index) => {
                      const user = getUserFromEntry(entry)
                      const timestamp = getTimestamp(entry)
                      const uniqueKey = getEntryKey(entry, index)
                      
                      if (entry.type === 'onboarding') {
                        const decision = entry.data
                        return (
                          <TableRow
                            key={uniqueKey}
                            className="group border-b border-border/30 bg-transparent transition-all duration-300 ease-in-out hover:bg-muted/40 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/5 animate-in fade-in slide-in-from-left-4"
                            style={{ 
                              animationDelay: `${index * 40}ms`,
                              animationFillMode: 'both'
                            }}
                          >
                            <TableCell className="py-5 px-6">
                              <div className="flex items-center gap-3.5">
                                <Avatar className="h-10 w-10 border-2 border-white/50 dark:border-white/20 shadow-md transition-all duration-300 group-hover:ring-2 group-hover:ring-primary/20 group-hover:scale-105">
                                  <AvatarImage src={getUserAvatarUrl(user)} />
                                  <AvatarFallback className="text-xs font-semibold bg-gradient-to-br from-primary/20 to-primary/10">
                                    {user?.name ? getInitials(user.name) : "U"}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-semibold text-foreground text-sm transition-colors duration-200 group-hover:text-primary">
                                    {user?.name || "Unknown"}
                                  </p>
                                  <p className="text-xs text-muted-foreground/70">
                                    {user?.email || "—"}
                                  </p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="py-5 px-6">
                              <span className="inline-flex items-center rounded-xl border border-primary/20 bg-primary/5 dark:bg-primary/10 backdrop-blur-sm px-3 py-1 text-xs font-medium text-primary shadow-sm">
                                Onboarding
                              </span>
                            </TableCell>
                            <TableCell className="py-5 px-6">
                              {decision.status === "approved" ? (
                                <Badge 
                                  variant="outline"
                                  className="gap-1 bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                                >
                                  <CheckCircle size={12} />
                                  Approved
                                </Badge>
                              ) : decision.status === "rejected" ? (
                                <UserStatusBadge status="rejected" />
                              ) : (
                                <Badge 
                                  variant="outline"
                                  className="gap-1 bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                                >
                                  <XCircle size={12} />
                                  {decision.status || "Unknown"}
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="py-5 px-6">
                              {decision.assignedUserType ? (
                                <RoleBadge role={decision.assignedUserType} />
                              ) : (
                                <span className="text-muted-foreground/50">—</span>
                              )}
                            </TableCell>
                            <TableCell className="py-5 px-6">
                              <span className="text-sm font-medium text-foreground/90 transition-colors duration-200 group-hover:text-foreground">
                                {getActionPerformer(entry)}
                              </span>
                            </TableCell>
                            <TableCell className="py-5 px-6">
                              {timestamp ? (
                                <div className="space-y-0.5">
                                  <p className="text-sm font-medium text-foreground">
                                    {format(new Date(timestamp), "MMM d, yyyy")}
                                  </p>
                                  <p className="text-xs text-muted-foreground/60">
                                    {format(new Date(timestamp), "h:mm a")}
                                  </p>
                                </div>
                              ) : (
                                <span className="text-muted-foreground/50">—</span>
                              )}
                            </TableCell>
                            <TableCell className="py-5 px-6">
                              <TruncatedDetails details={decision.rejectionReason || "—"} />
                            </TableCell>
                          </TableRow>
                        )
                      } else {
                        const log = entry.data
                        const eventDisplay = getEventDisplay(log.event)
                        const EventIcon = eventDisplay.icon
                        
                        return (
                          <TableRow
                            key={uniqueKey}
                            className="group border-b border-border/30 bg-transparent transition-all duration-300 ease-in-out hover:bg-muted/40 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/5 animate-in fade-in slide-in-from-left-4"
                            style={{ 
                              animationDelay: `${index * 40}ms`,
                              animationFillMode: 'both'
                            }}
                          >
                            <TableCell className="py-5 px-6">
                              <div className="flex items-center gap-3.5">
                                <Avatar className="h-10 w-10 border-2 border-white/50 dark:border-white/20 shadow-md transition-all duration-300 group-hover:ring-2 group-hover:ring-primary/20 group-hover:scale-105">
                                  <AvatarImage src={getUserAvatarUrl(user)} />
                                  <AvatarFallback className="text-xs font-semibold bg-gradient-to-br from-primary/20 to-primary/10">
                                    {user?.name ? getInitials(user.name) : "U"}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-semibold text-foreground text-sm transition-colors duration-200 group-hover:text-primary">
                                    {user?.name || "Unknown"}
                                  </p>
                                  <p className="text-xs text-muted-foreground/70">
                                    {user?.email || "—"}
                                  </p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="py-5 px-6">
                              <span className="inline-flex items-center rounded-xl border border-primary/20 bg-primary/5 dark:bg-primary/10 backdrop-blur-sm px-3 py-1 text-xs font-medium text-primary shadow-sm">
                                User Management
                              </span>
                            </TableCell>
                            <TableCell className="py-5 px-6">
                              <Badge 
                                variant={eventDisplay.variant}
                                className={eventDisplay.className}
                              >
                                <EventIcon size={12} />
                                {eventDisplay.label}
                              </Badge>
                            </TableCell>
                            <TableCell className="py-5 px-6">
                              {(() => {
                                // For activity logs, try to extract historical role from log properties
                                if (entry.type === 'activity_log') {
                                  const log = entry.data
                                  
                                  // Extract the latest/new role from activity log properties
                                  // Backend uses "old" (old values) and "attributes" (new values) instead of "old_values" and "new_values"
                                  // For role_changed events, prioritize "attributes" (new role after change) over "old" (old role before change)
                                  // Show the NEW role to reflect the user's role after the change
                                  if (log.properties?.attributes?.roles?.[0]) {
                                    return <RoleBadge role={log.properties.attributes.roles[0] as any} />
                                  }
                                  // Fallback: try "old" if attributes not available
                                  if (log.properties?.old?.roles?.[0]) {
                                    return <RoleBadge role={log.properties.old.roles[0] as any} />
                                  }
                                }
                                // Fallback to current user role if no historical data available
                                return user?.userType === 'staff' && user.profile?.roles?.[0] ? (
                                  <RoleBadge role={user.profile.roles[0] as any} />
                                ) : (
                                  <span className="text-muted-foreground/50">—</span>
                                )
                              })()}
                            </TableCell>
                            <TableCell className="py-5 px-6">
                              <span className="text-sm font-medium text-foreground/90 transition-colors duration-200 group-hover:text-foreground">
                                {getActionPerformer(entry)}
                              </span>
                            </TableCell>
                            <TableCell className="py-5 px-6">
                              {timestamp ? (
                                <div className="space-y-0.5">
                                  <p className="text-sm font-medium text-foreground">
                                    {format(new Date(timestamp), "MMM d, yyyy")}
                                  </p>
                                  <p className="text-xs text-muted-foreground/60">
                                    {format(new Date(timestamp), "h:mm a")}
                                  </p>
                                </div>
                              ) : (
                                <span className="text-muted-foreground/50">—</span>
                              )}
                            </TableCell>
                            <TableCell className="py-5 px-6">
                              <TruncatedDetails details={formatLogDetails(log)} />
                            </TableCell>
                          </TableRow>
                        )
                      }
                    })}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </div>
    </motion.div>
    </TooltipProvider>
  )
}

export default AuditTable

