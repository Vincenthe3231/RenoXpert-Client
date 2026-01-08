"use client"

import { useOnboardings } from "@/lib/api/onboarding"
import { useUsers } from "@/lib/api/auth"
import AuditHeader from "./components/AuditHeader"
import AuditStatsCards from "./components/AuditStatsCards"
import AuditTable from "./AuditTable"

export default function AuditPage() {
  // Get all onboardings (approved and rejected)
  const { data: onboardingsData, isLoading } = useOnboardings()
  const onboardings = onboardingsData?.data || []

  // Get all users for additional context
  const { data: usersData } = useUsers()
  const users = usersData?.data || []

  // Filter to only show decisions (approved or rejected)
  const decisions = onboardings
    .filter(o => o.status === 'approved' || o.status === 'rejected')
    .sort((a, b) => {
      const dateA = a.reviewedAt ? new Date(a.reviewedAt).getTime() : 0
      const dateB = b.reviewedAt ? new Date(b.reviewedAt).getTime() : 0
      return dateB - dateA
    })

  // Create a map of users by ID for quick lookup
  const userMap = new Map(users.map(u => [u.uuid, u]))

  // Find reviewer names (assuming reviewedBy is a user ID)
  const getReviewerName = (reviewedBy: number | null | undefined) => {
    if (!reviewedBy) return "System"
    // You may need to adjust this based on your actual data structure
    // This is a placeholder - you might need to fetch reviewer info separately
    return "Admin" // Placeholder
  }

  const getInitials = (name: string) => 
    name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)

  const approvedCount = decisions.filter(d => d.status === "approved").length
  const rejectedCount = decisions.filter(d => d.status === "rejected").length

  return (
    <div className="space-y-6">
      <AuditHeader />
      <AuditStatsCards 
        totalDecisions={decisions.length}
        approvedCount={approvedCount}
        rejectedCount={rejectedCount}
      />
      <AuditTable 
        decisions={decisions}
        isLoading={isLoading}
        getReviewerName={getReviewerName}
        getInitials={getInitials}
      />
    </div>
  )
}

