"use client"

import { useMemo } from "react"
import { useAuth, useOwners, useUsers, type User } from "@/lib/api/auth"
import { useOnboardings } from "@/lib/api/onboarding"
import { useActivityLogs } from "@/lib/api/activity-logs"
import { Loader2 } from "lucide-react"
import DashboardHeader from "./components/DashboardHeader"
import DashboardStatsCards from "./components/DashboardStatsCards"
import QuickActionsCard from "./components/QuickActionsCard"
import RecentActivityCard from "./components/RecentActivityCard"
import RegularUserView from "./components/RegularUserView"
import { AuditEntry, getAuditEntryTimestamp } from "../audit/types"

export default function Dashboard() {
  const { data: user, isLoading: isAuthLoading } = useAuth()

  // Helper function to check if user has required role
  const hasRequiredRole = (requiredRole: 'super-admin' | 'admin' | 'staff' | undefined): boolean => {
    if (!requiredRole) return true
    if (!user || !user.profile) return false

    const userRoles = user.profile.roles || []
    const normalizedUserRoles = userRoles.map(role => {
      if (typeof role !== 'string') return ''
      return role.toLowerCase().trim().replace(/\s+/g, '-').replace(/_/g, '-')
    }).filter(role => role.length > 0)
    
    const normalizedRequired = requiredRole.toLowerCase()

    if (normalizedUserRoles.includes(normalizedRequired)) {
      return true
    }

    // Super admin can access everything
    const isSuperAdmin = normalizedUserRoles.some(role => 
      role === 'super-admin' || role === 'superadmin'
    )
    
    if (isSuperAdmin) {
      return true
    }

    return false
  }

  // Check if user is super-admin
  const isSuperAdmin = hasRequiredRole('super-admin')

  // Get users for stats and context (only for super-admin)
  // NOTE: /users returns staff users; /owners returns owners. We need both for activity log subject resolution.
  const { data: usersData } = useUsers(isSuperAdmin ? { per_page: 1000 } : undefined)
  const totalUsers = isSuperAdmin ? (usersData?.meta?.total || 0) : 0
  const staffUsers = isSuperAdmin ? (usersData?.data || []) : []

  const { data: ownersData } = useOwners(isSuperAdmin ? { per_page: 1000 } : undefined)
  const owners = isSuperAdmin ? (ownersData?.data || []) : []

  const users = useMemo(() => {
    if (!isSuperAdmin) return []
    const allUsers = [...staffUsers, ...owners]
    const uniqueUsers = new Map<string, User>()
    allUsers.forEach((u) => {
      if (u?.uuid && !uniqueUsers.has(u.uuid)) {
        uniqueUsers.set(u.uuid, u)
      }
    })
    return Array.from(uniqueUsers.values())
  }, [isSuperAdmin, staffUsers, owners])

  // Get all onboardings (approved and rejected)
  // Only fetch if super-admin (admins don't have access to onboarding data)
  // For non-super-admins, we'll just use an empty array
  const { data: onboardingsData } = useOnboardings(
    isSuperAdmin ? undefined : undefined
  )
  const onboardings = isSuperAdmin ? (onboardingsData?.data || []) : []

  // Get pending onboardings (only for super-admin)
  const { data: pendingOnboardingsData } = useOnboardings({ status: 'pending' })
  const pendingOnboardings = isSuperAdmin ? (pendingOnboardingsData?.data || []) : []

  // Get user management activity logs
  // Used for: deactivate, activate, profile update, role change
  // NOTE: Always fetch with same params as audit page to share TanStack Query cache
  // Even though dashboard only renders for super-admin, we need consistent query keys
  const { data: userActivityLogsData } = useActivityLogs({
    "filter[log_name]": "user",
    perPage: 100,
  })
  const userActivityLogs = userActivityLogsData?.data || []

  // Get onboarding activity logs
  // Used for: Staff onboarding (approval, rejection)
  // NOTE: Onboarding activity logs have log_name: "onboarding" (not "user")
  const { data: onboardingActivityLogsData } = useActivityLogs({
    "filter[log_name]": "onboarding",
    perPage: 100,
  })
  const onboardingActivityLogs = onboardingActivityLogsData?.data || []

  // Get role permissions management activity logs
  // Used for: Role permissions management
  const { data: roleActivityLogsData } = useActivityLogs({
    "filter[log_name]": "role",
    perPage: 100,
  })
  const roleActivityLogs = roleActivityLogsData?.data || []

  // Combine all activity logs to ensure complete audit trail integrity
  // This prevents overwriting issues and ensures immutability of all audit data
  const activityLogs = [...userActivityLogs, ...onboardingActivityLogs, ...roleActivityLogs]

  // Calculate stats (only for super-admin)
  const stats = {
    total: totalUsers,
    pending: pendingOnboardings.length,
    approved: onboardings.filter(o => o.status === 'approved').length,
    rejected: onboardings.filter(o => o.status === 'rejected').length,
  }

  // Filter to only show decisions (approved or rejected)
  const decisions = useMemo(() => {
    return onboardings.filter(
      o => o.status === 'approved' || o.status === 'rejected'
    )
  }, [onboardings])

  // Create unified audit entries (onboarding + activity logs)
  // Show both onboarding decisions (from onboardings table) and activity logs
  const auditEntries: AuditEntry[] = useMemo(() => {
    return [
      ...decisions.map(decision => ({ type: 'onboarding' as const, data: decision })),
      ...activityLogs.map(log => ({ type: 'activity_log' as const, data: log })),
    ]
  }, [decisions, activityLogs])

  // Sort by timestamp (most recent first) and take top 5
  const recentActivities = auditEntries
    .sort((a, b) => {
      const timestampA = getAuditEntryTimestamp(a)
      const timestampB = getAuditEntryTimestamp(b)
      return timestampB - timestampA
    })
    .slice(0, 5)

  const getInitials = (name: string) => 
    name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)

  // Wait for auth to load and ensure user exists
  if (isAuthLoading || !user) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    )
  }

  // Show regular user view for staff (non-super-admin)
  if (!isSuperAdmin) {
    return <RegularUserView user={user} />
  }

  // Show super-admin dashboard
  return (
    <div className="space-y-8">
      <DashboardHeader userName={user?.name} />
      <DashboardStatsCards stats={stats} />
      <div className="grid gap-6 lg:grid-cols-3">
        <QuickActionsCard pendingCount={stats.pending} />
        <RecentActivityCard 
          recentActivities={recentActivities}
          getInitials={getInitials}
          users={users}
          activityLogs={activityLogs}
        />
      </div>
    </div>
  )
}

