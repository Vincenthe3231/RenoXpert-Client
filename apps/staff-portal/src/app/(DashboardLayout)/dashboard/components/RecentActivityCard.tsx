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
   * BUSINESS LOGIC: Always use current username - the latest username change overwrites all previous usernames
   * 
   * USER COLUMN: Shows current username (always from current user data)
   * DETAILS COLUMN: Shows historical changes from log.properties (old → new values)
   * 
   * Priority order for USER column (always current):
   * 1. Current user from entry.data.user (onboarding entries) or users list (activity logs)
   * 2. log.subject.name (if backend provides current data)
   * 3. Fallback to description parsing (only if current data unavailable)
   * 
   * NOTE: This function matches AuditTable.tsx exactly to ensure consistency across components.
   */
  const getUserFromEntry = (entry: AuditEntry) => {
    if (entry.type === 'onboarding') {
      // BUSINESS LOGIC: Always use current username from entry.data.user
      // The latest username change should overwrite all previous usernames in the audit trail
      const onboardingUser = entry.data.user
      const userId = entry.data.userId
      
      // PRIORITY 1: Use current user data from onboarding entry (always current)
      if (onboardingUser?.name) {
        return onboardingUser
      }
      
      // PRIORITY 2: If name missing in entry.data.user, try to get from current users list
      if (userId) {
        const foundUser = users.find((u) => {
          if (u.id != null && Number(u.id) === Number(userId)) return true
          if (u.uuid && onboardingUser?.uuid && String(u.uuid) === String(onboardingUser.uuid)) return true
          return false
        })
        if (foundUser?.name) {
          return foundUser
        }
      }
      
      // Last resort: return whatever we have from onboarding entry
      return onboardingUser
    } else {
      const log = entry.data
      
      // BUSINESS LOGIC: Always use current username - prioritize current users list first
      // The latest username change should overwrite all previous usernames in the audit trail
      
      // PRIORITY 1: Get current user from users list (most up-to-date)
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
        if (foundUser?.name) {
          return foundUser
        }
      }
      
      // PRIORITY 2: Use subject field (backend provides current user data)
      if (log.subject && typeof log.subject === 'object' && log.subject !== null) {
        if ((log.subject as any).name || (log.subject as any).email || (log.subject as any).id) {
          return log.subject as any
        }
      }
      
      // Fallback: If subjectId exists but subject is null, user might be deleted
      if (log.subjectId && !log.subject) {
        // Return deleted user placeholder
        return {
          name: 'Deleted User',
          email: null,
          id: log.subjectId,
          uuid: null,
          status: null,
          userType: null,
          profile: undefined,
        } as any
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
