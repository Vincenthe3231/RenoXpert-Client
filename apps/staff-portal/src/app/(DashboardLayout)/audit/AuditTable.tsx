import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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

const AuditTable = ({ auditEntries, isLoading, getReviewerName, getCauserName, getInitials, users }: AuditTableProps) => {
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

      // For profile update events, check properties FIRST to get historical name
      // This prevents showing the current name instead of the historical name
      const isProfileUpdate = log.event === 'profile_updated' || log.event === 'updated'
      
      if (isProfileUpdate && log.properties && typeof log.properties === 'object') {
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
        const fromOld = tryBuildUser(props.old)
        if (fromOld) return fromOld as any

        const fromSubject = tryBuildUser(props.subject)
        if (fromSubject) return fromSubject as any
      }

      // Look up by subjectId from users list (returns CURRENT user data)
      // Skip this for profile updates since we already checked properties above
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

      // Fallback: extract user-like information from activity log properties (for non-profile-update events)
      if (!isProfileUpdate && log.properties && typeof log.properties === 'object') {
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

        // For other events: try attributes first, then old
        const fromAttributes = tryBuildUser(props.attributes)
        if (fromAttributes) {
          // If email is missing, try to get it from old or users list
          if (fromAttributes.name && !fromAttributes.email) {
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
        
        const fromOld = tryBuildUser(props.old)
        if (fromOld) {
          // If email is missing, try to get it from attributes or users list
          if (fromOld.name && !fromOld.email) {
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
            const props = a.data.properties
            if (props?.old_values || props?.new_values) {
              detailsA = JSON.stringify(props).substring(0, 50)
            }
          }
          if (b.type === 'onboarding') {
            detailsB = b.data.rejectionReason || ""
          } else {
            const props = b.data.properties
            if (props?.old_values || props?.new_values) {
              detailsB = JSON.stringify(props).substring(0, 50)
            }
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
                      
                      if (entry.type === 'onboarding') {
                        const decision = entry.data
                        return (
                          <TableRow
                            key={`onboarding-${decision.id || index}`}
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
                              <span className="text-sm text-muted-foreground/70 max-w-[200px] truncate block">
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
                              <span className="text-sm text-muted-foreground/70 max-w-[200px] truncate block">
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
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default AuditTable

