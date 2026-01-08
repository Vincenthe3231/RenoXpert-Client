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

  // Get all users for stats
  const { data: usersData } = useUsers()
  const totalUsers = usersData?.meta?.total || 0

  // Get all onboardings for stats
  const { data: allOnboardingsData } = useOnboardings()
  const allOnboardings = allOnboardingsData?.data || []

  // Get pending onboardings
  const { data: pendingOnboardingsData } = useOnboardings({ status: 'pending' })
  const pendingOnboardings = pendingOnboardingsData?.data || []

  // Calculate stats
  const stats = {
    total: totalUsers,
    pending: pendingOnboardings.length,
    approved: allOnboardings.filter(o => o.status === 'approved').length,
    rejected: allOnboardings.filter(o => o.status === 'rejected').length,
  }

  // Get recent decisions (approved or rejected, sorted by reviewedAt)
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

  // Check if user is super admin (you may need to adjust this based on your role system)
  const isSuperAdmin = user?.profile?.roles?.includes('Super Admin') || user?.profile?.roles?.includes('super-admin')

  // Regular user dashboard
  if (!isSuperAdmin) {
    return <RegularUserView user={user} />
  }

  // Super Admin Dashboard
  if (isAuthLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    )
  }

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

