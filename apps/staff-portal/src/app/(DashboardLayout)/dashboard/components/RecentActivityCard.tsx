"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Clock, CheckCircle2, XCircle, ExternalLink, ArrowRight, UserX, UserCheck, UserCog, UserPen } from "lucide-react"
import { format, formatDistanceToNow, isToday, isYesterday } from "date-fns"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { AuditEntry } from "@/app/(DashboardLayout)/audit/types"
import { User } from "@/lib/api/auth"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import RoleBadge from "@/app/(DashboardLayout)/users/components/RoleBadge"
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table"

interface RecentActivityCardProps {
  recentActivities: AuditEntry[]
  getInitials: (name: string) => string
  users: User[]
}

const RecentActivityCard = ({ recentActivities, getInitials, users }: RecentActivityCardProps) => {
  const router = useRouter()
  
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
      <CardHeader className="flex flex-row items-center justify-between border-b border-border pb-4 px-6 pt-6">
        <div>
          <CardTitle className="text-lg font-semibold leading-tight">Recent Activity</CardTitle>
          <CardDescription className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
            Latest onboarding decisions and user management activities
          </CardDescription>
        </div>
        <Link href="/audit">
          <Button 
            variant="ghost" 
            size="sm"
            className="text-primary hover:text-primary hover:bg-primary/10 h-9 px-3"
          >
            <span className="text-sm font-medium">View All</span>
            <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="pt-4 px-4 pb-4">
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
          <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
            <Table>
              <TableBody>
                {recentActivities.map((entry, index) => {
                  const activityConfig = getActivityConfig(entry)
                  const ActivityIcon = activityConfig.icon
                  const user = getUserFromEntry(entry)
                  const timestamp = getTimestamp(entry)
                  
                  return (
                    <TableRow
                      key={entry.type === 'onboarding' ? `onboarding-${entry.data.id}` : `activity-log-${entry.data.id}`}
                      className={cn(
                        "group transition-all duration-200 ease-in-out cursor-pointer animate-fade-in",
                        "hover:bg-muted/50 hover:-translate-y-0.5"
                      )}
                      style={{ animationDelay: `${index * 50}ms` }}
                      onClick={() => router.push('/audit')}
                    >
                      {/* Name Cell - matches UserTable structure */}
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="relative flex-shrink-0">
                            <Avatar className="h-10 w-10 ring-2 ring-background transition-all duration-200 group-hover:ring-primary/20">
                              <AvatarImage 
                                src={
                                  user?.profile && 'avatarUrl' in user.profile 
                                    ? user.profile.avatarUrl || undefined 
                                    : undefined
                                } 
                                className="object-cover"
                              />
                              <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold border-2 border-background">
                                {user?.name ? getInitials(user.name) : "??"}
                              </AvatarFallback>
                            </Avatar>
                            {/* Status indicator dot */}
                            <div className={cn(
                              "absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-background flex items-center justify-center",
                              activityConfig.iconClassName.includes('green') && "bg-green-500",
                              activityConfig.iconClassName.includes('red') && "bg-red-500",
                              activityConfig.iconClassName.includes('blue') && "bg-blue-500",
                              activityConfig.iconClassName.includes('purple') && "bg-purple-500",
                            )}>
                              <ActivityIcon className={cn("h-2 w-2 text-white")} />
                            </div>
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{user?.name || "Unknown User"}</p>
                            <p className="text-xs text-muted-foreground">{user?.email || "No email"}</p>
                            {entry.type === 'onboarding' && entry.data.rejectionReason && (
                              <p className="text-xs text-muted-foreground/80 mt-0.5 line-clamp-1 italic">
                                "{entry.data.rejectionReason}"
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>

                      {/* Role Cell - separate cell like UserTable */}
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {entry.type === 'onboarding' && entry.data.assignedUserType && user?.userType === "staff" && (
                            <RoleBadge role={entry.data.assignedUserType} />
                          )}
                        </div>
                      </TableCell>

                      {/* Activity Type Cell - separate cell */}
                      <TableCell>
                        <Badge variant="outline" className="text-xs px-1.5 py-0.5 h-5">
                          {activityConfig.typeLabel}
                        </Badge>
                      </TableCell>

                      {/* Status Cell - matches UserTable structure */}
                      <TableCell>
                        <Badge 
                          variant="outline"
                          className={`gap-1 px-2.5 py-1 h-7 ${activityConfig.className}`}
                        >
                          <ActivityIcon size={12} />
                          <span className="text-xs font-medium">{activityConfig.label}</span>
                        </Badge>
                      </TableCell>
                      
                      {/* Date Cell - matches UserTable structure */}
                      <TableCell>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground whitespace-nowrap">
                            {formatReviewDate(timestamp)}
                          </p>
                          {timestamp && !isToday(new Date(timestamp)) && !isYesterday(new Date(timestamp)) && (
                            <p className="text-xs text-muted-foreground/60 mt-0.5 whitespace-nowrap">
                              {formatDistanceToNow(new Date(timestamp), { addSuffix: true })}
                            </p>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default RecentActivityCard
