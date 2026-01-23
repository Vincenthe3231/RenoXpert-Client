"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Clock, CheckCircle2, XCircle, ExternalLink, ArrowRight, UserX, UserCheck, UserCog, UserPen } from "lucide-react"
import { format, formatDistanceToNow, isToday, isYesterday } from "date-fns"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { AuditEntry } from "@/app/(DashboardLayout)/audit/types"
import { User } from "@/lib/api/auth"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import RoleBadge from "@/app/(DashboardLayout)/users/components/RoleBadge"
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table"

interface RecentActivityCardProps {
  recentActivities: AuditEntry[]
  getInitials: (name: string) => string
  users: User[]
  activityLogs: any[] // Activity logs to find historical user data for onboarding entries
}

const RecentActivityCard = ({ recentActivities, getInitials, users, activityLogs }: RecentActivityCardProps) => {
  const router = useRouter()
  
  const formatReviewDate = (dateString: string | null | undefined) => {
    if (!dateString) return "—"
    
    const date = new Date(dateString)
    
    // Show relative time for recent dates
    if (isToday(date)) {
      return `Today, ${format(date, "h:mm a")}`
    } else if (isYesterday(date)) {
      return `Yesterday, ${format(date, "h:mm a")}`
    } else {
      // Show absolute date with relative indicator
      const daysAgo = formatDistanceToNow(date, { addSuffix: true })
      return format(date, "MMM d")
    }
  }

  /**
   * Helper to get user avatar URL
   * 
   * AUDIT TRAIL INTEGRITY: Matches AuditTable.tsx logic for consistency
   */
  const getUserAvatarUrl = (user: { profile?: any; id?: any; uuid?: string } | null | undefined) => {
    // First check if user has profile with avatarUrl
    if (user?.profile && 'avatarUrl' in user.profile) {
      const avatarUrl = user.profile.avatarUrl || undefined
      return avatarUrl
    }
    // Fallback: if user has ID, try to find avatar from users list
    if (user?.id || user?.uuid) {
      const subjectId = user.id
      const subjectUuid = user.uuid
      const foundUser = users.find((u) => {
        if (subjectId != null && u.id != null && Number(u.id) === Number(subjectId)) return true
        if (subjectUuid && u.uuid && String(u.uuid) === String(subjectUuid)) return true
        if (subjectId != null && u.id != null && String(u.id) === String(subjectId)) return true
        return false
      })
      if (foundUser?.profile && 'avatarUrl' in foundUser.profile) {
        const avatarUrl = foundUser.profile.avatarUrl || undefined
        return avatarUrl
      }
    }
    return undefined
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
   * 
   * NOTE: This function matches AuditTable.tsx exactly to ensure consistency across components.
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
            fromAttributes = {
              name: props.attributes.name || 'Unknown User',
              email: props.attributes.email || null,
              id: (log as any).subjectId ?? props.attributes.id ?? null,
              uuid: props.attributes.uuid ?? null,
              status: props.attributes.status ?? null,
              userType: props.attributes.user_type ?? props.attributes.userType ?? null,
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
              uuid: source.uuid || null,
              status: source.status || null,
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
              uuid: source.profile.uuid || source.uuid || null,
              status: source.profile.status || source.status || null,
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

  // Helper to get timestamp
  const getTimestamp = (entry: AuditEntry) => {
    if (entry.type === 'onboarding') {
      return entry.data.reviewedAt || entry.data.createdAt
    } else {
      return entry.data.createdAt
    }
  }

  // Helper to get activity config
  const getActivityConfig = (entry: AuditEntry) => {
    if (entry.type === 'onboarding') {
      const status = entry.data.status
      if (status === "approved") {
        return {
          icon: CheckCircle2,
          label: "Approved",
          className: "bg-green-50 text-green-700 border-green-200 hover:bg-green-100",
          iconClassName: "text-green-600",
          typeLabel: "Onboarding",
        }
      } else if (status === "rejected") {
        return {
          icon: XCircle,
          label: "Rejected",
          className: "bg-red-50 text-red-700 border-red-200 hover:bg-red-100",
          iconClassName: "text-red-600",
          typeLabel: "Onboarding",
        }
      }
    } else {
      const event = entry.data.event
      switch (event) {
        case 'deactivated':
          return {
            icon: UserX,
            label: 'Deactivated',
            className: 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100',
            iconClassName: 'text-red-600',
            typeLabel: 'User Management',
          }
        case 'activated':
          return {
            icon: UserCheck,
            label: 'Activated',
            className: 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100',
            iconClassName: 'text-green-600',
            typeLabel: 'User Management',
          }
        case 'role_changed':
          return {
            icon: UserCog,
            label: 'Role Changed',
            className: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100',
            iconClassName: 'text-blue-600',
            typeLabel: 'User Management',
          }
        case 'profile_updated':
          return {
            icon: UserPen,
            label: 'Profile Updated',
            className: 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100',
            iconClassName: 'text-purple-600',
            typeLabel: 'User Management',
          }
        default:
          return {
            icon: Clock,
            label: event,
            className: 'bg-gray-50 text-gray-700 border-gray-200',
            iconClassName: 'text-gray-600',
            typeLabel: 'User Management',
          }
      }
    }
    return {
      icon: Clock,
      label: "Pending",
      className: "bg-gray-50 text-gray-700 border-gray-200",
      iconClassName: "text-gray-600",
      typeLabel: "Onboarding",
    }
  }

  return (
    <Card className="shadow-card lg:col-span-2 rounded-full transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-xl">
      <CardHeader className="flex flex-row items-center justify-between border-b border-border pb-3 px-5 pt-4">
        <div>
          <CardTitle className="text-base font-semibold leading-tight">Recent Activity</CardTitle>
          <CardDescription className="text-xs text-muted-foreground mt-1 leading-relaxed">
            Latest onboarding decisions and user management activities
          </CardDescription>
        </div>
        <Link href="/audit">
          <Button 
            variant="ghost" 
            size="sm"
            className="text-primary hover:text-primary hover:bg-primary/10 h-8 px-2.5"
          >
            <span className="text-xs font-medium">View All</span>
            <ArrowRight className="ml-1 h-3 w-3" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="pt-3 px-3 pb-3">
        {recentActivities.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-8 text-muted-foreground"
          >
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted/50">
              <Clock className="w-6 h-6 opacity-50" />
            </div>
            <p className="text-xs font-medium">No recent activity</p>
            <p className="text-[10px] mt-1 text-muted-foreground/80">
              Onboarding decisions and user management activities will appear here
            </p>
          </motion.div>
        ) : (
          <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
            <Table>
              <TableBody>
                {recentActivities.map((entry, index) => {
                  const activityConfig = getActivityConfig(entry)
                  const ActivityIcon = activityConfig.icon
                  const user = getUserFromEntry(entry)
                  const timestamp = getTimestamp(entry)
                  
                  return (
                    <TableRow
                      key={entry.type === 'onboarding' ? `onboarding-${entry.data.id}` : `activity-log-${entry.data.id}`}
                      className={cn(
                        "group transition-all duration-200 ease-in-out cursor-pointer animate-fade-in",
                        "hover:bg-muted/50 hover:-translate-y-0.5"
                      )}
                      style={{ animationDelay: `${index * 50}ms` }}
                      onClick={() => router.push('/audit')}
                    >
                      {/* Name Cell - matches UserTable structure */}
                      <TableCell className="py-3 px-3">
                        <div className="flex items-center gap-2.5">
                          <div className="relative flex-shrink-0">
                            <Avatar className="h-8 w-8 ring-2 ring-background transition-all duration-200 group-hover:ring-primary/20">
                              <AvatarImage 
                                src={getUserAvatarUrl(user)} 
                                className="object-cover"
                              />
                              <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-semibold border-2 border-background">
                                {user?.name ? getInitials(user.name) : "??"}
                              </AvatarFallback>
                            </Avatar>
                            {/* Status indicator dot */}
                            <div className={cn(
                              "absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-background flex items-center justify-center",
                              activityConfig.iconClassName.includes('green') && "bg-green-500",
                              activityConfig.iconClassName.includes('red') && "bg-red-500",
                              activityConfig.iconClassName.includes('blue') && "bg-blue-500",
                              activityConfig.iconClassName.includes('purple') && "bg-purple-500",
                            )}>
                              <ActivityIcon className={cn("h-1.5 w-1.5 text-white")} />
                            </div>
                          </div>
                          <div>
                            <p className="font-medium text-sm text-foreground">{user?.name || "Unknown User"}</p>
                            <p className="text-[10px] text-muted-foreground">{user?.email || "No email"}</p>
                            {entry.type === 'onboarding' && entry.data.rejectionReason && (
                              <p className="text-[10px] text-muted-foreground/80 mt-0.5 line-clamp-1 italic">
                                "{entry.data.rejectionReason}"
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>

                      {/* Role Cell - separate cell like UserTable */}
                      <TableCell className="py-3 px-3">
                        <div className="flex flex-wrap gap-1">
                          {entry.type === 'onboarding' && entry.data.assignedUserType && user?.userType === "staff" && (
                            <RoleBadge role={entry.data.assignedUserType} />
                          )}
                        </div>
                      </TableCell>

                      {/* Activity Type Cell - separate cell */}
                      <TableCell className="py-3 px-3">
                        <span className="inline-flex items-center rounded-xl border border-primary/20 bg-primary/5 dark:bg-primary/10 backdrop-blur-sm px-2 py-0.5 text-[10px] font-medium text-primary shadow-sm">
                          {activityConfig.typeLabel}
                        </span>
                      </TableCell>

                      {/* Status Cell - matches UserTable structure */}
                      <TableCell className="py-3 px-3">
                        <Badge 
                          variant="outline"
                          className={`gap-1 px-2 py-0.5 h-6 ${activityConfig.className}`}
                        >
                          <ActivityIcon size={10} />
                          <span className="text-[10px] font-medium">{activityConfig.label}</span>
                        </Badge>
                      </TableCell>
                      
                      {/* Date Cell - matches UserTable structure */}
                      <TableCell className="py-3 px-3">
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground whitespace-nowrap">
                            {formatReviewDate(timestamp)}
                          </p>
                          {timestamp && !isToday(new Date(timestamp)) && !isYesterday(new Date(timestamp)) && (
                            <p className="text-[10px] text-muted-foreground/60 mt-0.5 whitespace-nowrap">
                              {formatDistanceToNow(new Date(timestamp), { addSuffix: true })}
                            </p>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default RecentActivityCard
