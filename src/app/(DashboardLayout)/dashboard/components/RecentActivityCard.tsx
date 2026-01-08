"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Clock, CheckCircle2, XCircle, ExternalLink, ArrowRight } from "lucide-react"
import { format, formatDistanceToNow, isToday, isYesterday } from "date-fns"
import Link from "next/link"
import { Onboarding } from "@/lib/api/onboarding"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import RoleBadge from "@/app/(DashboardLayout)/users/components/RoleBadge"

interface RecentActivityCardProps {
  recentDecisions: Onboarding[]
  getInitials: (name: string) => string
}

const RecentActivityCard = ({ recentDecisions, getInitials }: RecentActivityCardProps) => {
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

  const getStatusConfig = (status: string | null | undefined) => {
    if (status === "approved") {
      return {
        icon: CheckCircle2,
        label: "Approved",
        className: "bg-green-50 text-green-700 border-green-200 hover:bg-green-100",
        iconClassName: "text-green-600",
      }
    } else if (status === "rejected") {
      return {
        icon: XCircle,
        label: "Rejected",
        className: "bg-red-50 text-red-700 border-red-200 hover:bg-red-100",
        iconClassName: "text-red-600",
      }
    }
    return {
      icon: Clock,
      label: "Pending",
      className: "bg-gray-50 text-gray-700 border-gray-200",
      iconClassName: "text-gray-600",
    }
  }

  return (
    <Card className="shadow-card lg:col-span-2 rounded-full transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-xl">
      <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
        <div>
          <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
          <CardDescription className="text-sm text-muted-foreground mt-1">
            Latest onboarding decisions
          </CardDescription>
        </div>
        <Link href="/audit">
          <Button 
            variant="ghost" 
            size="sm"
            className="text-primary hover:text-primary hover:bg-primary/10"
          >
            View All
            <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="pt-6">
        {recentDecisions.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12 text-muted-foreground"
          >
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted/50">
              <Clock className="w-8 h-8 opacity-50" />
            </div>
            <p className="text-sm font-medium">No recent decisions</p>
            <p className="text-xs mt-1 text-muted-foreground/80">
              Approved and rejected requests will appear here
            </p>
          </motion.div>
        ) : (
          <div className="space-y-0 divide-y divide-border/60">
            {recentDecisions.map((decision, index) => {
              const statusConfig = getStatusConfig(decision.status)
              const StatusIcon = statusConfig.icon
              const isStaff = decision.user?.userType === "staff"
              const assignedRole = decision.assignedUserType
              
              return (
                <motion.div
                  key={decision.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="group relative"
                >
                  <Link 
                    href="/audit" 
                    className="block border border-transparent bg-transparent px-4 py-5 transition-all duration-200 hover:bg-muted/30 hover:-translate-y-0.5 hover:shadow-sm first:pt-0 last:pb-0"
                  >
                    <div className="flex items-center justify-between gap-6">
                      {/* Left: Avatar & User Info */}
                      <div className="flex items-center gap-4 min-w-0 flex-1">
                        <div className="relative flex-shrink-0">
                          <Avatar className="h-11 w-11 ring-2 ring-background transition-all duration-200 group-hover:ring-primary/20">
                            <AvatarImage 
                              src={
                                decision.user?.profile && 'avatarUrl' in decision.user.profile 
                                  ? decision.user.profile.avatarUrl || undefined 
                                  : undefined
                              } 
                              className="object-cover"
                            />
                            <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium border-2 border-background">
                              {decision.user?.name ? getInitials(decision.user.name) : "??"}
                            </AvatarFallback>
                          </Avatar>
                          {/* Status indicator dot */}
                          <div className={cn(
                            "absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full border-2 border-background flex items-center justify-center",
                            decision.status === "approved" && "bg-green-500",
                            decision.status === "rejected" && "bg-red-500",
                          )}>
                            <StatusIcon className={cn("h-2.5 w-2.5", statusConfig.iconClassName)} />
                          </div>
                        </div>
                        
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2.5 mb-1.5">
                            <p className="text-sm font-semibold text-foreground truncate">
                              {decision.user?.name || "Unknown User"}
                            </p>
                            {assignedRole && isStaff && (
                              <RoleBadge role={assignedRole} />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground truncate">
                            {decision.user?.email || "No email"}
                          </p>
                          {decision.rejectionReason && (
                            <p className="text-xs text-muted-foreground/80 mt-1.5 line-clamp-1 italic">
                              "{decision.rejectionReason}"
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Right: Status Badge & Date */}
                      <div className="flex items-center gap-4 flex-shrink-0">
                        <Badge 
                          variant="outline"
                          className={`gap-1 ${statusConfig.className}`}
                        >
                          <StatusIcon size={12} />
                          {statusConfig.label}
                        </Badge>
                        
                        <div className="text-right">
                          <p className="text-xs font-medium text-muted-foreground whitespace-nowrap">
                            {formatReviewDate(decision.reviewedAt)}
                          </p>
                          {decision.reviewedAt && !isToday(new Date(decision.reviewedAt)) && !isYesterday(new Date(decision.reviewedAt)) && (
                            <p className="text-xs text-muted-foreground/60 mt-0.5 whitespace-nowrap">
                              {formatDistanceToNow(new Date(decision.reviewedAt), { addSuffix: true })}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default RecentActivityCard
