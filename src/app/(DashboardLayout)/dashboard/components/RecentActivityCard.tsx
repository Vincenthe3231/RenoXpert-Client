import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Clock } from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"
import { Onboarding } from "@/lib/api/onboarding"

interface RecentActivityCardProps {
  recentDecisions: Onboarding[]
  getInitials: (name: string) => string
}

const RecentActivityCard = ({ recentDecisions, getInitials }: RecentActivityCardProps) => {
  return (
    <Card className="shadow-card lg:col-span-2">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-lg">Recent Activity</CardTitle>
          <CardDescription>Latest onboarding decisions</CardDescription>
        </div>
        <Link href="/audit">
          <Button variant="ghost" size="sm">View All</Button>
        </Link>
      </CardHeader>
      <CardContent>
        {recentDecisions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No recent decisions</p>
          </div>
        ) : (
          <div className="space-y-4">
            {recentDecisions.map((decision) => (
              <div key={decision.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarImage 
                      src={
                        decision.user?.profile && 'avatarUrl' in decision.user.profile 
                          ? decision.user.profile.avatarUrl || undefined 
                          : undefined
                      } 
                    />
                    <AvatarFallback className="bg-primary/10 text-primary text-sm">
                      {decision.user?.name ? getInitials(decision.user.name) : "??"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{decision.user?.name || "Unknown"}</p>
                    <p className="text-xs text-muted-foreground">{decision.user?.email || ""}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-right">
                  <Badge 
                    variant="secondary"
                    className={decision.status === "approved" 
                      ? "bg-success/10 text-success" 
                      : "bg-destructive/10 text-destructive"
                    }
                  >
                    {decision.status === "approved" ? "Approved" : "Rejected"}
                  </Badge>
                  {decision.reviewedAt && (
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {format(new Date(decision.reviewedAt), "MMM d")}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default RecentActivityCard

