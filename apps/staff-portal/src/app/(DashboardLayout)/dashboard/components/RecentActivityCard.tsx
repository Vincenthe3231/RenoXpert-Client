"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Clock, CheckCircle2, XCircle, ExternalLink, ArrowRight, UserX, UserCheck, UserCog, UserPen } from "lucide-react"
import { format, formatDistanceToNow, isToday, isYesterday } from "date-fns"
import Link from "next/link"
import { AuditEntry } from "@/app/(DashboardLayout)/audit/types"
import { User } from "@/lib/api/auth"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import RoleBadge from "@/app/(DashboardLayout)/users/components/RoleBadge"

interface RecentActivityCardProps {
  recentActivities: AuditEntry[]
  getInitials: (name: string) => string
  users: User[]
}

const RecentActivityCard = ({ recentActivities, getInitials, users }: RecentActivityCardProps) => {
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

  // Helper to get user from entry
  const getUserFromEntry = (entry: AuditEntry) => {
    if (entry.type === 'onboarding') {
      return entry.data.user
    } else {
      const log = entry.data
      if (log.subject) {
        return log.subject
      }
      if (log.subjectId) {
        return users.find(u => u.id === log.subjectId) || null
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
      <CardHeader className="flex flex-row items-center justify-between border-b border-border pb-4">
        <div>
          <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
          <CardDescription className="text-sm text-muted-foreground mt-1">
            Latest onboarding decisions and user management activities
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
        {recentActivities.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12 text-muted-foreground"
          >
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted/50">
              <Clock className="w-8 h-8 opacity-50" />
            </div>
            <p className="text-sm font-medium">No recent activity</p>
            <p className="text-xs mt-1 text-muted-foreground/80">
              Onboarding decisions and user management activities will appear here
            </p>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {recentActivities.map((entry, index) => {
              const activityConfig = getActivityConfig(entry)
              const ActivityIcon = activityConfig.icon
              const user = getUserFromEntry(entry)
              const timestamp = getTimestamp(entry)
              
              return (
                <motion.div
                  key={entry.type === 'onboarding' ? `onboarding-${entry.data.id}` : `activity-log-${entry.data.id}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="group relative"
                >
                  <Link 
                    href="/audit" 
                    className="block border border-border/40 rounded-lg bg-card/50 px-5 py-4 transition-all duration-200 hover:bg-muted/40 hover:border-border hover:-translate-y-0.5 hover:shadow-sm"
                  >
                    <div className="flex items-center justify-between gap-6">
                      {/* Left: Avatar & User Info */}
                      <div className="flex items-center gap-4 min-w-0 flex-1">
                        <div className="relative flex-shrink-0">
                          <Avatar className="h-11 w-11 ring-2 ring-background transition-all duration-200 group-hover:ring-primary/20">
                            <AvatarImage 
                              src={
                                user?.profile && 'avatarUrl' in user.profile 
                                  ? user.profile.avatarUrl || undefined 
                                  : undefined
                              } 
                              className="object-cover"
                            />
                            <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium border-2 border-background">
                              {user?.name ? getInitials(user.name) : "??"}
                            </AvatarFallback>
                          </Avatar>
                          {/* Status indicator dot */}
                          <div className={cn(
                            "absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full border-2 border-background flex items-center justify-center",
                            activityConfig.iconClassName.includes('green') && "bg-green-500",
                            activityConfig.iconClassName.includes('red') && "bg-red-500",
                            activityConfig.iconClassName.includes('blue') && "bg-blue-500",
                            activityConfig.iconClassName.includes('purple') && "bg-purple-500",
                          )}>
                            <ActivityIcon className={cn("h-2.5 w-2.5", activityConfig.iconClassName)} />
                          </div>
                        </div>
                        
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2.5 mb-1.5">
                            <p className="text-sm font-semibold text-foreground truncate">
                              {user?.name || "Unknown User"}
                            </p>
                            {entry.type === 'onboarding' && entry.data.assignedUserType && user?.userType === "staff" && (
                              <RoleBadge role={entry.data.assignedUserType} />
                            )}
                            <Badge variant="outline" className="text-xs">
                              {activityConfig.typeLabel}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground truncate">
                            {user?.email || "No email"}
                          </p>
                          {entry.type === 'onboarding' && entry.data.rejectionReason && (
                            <p className="text-xs text-muted-foreground/80 mt-1.5 line-clamp-1 italic">
                              "{entry.data.rejectionReason}"
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Right: Status Badge & Date */}
                      <div className="flex items-center gap-4 flex-shrink-0">
                        <Badge 
                          variant="outline"
                          className={`gap-1 ${activityConfig.className}`}
                        >
                          <ActivityIcon size={12} />
                          {activityConfig.label}
                        </Badge>
                        
                        <div className="text-right">
                          <p className="text-xs font-medium text-muted-foreground whitespace-nowrap">
                            {formatReviewDate(timestamp)}
                          </p>
                          {timestamp && !isToday(new Date(timestamp)) && !isYesterday(new Date(timestamp)) && (
                            <p className="text-xs text-muted-foreground/60 mt-0.5 whitespace-nowrap">
                              {formatDistanceToNow(new Date(timestamp), { addSuffix: true })}
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
