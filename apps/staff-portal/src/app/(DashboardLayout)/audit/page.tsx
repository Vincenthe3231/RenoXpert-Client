"use client"

import { useState, useMemo, useEffect, useCallback } from "react"
import { useOnboardings } from "@/lib/api/onboarding"
import { useUsers, useOwners, useAuth, type User } from "@/lib/api/auth"
import { useInfiniteActivityLogs } from "@/lib/api/activity-logs"
import AuditHeader from "./components/AuditHeader"
import AuditStatsCards from "./components/AuditStatsCards"
import AuditTable from "./AuditTable"
import { AuditEntry, getAuditEntryTimestamp } from "./types"
import { Pagination } from "@/components/ui/pagination"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Search, ArrowDown, ArrowUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { useDebounce } from "@/hooks/use-debounce"
import { addToSearchHistory } from "@/lib/utils/search-history"
import SearchHistoryDropdown from "./components/SearchHistoryDropdown"
import ColumnFilters, { type ColumnFiltersProps } from "./components/ColumnFilters"

const ITEMS_PER_PAGE = 10

type SortOrder = "newest" | "oldest"

// Default column filters (all enabled by default)
const DEFAULT_COLUMN_FILTERS = {
  user: true,
  role: true,
  action: true,
  type: true,
  performedBy: true,
  date: true,
  details: true,
}

export default function AuditPage() {
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest")
  const [columnFilters, setColumnFilters] = useState<Record<string, boolean>>(DEFAULT_COLUMN_FILTERS)
  const [searchHistoryOpen, setSearchHistoryOpen] = useState(false)

  // Debounce search query for better performance (2s delay)
  const debouncedSearchQuery = useDebounce(searchQuery, 2000)

  // Get current user to check permissions
  const { data: currentUser } = useAuth()
  
  // Check if user is super-admin (for onboarding access only)
  const isSuperAdmin = useMemo(() => {
    if (!currentUser || !currentUser.profile) return false
    const userRoles = currentUser.profile.roles || []
    const normalizedUserRoles = userRoles.map(role => {
      if (typeof role !== 'string') return ''
      return role.toLowerCase().trim().replace(/\s+/g, '-').replace(/_/g, '-')
    }).filter(role => role.length > 0)
    
    return normalizedUserRoles.some(role => 
      role === 'super-admin' || role === 'superadmin' || role === 'super_admin'
    )
  }, [currentUser])

  // Check if user is admin or super-admin (both have access to staff data)
  const isAdminOrSuperAdmin = useMemo(() => {
    if (!currentUser || !currentUser.profile) return false
    const userRoles = currentUser.profile.roles || []
    const normalizedUserRoles = userRoles.map(role => {
      if (typeof role !== 'string') return ''
      return role.toLowerCase().trim().replace(/\s+/g, '-').replace(/_/g, '-')
    }).filter(role => role.length > 0)
    
    return normalizedUserRoles.some(role => 
      role === 'super-admin' || role === 'superadmin' || role === 'super_admin' || role === 'admin'
    )
  }, [currentUser])

  // Get all onboardings (approved and rejected)
  // Only fetch if super-admin (admins don't have access to onboarding data)
  // For non-super-admins, we'll just use an empty array
  const { data: onboardingsData, isLoading: isLoadingOnboardings } = useOnboardings(
    isSuperAdmin ? undefined : undefined
  )
  const onboardings = isSuperAdmin ? (onboardingsData?.data || []) : []

  // Get user management activity logs with infinite pagination
  // Used for: deactivate, activate, profile update, role change
  const { 
    data: userActivityLogsData, 
    isLoading: isLoadingUserActivityLogs,
    error: activityLogsError,
    dataUpdatedAt: activityLogsUpdatedAt,
    status: activityLogsStatus,
    fetchNextPage: fetchNextUserLogs,
    hasNextPage: hasNextUserLogs,
    isFetchingNextPage: isFetchingNextUserLogs,
  } = useInfiniteActivityLogs({
    "filter[log_name]": "user",
    perPage: 100,
  })
  // Flatten all pages into a single array (maintains immutability)
  const userActivityLogs = useMemo(() => {
    return userActivityLogsData?.pages.flatMap(page => page.data) || []
  }, [userActivityLogsData])

  // Get onboarding activity logs with infinite pagination
  // Used for: Staff onboarding (approval, rejection)
  // NOTE: Onboarding activity logs have log_name: "onboarding" (not "user")
  const { 
    data: onboardingActivityLogsData, 
    isLoading: isLoadingOnboardingActivityLogs,
    fetchNextPage: fetchNextOnboardingLogs,
    hasNextPage: hasNextOnboardingLogs,
    isFetchingNextPage: isFetchingNextOnboardingLogs,
  } = useInfiniteActivityLogs({
    "filter[log_name]": "onboarding",
    perPage: 100,
  })
  // Flatten all pages into a single array (maintains immutability)
  const onboardingActivityLogs = useMemo(() => {
    return onboardingActivityLogsData?.pages.flatMap(page => page.data) || []
  }, [onboardingActivityLogsData])

  // Get role permissions management activity logs with infinite pagination
  // Used for: Role permissions management
  const { 
    data: roleActivityLogsData, 
    isLoading: isLoadingRoleActivityLogs,
    fetchNextPage: fetchNextRoleLogs,
    hasNextPage: hasNextRoleLogs,
    isFetchingNextPage: isFetchingNextRoleLogs,
  } = useInfiniteActivityLogs({
    "filter[log_name]": "role",
    perPage: 100,
  })
  // Flatten all pages into a single array (maintains immutability)
  const roleActivityLogs = useMemo(() => {
    return roleActivityLogsData?.pages.flatMap(page => page.data) || []
  }, [roleActivityLogsData])

  // Combine all activity logs to ensure complete audit trail integrity
  // This prevents overwriting issues and ensures immutability of all audit data
  const activityLogs = [...userActivityLogs, ...onboardingActivityLogs, ...roleActivityLogs]

  // Check if any log type has more pages to load
  const hasMoreLogs = hasNextUserLogs || hasNextOnboardingLogs || hasNextRoleLogs
  const isFetchingMoreLogs = isFetchingNextUserLogs || isFetchingNextOnboardingLogs || isFetchingNextRoleLogs

  // Load more handler - fetches next page for all log types that have more pages
  const handleLoadMore = useCallback(() => {
    if (hasNextUserLogs) {
      fetchNextUserLogs()
    }
    if (hasNextOnboardingLogs) {
      fetchNextOnboardingLogs()
    }
    if (hasNextRoleLogs) {
      fetchNextRoleLogs()
    }
  }, [hasNextUserLogs, hasNextOnboardingLogs, hasNextRoleLogs, fetchNextUserLogs, fetchNextOnboardingLogs, fetchNextRoleLogs])

  // Get all users (staff) for additional context
  // Both Admin and Super Admin have backend access to /api/v1/users endpoint
  // Backend allows: Super Admin + Admin + Staff (per user.module middleware)
  const { data: usersData, isLoading: isLoadingUsers } = useUsers(
    isAdminOrSuperAdmin ? { perPage: 1000 } : undefined
  )
  const staffUsers = usersData?.data || []
  
  // Get all owners for additional context (owners might not be in users list)
  // Both Admin and Super Admin have backend access to /api/v1/staff endpoint
  // Backend allows: Super Admin + Admin + Staff (per user.module middleware)
  const { data: ownersData, isLoading: isLoadingOwners } = useOwners(
    isAdminOrSuperAdmin ? { perPage: 1000 } : undefined
  )
  const owners = ownersData?.data || []
  
  // Extract users from onboarding entries (users referenced in activity logs might not be in users list)
  const usersFromOnboardings = useMemo(() => {
    const onboardingUsers: User[] = []
    onboardings.forEach(onboarding => {
      if (onboarding.user && onboarding.user.uuid) {
        onboardingUsers.push(onboarding.user as User)
      }
    })
    return onboardingUsers
  }, [onboardings])

  // Extract reviewer information from activity logs (reviewers might be in causer field)
  const reviewersFromActivityLogs = useMemo(() => {
    const reviewerUsers: User[] = []
    activityLogs.forEach(log => {
      if (log.causer && log.causer.id && log.causer.name) {
        // Create a user-like object from causer for reviewers
        reviewerUsers.push({
          id: log.causer.id,
          uuid: log.causer.uuid || `causer-${log.causer.id}`,
          name: log.causer.name,
          email: log.causer.email || '', // Email might not be available in causer
          status: 'active' as const,
          userType: 'staff' as const,
          profile: log.causer.profile || {
            roles: [],
            permissions: [],
          } as any,
        } as User)
      }
    })
    return reviewerUsers
  }, [activityLogs])

  // Extract subject users from activity logs (users being acted upon)
  // Only run this if API data is not available (fallback for users without API access)
  // When API data is available, this is redundant and causes unnecessary CPU work
  // This maintains same architecture - API data preferred, activity log extraction as fallback
  const subjectsFromActivityLogs = useMemo(() => {
    // Skip processing if we have API data available OR if API calls are still loading (faster loading)
    // API data is preferred because it's complete and includes avatars
    // This prevents expensive computation during loading phase, which was causing admin to load slower
    const hasApiData = (staffUsers.length > 0 || owners.length > 0) || isLoadingUsers || isLoadingOwners
    if (hasApiData) {
      return []
    }
    
    const subjectUsers: User[] = []
    const seenIds = new Set<number>()
    const seenUuids = new Set<string>()
    
    activityLogs.forEach(log => {
      // Extract from log.subject (historical user data at time of event)
      if (log.subject && typeof log.subject === 'object' && log.subject !== null) {
        const subject = log.subject as any
        const subjectId = log.subjectId || subject.id
        const subjectUuid = subject.uuid || (subjectId ? `subject-${subjectId}` : undefined)
        
        // Deduplicate by ID or UUID
        if (subjectId && !seenIds.has(subjectId)) {
          seenIds.add(subjectId)
          if (subject.name || subject.email) {
            subjectUsers.push({
              id: subjectId,
              uuid: subjectUuid || `subject-${subjectId}`,
              name: subject.name || 'Unknown User',
              email: subject.email || null,
              status: subject.status || 'active' as const,
              userType: subject.userType || subject.user_type || 'staff' as const,
              profile: subject.profile || (subject.user?.profile) || {
                roles: [],
                permissions: [],
                avatarUrl: subject.profile?.avatarUrl || subject.user?.profile?.avatarUrl || null,
              } as any,
            } as User)
          }
        } else if (subjectUuid && !seenUuids.has(subjectUuid)) {
          seenUuids.add(subjectUuid)
          if (subject.name || subject.email) {
            subjectUsers.push({
              id: subjectId || null,
              uuid: subjectUuid,
              name: subject.name || 'Unknown User',
              email: subject.email || null,
              status: subject.status || 'active' as const,
              userType: subject.userType || subject.user_type || 'staff' as const,
              profile: subject.profile || (subject.user?.profile) || {
                roles: [],
                permissions: [],
                avatarUrl: subject.profile?.avatarUrl || subject.user?.profile?.avatarUrl || null,
              } as any,
            } as User)
          }
        }
      }
      
      // Also extract from properties.attributes (new values after change)
      if (log.properties?.attributes && typeof log.properties.attributes === 'object') {
        const attrs = log.properties.attributes as any
        const subjectId = log.subjectId || attrs.id
        const subjectUuid = attrs.uuid || (subjectId ? `subject-${subjectId}` : undefined)
        
        if (subjectId && !seenIds.has(subjectId) && (attrs.name || attrs.email)) {
          seenIds.add(subjectId)
          subjectUsers.push({
            id: subjectId,
            uuid: subjectUuid || `subject-${subjectId}`,
            name: attrs.name || 'Unknown User',
            email: attrs.email || null,
            status: attrs.status || 'active' as const,
            userType: attrs.userType || attrs.user_type || 'staff' as const,
            profile: attrs.profile || {
              roles: [],
              permissions: [],
              avatarUrl: attrs.profile?.avatarUrl || null,
            } as any,
          } as User)
        }
      }
      
      // Also extract from properties.old (old values before change)
      if (log.properties?.old && typeof log.properties.old === 'object') {
        const old = log.properties.old as any
        const subjectId = log.subjectId || old.id
        const subjectUuid = old.uuid || (subjectId ? `subject-${subjectId}` : undefined)
        
        if (subjectId && !seenIds.has(subjectId) && (old.name || old.email)) {
          seenIds.add(subjectId)
          subjectUsers.push({
            id: subjectId,
            uuid: subjectUuid || `subject-${subjectId}`,
            name: old.name || 'Unknown User',
            email: old.email || null,
            status: old.status || 'active' as const,
            userType: old.userType || old.user_type || 'staff' as const,
            profile: old.profile || {
              roles: [],
              permissions: [],
              avatarUrl: old.profile?.avatarUrl || null,
            } as any,
          } as User)
        }
      }
    })
    
    return subjectUsers
  }, [activityLogs, staffUsers.length, owners.length, isLoadingUsers, isLoadingOwners])

  // Merge staff users, owners, users from onboarding entries, reviewers from activity logs, and subjects from activity logs into a single list for lookup
  // This ensures admins have access to user data from activity logs, maintaining the same architecture as super admin
  const users = useMemo(() => {
    const allUsers = [...staffUsers, ...owners, ...usersFromOnboardings, ...reviewersFromActivityLogs, ...subjectsFromActivityLogs]
    // Deduplicate by UUID (in case a user appears in multiple lists)
    const uniqueUsers = new Map<string, User>()
    // Also deduplicate by ID to handle cases where we have the same user with different identifiers
    const uniqueUsersById = new Map<number, User>()
    allUsers.forEach(user => {
      if (user.uuid && !uniqueUsers.has(user.uuid)) {
        uniqueUsers.set(user.uuid, user)
        if (user.id) {
          uniqueUsersById.set(user.id, user)
        }
      } else if (user.id && !uniqueUsersById.has(user.id)) {
        uniqueUsersById.set(user.id, user)
        // If we have an ID but no UUID match, add it anyway
        if (!user.uuid || Array.from(uniqueUsers.values()).every(u => u.uuid !== user.uuid)) {
          uniqueUsers.set(user.uuid || `id-${user.id}`, user)
        }
      }
    })
    return Array.from(uniqueUsers.values())
  }, [staffUsers, owners, usersFromOnboardings, reviewersFromActivityLogs, subjectsFromActivityLogs])

  // Create user lookup maps for O(1) access
  const userMapById = useMemo(() => {
    return new Map(users.map(u => [u.id, u]))
  }, [users])

  const userMapByUuid = useMemo(() => {
    return new Map(users.map(u => [u.uuid, u]))
  }, [users])

  // Filter to only show decisions (approved or rejected)
  const decisions = useMemo(() => {
    return onboardings.filter(
      o => o.status === 'approved' || o.status === 'rejected'
    )
  }, [onboardings])

  // Create unified audit entries
  // Show both onboarding decisions (from onboardings table) and activity logs
  const auditEntries: AuditEntry[] = useMemo(() => {
    return [
      ...decisions.map(decision => ({ type: 'onboarding' as const, data: decision })),
      ...activityLogs.map(log => ({ type: 'activity_log' as const, data: log })),
    ]
  }, [decisions, activityLogs])

  // Pre-compute searchable text for each entry (runs once when data changes)
  const entriesWithSearchableText = useMemo(() => {
    return auditEntries.map(entry => {
      const searchableFields: Record<string, string> = {
        user: "",
        role: "",
        action: "",
        type: "",
        performedBy: "",
        date: "",
        details: "",
      }

      // User information
      let userName = ""
      let userEmail = ""

      if (entry.type === 'onboarding') {
        userName = entry.data.user?.name || ""
        userEmail = entry.data.user?.email || ""
        searchableFields.role = entry.data.assignedUserType || ""
      } else {
        const log = entry.data
        if (log.subject?.name) {
          userName = log.subject.name
        } else if (log.subjectId) {
          // Try to find by integer ID first
          let user: User | null = userMapById.get(log.subjectId) || null
          // If not found, try to find by UUID (for owners, subjectId might be a UUID string)
          if (!user) {
            const subjectIdStr = String(log.subjectId)
            user = userMapByUuid.get(subjectIdStr) || null
            // Also try matching string representation of ID
            if (!user) {
              const foundUser = Array.from(userMapById.values()).find(u => String(u.id) === subjectIdStr)
              user = foundUser || null
            }
          }
          userName = user?.name || ""
          userEmail = user?.email || ""
        }
        
        // Get role from log properties - prioritize new role (attributes) over old role (old)
        // Backend uses "old" (old values) and "attributes" (new values) instead of "old_values" and "new_values"
        // Show the latest/new role to reflect the user's role after the change
        if (log.properties?.attributes?.roles?.[0]) {
          // Prioritize "attributes" (new role after change) over "old" (old role before change)
          searchableFields.role = log.properties.attributes.roles[0]
        } else if (log.properties?.old?.roles?.[0]) {
          // Fallback to "old" if "attributes" not available
          searchableFields.role = log.properties.old.roles[0]
        } else if (log.subjectId) {
          // Last resort: use current user role
          let user: User | null = userMapById.get(log.subjectId) || null
          // If not found, try to find by UUID
          if (!user) {
            const subjectIdStr = String(log.subjectId)
            user = userMapByUuid.get(subjectIdStr) || null
            if (!user) {
              const foundUser = Array.from(userMapById.values()).find(u => String(u.id) === subjectIdStr)
              user = foundUser || null
            }
          }
          if (user?.userType === 'staff' && user.profile?.roles?.[0]) {
            searchableFields.role = user.profile.roles[0]
          }
        }
      }

      searchableFields.user = `${userName} ${userEmail}`.trim()

      // Action/Event
      searchableFields.action = entry.type === 'onboarding'
        ? entry.data.status || ""
        : entry.data.event || ""

      // Type
      searchableFields.type = entry.type === 'onboarding' ? 'onboarding' : 'user management'

      // Performed By
      if (entry.type === 'onboarding') {
        const reviewerId = entry.data.reviewedBy
        if (reviewerId) {
          const reviewer = userMapById.get(reviewerId)
          if (reviewer) {
            // Use the same logic as getReviewerName
            const firstRole = reviewer.userType === 'staff' && 'roles' in (reviewer.profile || {}) 
              ? (reviewer.profile as any).roles?.[0] 
              : undefined
            searchableFields.performedBy = firstRole === 'super-admin' ? 'Super Admin' : (reviewer.name || "Super Admin")
          } else {
            // Try to find in reviewersFromActivityLogs
            const reviewerFromLogs = reviewersFromActivityLogs.find(r => r.id === reviewerId)
            if (reviewerFromLogs) {
              const firstRole = reviewerFromLogs.userType === 'staff' && 'roles' in (reviewerFromLogs.profile || {}) 
                ? (reviewerFromLogs.profile as any).roles?.[0] 
                : undefined
              searchableFields.performedBy = firstRole === 'super-admin' ? 'Super Admin' : (reviewerFromLogs.name || "Super Admin")
            } else {
              // Default to "Super Admin" since only super-admins can approve/reject onboarding
              searchableFields.performedBy = "Super Admin"
            }
          }
        } else {
          searchableFields.performedBy = "System"
        }
      } else {
        const causer = entry.data.causer
        if (causer?.name) {
          searchableFields.performedBy = causer.name
        } else if (causer?.id) {
          const causerUser = userMapById.get(causer.id)
          searchableFields.performedBy = causerUser?.name || "Admin"
        } else {
          searchableFields.performedBy = "System"
        }
      }

      // Date (formatted)
      const timestamp = getAuditEntryTimestamp(entry)
      if (timestamp) {
        searchableFields.date = format(new Date(timestamp), "MMM d, yyyy h:mm a").toLowerCase()
      }

      // Details
      if (entry.type === 'onboarding') {
        searchableFields.details = entry.data.rejectionReason || ""
      } else {
        const props = entry.data.properties
        if (props) {
          // Extract meaningful text from properties
          const parts: string[] = []
          if (props.old_values) {
            parts.push(JSON.stringify(props.old_values))
          }
          if (props.new_values) {
            parts.push(JSON.stringify(props.new_values))
          }
          if (props.attributes) {
            parts.push(JSON.stringify(props.attributes))
          }
          searchableFields.details = parts.join(" ")
        }
      }

      // Build searchable text based on enabled column filters
      const enabledFields = Object.entries(searchableFields)
        .filter(([key]) => columnFilters[key] !== false)
        .map(([, value]) => value)
        .filter(Boolean)
        .join(" ")
        .toLowerCase()

      return {
        entry,
        searchableText: enabledFields,
        searchableFields,
      }
    })
  }, [auditEntries, userMapById, userMapByUuid, reviewersFromActivityLogs, columnFilters])

  // Filter and sort entries with optimized search
  const filteredAndSortedEntries = useMemo(() => {
    let filtered = entriesWithSearchableText

    // Apply search filter (using debounced query)
    if (debouncedSearchQuery.trim()) {
      const query = debouncedSearchQuery.toLowerCase().trim()
      // Use simple string includes for fastest performance
      filtered = entriesWithSearchableText.filter(({ searchableText }) => {
        return searchableText.includes(query)
      })
    }

    // Extract entries and apply sorting
    const entries = filtered.map(({ entry }) => entry)
    const sorted = [...entries].sort((a, b) => {
      const timestampA = getAuditEntryTimestamp(a)
      const timestampB = getAuditEntryTimestamp(b)
      return sortOrder === "newest" 
        ? timestampB - timestampA 
        : timestampA - timestampB
    })

    return sorted
  }, [entriesWithSearchableText, debouncedSearchQuery, sortOrder])

  // Save to search history when search is performed
  useEffect(() => {
    if (debouncedSearchQuery.trim() && debouncedSearchQuery.length >= 2) {
      addToSearchHistory(debouncedSearchQuery)
    }
  }, [debouncedSearchQuery])

  // Reset to page 1 when search or sort changes
  useEffect(() => {
    setCurrentPage(1)
  }, [debouncedSearchQuery, sortOrder, columnFilters])

  // Calculate pagination
  const totalPages = Math.ceil(filteredAndSortedEntries.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const paginatedEntries = filteredAndSortedEntries.slice(startIndex, endIndex)

  // Reset to page 1 if current page is out of bounds
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1)
    }
  }, [currentPage, totalPages])

  // Create a map of users by ID/UUID for quick lookup (for display purposes)
  const userMap = new Map(users.map(u => [u.uuid, u]))
  const userMapByIdForDisplay = useMemo(() => {
    const map = new Map<number, User>()
    users.forEach(u => {
      if (u.id) {
        map.set(u.id, u)
      }
    })
    return map
  }, [users])

  // Find reviewer/causer names (for display)
  const getReviewerName = useCallback((reviewedBy: number | null | undefined) => {
    if (!reviewedBy) return "System"
    
    // First, try to find in userMapByIdForDisplay
    const user = userMapByIdForDisplay.get(reviewedBy)
    if (user) {
      // Check if user has super-admin role and display accordingly
      // Only staff users have roles in their profile
      const firstRole = user.userType === 'staff' && 'roles' in (user.profile || {}) ? (user.profile as any).roles?.[0] : undefined
      const displayName = firstRole === 'super-admin' ? 'Super Admin' : (user.name || "Super Admin")
      return displayName
    }
    
    // If user not found, try to find in reviewersFromActivityLogs
    // (This was already being collected but not used in the lookup)
    const reviewerFromLogs = reviewersFromActivityLogs.find(r => r.id === reviewedBy)
    if (reviewerFromLogs) {
      const firstRole = reviewerFromLogs.userType === 'staff' && 'roles' in (reviewerFromLogs.profile || {}) 
        ? (reviewerFromLogs.profile as any).roles?.[0] 
        : undefined
      return firstRole === 'super-admin' ? 'Super Admin' : (reviewerFromLogs.name || "Super Admin")
    }
    
    // If still not found, default to "Super Admin" since only super-admins can approve/reject
    // This is more accurate than "Admin" since the business rule states only super-admins can perform this action
    return "Super Admin"
  }, [userMapByIdForDisplay, reviewersFromActivityLogs])

  const getCauserName = useCallback((causer: { id?: number; uuid?: string; name?: string } | null | undefined) => {
    if (!causer) return "System"
    if (causer.name) return causer.name
    if (causer.id) {
      const user = userMapByIdForDisplay.get(causer.id)
      return user?.name || "Admin"
    }
    if (causer.uuid) {
      const user = userMap.get(causer.uuid)
      return user?.name || "Admin"
    }
    return "System"
  }, [userMap, userMapByIdForDisplay])

  const getInitials = (name: string) => 
    name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)

  // Calculate statistics (based on filtered results)
  const approvedCount = decisions.filter(d => d.status === "approved").length
  const rejectedCount = decisions.filter(d => d.status === "rejected").length
  const activityLogCount = activityLogs.length
  const totalEntries = filteredAndSortedEntries.length

  const isLoading = isLoadingOnboardings || isLoadingUserActivityLogs || isLoadingOnboardingActivityLogs || isLoadingRoleActivityLogs || isLoadingUsers || isLoadingOwners

  const handleSearchHistorySelect = (query: string) => {
    setSearchQuery(query)
    setSearchHistoryOpen(false)
  }

  return (
    <div className="space-y-6">
      <AuditHeader />
      {activityLogsError && (() => {
        // Don't show error banner for expected permission errors (401/403)
        const status = (activityLogsError as any)?.response?.status
        if (status === 401 || status === 403) {
          return null
        }
        return (
          <div className="rounded-md bg-yellow-50 border border-yellow-200 p-4">
            <p className="text-sm text-yellow-800">
              <strong>Warning:</strong> Unable to load activity logs. {activityLogsError instanceof Error ? activityLogsError.message : 'Unknown error'}
            </p>
            <p className="text-xs text-yellow-600 mt-1">
              Check the browser console for more details.
            </p>
          </div>
        )
      })()}
      <AuditStatsCards 
        totalDecisions={decisions.length}
        approvedCount={approvedCount}
        rejectedCount={rejectedCount}
        activityLogCount={activityLogCount}
        totalEntries={totalEntries}
      />
      
      {/* Search and Sort Controls */}
      <Card className="p-2.5 sm:p-3 rounded-full shadow-card overflow-hidden">
        <div className="flex flex-row gap-2 sm:gap-2.5 items-center w-full min-w-0">
          {/* Search Input */}
          <div className="flex-1 min-w-0">
            <div className="relative">
              <Search className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground z-10 flex-shrink-0" />
              <Input
                type="text"
                placeholder="Search all columns..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 sm:pl-10 pr-8 sm:pr-10 h-8 sm:h-9 text-xs sm:text-sm w-full min-w-0"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex-shrink-0">
                <SearchHistoryDropdown
                  onSelectQuery={handleSearchHistorySelect}
                  isOpen={searchHistoryOpen}
                  onOpenChange={setSearchHistoryOpen}
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            <ColumnFilters
              filters={columnFilters}
              onFiltersChange={setColumnFilters}
            />
            <Button
              variant="outline"
              size="sm"
              className="h-8 sm:h-9 px-1.5 sm:px-2.5 gap-1 sm:gap-1.5 flex-shrink-0"
              onClick={() => setSortOrder(sortOrder === "newest" ? "oldest" : "newest")}
              title={sortOrder === "newest" ? "Sort: Newest First (Click to change)" : "Sort: Oldest First (Click to change)"}
            >
              {sortOrder === "newest" ? (
                <ArrowDown className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
              ) : (
                <ArrowUp className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
              )}
              <span className="text-xs sm:text-sm font-medium hidden md:inline whitespace-nowrap">
                {sortOrder === "newest" ? "Newest" : "Oldest"}
              </span>
            </Button>
          </div>
        </div>
      </Card>

      <AuditTable 
        auditEntries={paginatedEntries}
        isLoading={isLoading}
        getReviewerName={getReviewerName}
        getCauserName={getCauserName}
        getInitials={getInitials}
        users={users}
        activityLogs={activityLogs}
        userMapById={userMapById}
        userMapByUuid={userMapByUuid}
      />
      
      {/* Load More Button - Loads additional pages from API */}
      {hasMoreLogs && (
        <div className="flex items-center justify-center pt-4 pb-2">
          <Button
            variant="outline"
            onClick={handleLoadMore}
            disabled={isFetchingMoreLogs}
            className="min-w-[120px]"
          >
            {isFetchingMoreLogs ? (
              <>
                <span className="mr-2">Loading...</span>
              </>
            ) : (
              "Load More"
            )}
          </Button>
        </div>
      )}

      {/* Client-side Pagination - Only show if we have more entries than ITEMS_PER_PAGE */}
      {filteredAndSortedEntries.length > ITEMS_PER_PAGE && (
        <div className="flex items-center justify-center pt-4">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  )
}
