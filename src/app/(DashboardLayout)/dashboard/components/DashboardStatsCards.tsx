import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Clock, CheckCircle, XCircle, TrendingUp } from "lucide-react"

interface DashboardStatsCardsProps {
  stats: {
    total: number
    pending: number
    approved: number
    rejected: number
  }
}

const DashboardStatsCards = ({ stats }: DashboardStatsCardsProps) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="group shadow-card rounded-full transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-xl">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
            <Users className="h-4 w-4 text-primary" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total}</div>
          <p className="text-xs text-muted-foreground mt-1">
            <TrendingUp className="w-3 h-3 inline mr-1" />
            All registered users
          </p>
        </CardContent>
      </Card>

      <Card className="group shadow-card rounded-full transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-xl">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Pending Requests</CardTitle>
          <div className="w-8 h-8 rounded-lg bg-warning/10 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
            <Clock className="h-4 w-4 text-warning" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-warning">{stats.pending}</div>
          <p className="text-xs text-muted-foreground mt-1">Awaiting your review</p>
        </CardContent>
      </Card>

      <Card className="group shadow-card rounded-full transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-xl">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Approved</CardTitle>
          <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
            <CheckCircle className="h-4 w-4 text-success" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-success">{stats.approved}</div>
          <p className="text-xs text-muted-foreground mt-1">Active staff members</p>
        </CardContent>
      </Card>

      <Card className="group shadow-card rounded-full transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-xl">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Rejected</CardTitle>
          <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
            <XCircle className="h-4 w-4 text-destructive" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-destructive">{stats.rejected}</div>
          <p className="text-xs text-muted-foreground mt-1">Declined requests</p>
        </CardContent>
      </Card>
    </div>
  )
}

export default DashboardStatsCards

