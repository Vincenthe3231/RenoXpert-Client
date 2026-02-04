"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowRight, Clock } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"
import { AuditEntry } from "@/app/(DashboardLayout)/audit/types"
import type { ActivityLog } from "@/lib/api/activity-logs"
import { User } from "@/lib/api/auth"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { DepartmentBadge } from "@/app/(DashboardLayout)/audit/components/DepartmentBadge"
import { TypeBadge } from "@/app/(DashboardLayout)/audit/badges/TypeBadge"
import { ActionBadge } from "@/app/(DashboardLayout)/audit/badges/ActionBadge"
import { getAuditTypeLabel } from "@/app/(DashboardLayout)/audit/badges/auditBadgeConfig"

interface RecentActivityCardProps {
  recentActivities: AuditEntry[]
  getInitials: (name: string) => string
  users: User[]
  activityLogs: ActivityLog[] // Activity logs to find historical user data for onboarding entries
}

const RecentActivityCard = ({ recentActivities, getInitials, users, activityLogs }: RecentActivityCardProps) => {

  // Helper to extract department from user
  const getUserDepartment = (user: { profile?: { department?: string | null; roles?: string[] }; roles?: string[] } | null | undefined): string | null => {
    if (!user) return null

    // Priority 1: Check direct department field in profile (new dynamic schema from backend)
    if (user.profile?.department) {
      return user.profile.department
    }

    // Priority 2: Fallback to roles array if present - use the first role as a best-effort guess
    const roles = user.profile?.roles || user.roles || []
    const department = roles[0]

    return department || null
  }

  /**
   * Helper to get user avatar URL
   */
  const getUserAvatarUrl = (user: { profile?: { avatarUrl?: string | null }; id?: number | string; uuid?: string; userType?: string } | null | undefined) => {
    // Skip avatar fetching for departments
    if (user?.userType === 'department') {
      return undefined
    }
    if (user?.profile && 'avatarUrl' in user.profile) {
      const avatarUrl = user.profile.avatarUrl || undefined
      return avatarUrl
    }
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
   */
  const getUserFromEntry = (entry: AuditEntry) => {
    if (entry.type === 'onboarding') {
      const onboardingUser = entry.data.user
      const userId = entry.data.userId

      if (onboardingUser?.name) {
        return onboardingUser
      }

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

      return onboardingUser
    } else {
      const log = entry.data
      
      // CHECK IF THIS IS A DEPARTMENT LOG
      if (log.logName === 'department') {
        // For department logs, the subject is a department, not a user
        if (log.subject && typeof log.subject === 'object') {
          const department = log.subject as any
          return {
            name: department.name || 'Unknown Department',
            email: null, // Departments don't have emails
            id: department.id || log.subjectId || null,
            uuid: null,
            status: department.status,
            userType: 'department', // Custom type to identify this as a department
            profile: {
              colorScheme: department.colorScheme || department.color_scheme,
            },
          } as any
        }
        // If no subject, check properties.attributes (for created/updated)
        if (log.properties?.attributes) {
          const attrs = log.properties.attributes as any
          return {
            name: attrs.name || 'Unknown Department',
            email: null,
            id: log.subjectId || null,
            uuid: null,
            status: attrs.status,
            userType: 'department',
            profile: {
              colorScheme: attrs.colorScheme || attrs.color_scheme,
            },
          } as any
        }
        // For deleted departments, check properties.old (old values before deletion)
        if (log.properties?.old) {
          const oldAttrs = log.properties.old as any
          return {
            name: oldAttrs.name || 'Unknown Department',
            email: null,
            id: log.subjectId || null,
            uuid: null,
            status: oldAttrs.status,
            userType: 'department',
            profile: {
              colorScheme: oldAttrs.colorScheme || oldAttrs.color_scheme,
            },
          } as any
        }
        // Fallback: Even if we can't find department data, return a department object
        // This prevents falling through to user lookup which would incorrectly match a user ID
        // Try to extract name from description if available
        let departmentName = 'Unknown Department'
        if (log.description) {
          // Try to extract department name from description patterns
          const nameMatch = log.description.match(/(?:department|Department)\s+(?:created|updated|deleted)[\s:]+(.+?)(?:\s|$)/i) ||
                          log.description.match(/Department:\s*(.+?)(?:\s|$)/i)
          if (nameMatch && nameMatch[1]) {
            departmentName = nameMatch[1].trim()
          }
        }
        return {
          name: departmentName,
          email: null,
          id: log.subjectId || null,
          uuid: null,
          status: null,
          userType: 'department',
          profile: undefined,
        } as any
      }
      
      const subjectIdStr = String(log.subjectId)

      const foundUser = users.find((u) => {
        if (u.id != null && Number(u.id) === Number(log.subjectId)) return true
        if (u.id != null && String(u.id) === subjectIdStr) return true
        if (u.uuid && String(u.uuid) === subjectIdStr) return true
        return false
      })
      if (foundUser?.name) {
        return foundUser
      }

      if (log.subject && typeof log.subject === 'object' && log.subject !== null) {
        if ((log.subject as any).name || (log.subject as any).email || (log.subject as any).id) {
          return log.subject as any
        }
      }

      if (log.subjectId && !log.subject) {
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

        let fromAttributes: any = null
        if (props.attributes && typeof props.attributes === 'object') {
          if (props.attributes.name) {
            fromAttributes = {
              name: props.attributes.name || 'Unknown User',
              email: props.attributes.email || null,
              id: (log as any).subjectId ?? props.attributes.id ?? null,
              uuid: props.attributes.uuid ?? null,
              status: props.attributes.status ?? null,
              userType: props.attributes.user_type ?? props.attributes.userType ?? null,
            }
          } else {
            fromAttributes = tryBuildUser(props.attributes)
          }
        }

        if (fromAttributes && fromAttributes.name) {
          if (!fromAttributes.email) {
            const fromOld = tryBuildUser(props.old)
            if (fromOld?.email) {
              fromAttributes.email = fromOld.email
            } else if (log.subjectId) {
              const subjectId = log.subjectId as any
              const subjectIdStr = String(subjectId)
              const foundUser = users.find((u) => {
                if (u.id != null && Number(u.id) === Number(subjectId)) return true
                if (u.id != null && String(u.id) === subjectIdStr) return true
                if (u.uuid && String(u.uuid) === subjectIdStr) return true
                return false
              })
              if (foundUser?.email) {
                fromAttributes.email = foundUser.email
              }
            }
          }
          return fromAttributes as any
        }

        const fromOld = tryBuildUser(props.old)
        if (fromOld && fromOld.name) {
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

      if ((log.event === 'activated' || log.event === 'deactivated') && log.description) {
        const descriptionMatch = log.description.match(/(?:activated|deactivated):\s*(.+)$/i)
        if (descriptionMatch && descriptionMatch[1]) {
          const extractedName = descriptionMatch[1].trim()
          let email = null
          if (log.subjectId) {
            const subjectId = log.subjectId as any
            const subjectIdStr = String(subjectId)
            const foundUser = users.find((u) => {
              if (u.id != null && Number(u.id) === Number(subjectId)) return true
              if (u.id != null && String(u.id) === subjectIdStr) return true
              if (u.uuid && String(u.uuid) === subjectIdStr) return true
              return false
            })
            email = foundUser?.email || null
          }
          let profile = undefined
          if (log.subjectId) {
            const subjectId = log.subjectId as any
            const subjectIdStr = String(subjectId)
            const foundUser = users.find((u) => {
              if (u.id != null && Number(u.id) === Number(subjectId)) return true
              if (u.id != null && String(u.id) === subjectIdStr) return true
              if (u.uuid && String(u.uuid) === subjectIdStr) return true
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

      if (log.subject && typeof log.subject === 'object') {
        const tryBuildUser = (source: any) => {
          if (!source || typeof source !== 'object') return null
          if (source.name || source.email) {
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
          if (!fromSubject.profile?.avatarUrl && log.subjectId) {
            const subjectId = log.subjectId as any
            const subjectIdStr = String(subjectId)
            const foundUser = users.find((u) => {
              if (u.id != null && Number(u.id) === Number(subjectId)) return true
              if (u.id != null && String(u.id) === subjectIdStr) return true
              if (u.uuid && String(u.uuid) === subjectIdStr) return true
              return false
            })
            if (foundUser?.profile && 'avatarUrl' in foundUser.profile) {
              fromSubject.profile = { avatarUrl: foundUser.profile.avatarUrl || null }
            }
          }
          return fromSubject as any
        }
      }

      if (log.subjectId && log.event !== 'activated' && log.event !== 'deactivated' && log.event !== 'role_changed') {
        const userById = users.find(u => u.id === log.subjectId)
        if (userById) return userById
        const subjectIdStr = String(log.subjectId)
        const userByUuid = users.find(u => u.uuid === subjectIdStr || String(u.id) === subjectIdStr)
        if (userByUuid) return userByUuid
      }

      if (log.event === 'role_changed' && log.subjectId) {
        let historicalName = null
        if (log.subject && typeof log.subject === 'object' && (log.subject as any).name) {
          historicalName = (log.subject as any).name
        }
        if (!historicalName && log.description) {
          const descriptionMatch = log.description.match(/role\s+changed\s+for\s+([^:]+?)\s*:/i)
          if (descriptionMatch && descriptionMatch[1]) {
            historicalName = descriptionMatch[1].trim()
          }
        }
        if (historicalName) {
          const subjectId = log.subjectId as any
          const subjectIdStr = String(subjectId)
          const foundUser = users.find((u) => {
            if (u.id != null && Number(u.id) === Number(subjectId)) return true
            if (u.id != null && String(u.id) === subjectIdStr) return true
            if (u.uuid && String(u.uuid) === subjectIdStr) return true
            return false
          })
          const profile = foundUser?.profile && 'avatarUrl' in foundUser.profile
            ? { avatarUrl: foundUser.profile.avatarUrl || null }
            : undefined
          return {
            name: historicalName,
            email: foundUser?.email || null,
            id: log.subjectId || null,
            uuid: foundUser?.uuid || null,
            status: foundUser?.status || null,
            userType: foundUser?.userType || null,
            profile: profile,
          } as any
        }
      }
    }
    return null
  }

  // Helper to get timestamp
  const getTimestamp = (entry: AuditEntry) => {
    if (entry.type === 'onboarding') {
      return entry.data.reviewedAt || entry.data.createdAt
    } else {
      return entry.data.createdAt
    }
  }

  // Helper to get icon class name for status indicator (used for avatar status dot)
  const getIconClassName = (entry: AuditEntry): string => {
    if (entry.type === 'onboarding') {
      const status = entry.data.status
      if (status === "approved") return "text-green-500"
      if (status === "rejected") return "text-red-500"
      return "text-amber-500"
    } else {
      const event = entry.data.event
      const logName = entry.data.logName
      
      if (logName === 'department') {
        if (event === 'updated') return "text-blue-500"
        return "text-gray-500"
      }
      
      switch (event) {
        case 'deactivated':
        case 'rejected':
          return "text-red-500"
        case 'activated':
        case 'approved':
          return "text-green-500"
        case 'role_changed':
          return "text-blue-500"
        case 'profile_updated':
          return "text-purple-500"
        case 'pending':
        case 'verifying':
          return "text-amber-500"
        default:
          return "text-gray-500"
      }
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
    >
      <Card className="shadow-card transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Recent Activity</CardTitle>
              <CardDescription>Latest updates from your team</CardDescription>
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
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {recentActivities.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12 px-6 text-muted-foreground"
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
            <div className="overflow-x-auto">
              <Table>
                <TableBody>
                  {recentActivities.map((entry, index) => {
                    const user = getUserFromEntry(entry)
                    const department = getUserDepartment(user)
                    const timestamp = getTimestamp(entry)
                    const avatarUrl = getUserAvatarUrl(user)
                    const initials = user?.name ? getInitials(user.name) : "??"
                    const iconClassName = getIconClassName(entry)
                    const typeLabel = entry.type === 'onboarding' 
                      ? "Onboarding"
                      : getAuditTypeLabel(entry.data.logName, entry.type, entry.data.properties)
                    const event = entry.type === 'onboarding' 
                      ? entry.data.status || "pending"
                      : entry.data.event
                    const logName = entry.type === 'onboarding' 
                      ? "onboarding"
                      : entry.data.logName

                    return (
                      <motion.tr
                        key={entry.type === 'onboarding' ? `onboarding-${entry.data.id}` : `activity-log-${entry.data.id}`}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
                        className="group border-b border-border/30 hover:bg-muted/30 transition-colors duration-200"
                      >
                        {/* Avatar with Status */}
                        <TableCell className="py-4 px-4 w-[60px]">
                          <div className="relative flex items-center justify-center">
                            {user?.userType === 'department' ? (
                              <div className="h-10 w-10 rounded-full border-2 border-background shadow-md transition-all duration-300 flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/10 group-hover:scale-105">
                                <span className="text-lg">🏢</span>
                              </div>
                            ) : (
                              <Avatar className="h-10 w-10 border-2 border-background transition-all duration-300 group-hover:scale-105">
                                <AvatarImage src={avatarUrl} alt={user?.name || "User"} />
                                <AvatarFallback className="bg-primary/10 text-primary text-sm">
                                  {initials}
                                </AvatarFallback>
                              </Avatar>
                            )}
                            <div className={cn(
                              "absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-background",
                              iconClassName.includes('green') && "bg-green-500",
                              iconClassName.includes('red') && "bg-red-500",
                              iconClassName.includes('blue') && "bg-blue-500",
                              iconClassName.includes('purple') && "bg-purple-500",
                              iconClassName.includes('amber') && "bg-amber-500",
                              (iconClassName.includes('gray') || iconClassName.includes('muted')) && "bg-gray-400"
                            )} />
                          </div>
                        </TableCell>

                        {/* User Info */}
                        <TableCell className="py-4 px-4 min-w-[180px]">
                          <div className="space-y-0.5">
                            <p className="font-medium text-foreground text-sm truncate">
                              {user?.name || "Unknown User"}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {user?.userType === 'department' ? "—" : (user?.email || "No email")}
                            </p>
                          </div>
                        </TableCell>

                        {/* Type Badge */}
                        <TableCell className="py-4 px-4 hidden lg:table-cell">
                          <TypeBadge typeLabel={typeLabel} size="sm" />
                        </TableCell>

                        {/* Action Badge */}
                        <TableCell className="py-4 px-4 hidden sm:table-cell">
                          <div className="flex flex-col items-end gap-1.5">
                            <ActionBadge
                              event={event}
                              logName={logName}
                              log={entry.data}
                              size="sm"
                            />
                            {(() => {
                              const standardDepartments = ["Owner Sales", "Renovation", "Technician", "Finance & Account"]
                              const isStandardDepartment = department && standardDepartments.includes(department)
                              
                              if (department && !isStandardDepartment && user?.profile?.colorScheme) {
                                return <DepartmentBadge department={department} size="sm" colorScheme={user.profile.colorScheme as any} />
                              }
                              return department ? <DepartmentBadge department={department} size="sm" /> : null
                            })()}
                          </div>
                        </TableCell>

                        {/* Timestamp */}
                        <TableCell className="py-4 px-4 text-right whitespace-nowrap min-w-[100px]">
                          <span className="text-xs text-muted-foreground">
                            {timestamp ? formatDistanceToNow(new Date(timestamp as string), { addSuffix: true }) : "Unknown"}
                          </span>
                        </TableCell>
                      </motion.tr>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default RecentActivityCard
