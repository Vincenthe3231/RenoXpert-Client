import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CheckCircle, XCircle, History, Loader2, UserX, UserCheck, UserCog, UserPen } from "lucide-react"
import { format } from "date-fns"
import { AuditEntry } from "./types"
import { User } from "@/lib/api/auth"
import AuditEmptyState from "./components/AuditEmptyState"
import RoleBadge from "@/app/(DashboardLayout)/users/components/RoleBadge"
import UserStatusBadge from "@/app/(DashboardLayout)/users/components/UserStatusBadge"

interface AuditTableProps {
  auditEntries: AuditEntry[]
  isLoading: boolean
  getReviewerName: (reviewedBy: number | null | undefined) => string
  getCauserName: (causer: { id?: number; uuid?: string; name?: string } | null | undefined) => string
  getInitials: (name: string) => string
  users: User[]
}

const AuditTable = ({ auditEntries, isLoading, getReviewerName, getCauserName, getInitials, users }: AuditTableProps) => {
  // Helper to get user avatar URL
  const getUserAvatarUrl = (user: { profile?: any } | null | undefined) => {
    if (!user?.profile) return undefined
    if ('avatarUrl' in user.profile) {
      return user.profile.avatarUrl || undefined
    }
    return undefined
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

  // Helper to get user from subject or causer
  const getUserFromEntry = (entry: AuditEntry) => {
    if (entry.type === 'onboarding') {
      return entry.data.user
    } else {
      const log = entry.data
      // If subject object exists, use it
      if (log.subject && typeof log.subject === 'object' && log.subject !== null) {
        if ((log.subject as any).name || (log.subject as any).email || (log.subject as any).id) {
          return log.subject as any
        }
      }
      // Otherwise, look up by subjectId from users list
      if (log.subjectId) {
        // Try to find by integer ID first
        const userById = users.find(u => u.id === log.subjectId)
        if (userById) return userById
        
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
        if (userByUuid) return userByUuid
      }

      // Fallback: extract user-like information from activity log properties (common for role_changed)
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

        const fromAttributes = tryBuildUser(props.attributes)
        if (fromAttributes) return fromAttributes as any

        const fromOld = tryBuildUser(props.old)
        if (fromOld) return fromOld as any

        const fromSubject = tryBuildUser(props.subject)
        if (fromSubject) return fromSubject as any
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

  return (
    <Card className="shadow-card rounded-full transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="w-5 h-5" />
          Decision History & Audit Trail
        </CardTitle>
        <CardDescription>Complete record of all onboarding decisions and user management activities</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : auditEntries.length === 0 ? (
          <AuditEmptyState />
        ) : (
          <div className="rounded-md border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Performed By</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {auditEntries.map((entry, index) => {
                  const user = getUserFromEntry(entry)
                  const timestamp = getTimestamp(entry)
                  
                  if (entry.type === 'onboarding') {
                    const decision = entry.data
                    return (
                      <TableRow 
                        key={`onboarding-${decision.id || index}`}
                        className="transition-all duration-200 ease-in-out hover:bg-muted/50 hover:-translate-y-0.5 cursor-pointer"
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={getUserAvatarUrl(user)} />
                              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                {user?.name ? getInitials(user.name) : "U"}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-sm">{user?.name || "Unknown"}</p>
                              <p className="text-xs text-muted-foreground">{user?.email || "—"}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            Onboarding
                          </Badge>
                        </TableCell>
                        <TableCell>
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
                        <TableCell>
                          {decision.assignedUserType ? (
                            <RoleBadge role={decision.assignedUserType} />
                          ) : (
                            <span className="text-muted-foreground text-sm">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{getActionPerformer(entry)}</span>
                        </TableCell>
                        <TableCell>
                          {timestamp ? (
                            <div className="text-sm">
                              <p>{format(new Date(timestamp), "MMM d, yyyy")}</p>
                              <p className="text-xs text-muted-foreground">
                                {format(new Date(timestamp), "h:mm a")}
                              </p>
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground max-w-[200px] truncate block">
                            {decision.rejectionReason || "—"}
                          </span>
                        </TableCell>
                      </TableRow>
                    )
                  } else {
                    const log = entry.data
                    const eventDisplay = getEventDisplay(log.event)
                    const EventIcon = eventDisplay.icon
                    
                    return (
                      <TableRow 
                        key={`activity-log-${log.id}`}
                        className="transition-all duration-200 ease-in-out hover:bg-muted/50 hover:-translate-y-0.5 cursor-pointer"
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={getUserAvatarUrl(user)} />
                              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                {user?.name ? getInitials(user.name) : "U"}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-sm">{user?.name || "Unknown"}</p>
                              <p className="text-xs text-muted-foreground">{user?.email || "—"}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            User Management
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={eventDisplay.variant}
                            className={eventDisplay.className}
                          >
                            <EventIcon size={12} />
                            {eventDisplay.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
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
                              <span className="text-muted-foreground text-sm">—</span>
                            )
                          })()}
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{getActionPerformer(entry)}</span>
                        </TableCell>
                        <TableCell>
                          {timestamp ? (
                            <div className="text-sm">
                              <p>{format(new Date(timestamp), "MMM d, yyyy")}</p>
                              <p className="text-xs text-muted-foreground">
                                {format(new Date(timestamp), "h:mm a")}
                              </p>
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground max-w-[200px] truncate block">
                            {log.properties?.old_values || log.properties?.new_values 
                              ? JSON.stringify(log.properties).substring(0, 50) + '...'
                              : "—"}
                          </span>
                        </TableCell>
                      </TableRow>
                    )
                  }
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default AuditTable

