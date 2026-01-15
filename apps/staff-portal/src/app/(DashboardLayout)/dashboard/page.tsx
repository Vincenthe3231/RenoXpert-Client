"use client"

import { useAuth, useUsers } from "@/lib/api/auth"
import { useOnboardings } from "@/lib/api/onboarding"
import { Loader2 } from "lucide-react"
import DashboardHeader from "./components/DashboardHeader"
import DashboardStatsCards from "./components/DashboardStatsCards"
import QuickActionsCard from "./components/QuickActionsCard"
import RecentActivityCard from "./components/RecentActivityCard"
import RegularUserView from "./components/RegularUserView"

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

  // Get all users for stats (only for super-admin)
  const { data: usersData } = useUsers()
  const totalUsers = isSuperAdmin ? (usersData?.meta?.total || 0) : 0

  // Get all onboardings for stats (only for super-admin)
  const { data: allOnboardingsData } = useOnboardings()
  const allOnboardings = isSuperAdmin ? (allOnboardingsData?.data || []) : []

  // Get pending onboardings (only for super-admin)
  const { data: pendingOnboardingsData } = useOnboardings({ status: 'pending' })
  const pendingOnboardings = isSuperAdmin ? (pendingOnboardingsData?.data || []) : []

  // Calculate stats (only for super-admin)
  const stats = {
    total: totalUsers,
    pending: pendingOnboardings.length,
    approved: allOnboardings.filter(o => o.status === 'approved').length,
    rejected: allOnboardings.filter(o => o.status === 'rejected').length,
  }

  // Get recent decisions (only for super-admin)
  const recentDecisions = allOnboardings
    .filter(o => o.status === 'approved' || o.status === 'rejected')
    .sort((a, b) => {
      const dateA = a.reviewedAt ? new Date(a.reviewedAt).getTime() : 0
      const dateB = b.reviewedAt ? new Date(b.reviewedAt).getTime() : 0
      return dateB - dateA
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
          recentDecisions={recentDecisions}
          getInitials={getInitials}
        />
      </div>
    </div>
  )
}

