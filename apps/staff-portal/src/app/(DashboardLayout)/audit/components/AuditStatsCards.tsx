import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle, XCircle, History, Activity } from "lucide-react"

interface AuditStatsCardsProps {
  totalDecisions: number
  approvedCount: number
  rejectedCount: number
  activityLogCount: number
  totalEntries: number
}

const AuditStatsCards = ({ 
  totalDecisions, 
  approvedCount, 
  rejectedCount,
  activityLogCount,
  totalEntries 
}: AuditStatsCardsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      <Card className="group shadow-card rounded-full transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-xl">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
              <History className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalEntries}</p>
              <p className="text-sm text-muted-foreground">Total Entries</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="group shadow-card rounded-full transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-xl">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
              <Activity className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{activityLogCount}</p>
              <p className="text-sm text-muted-foreground">User Activities</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="group shadow-card rounded-full transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-xl">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
              <History className="w-6 h-6 text-purple-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalDecisions}</p>
              <p className="text-sm text-muted-foreground">Onboarding Decisions</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="group shadow-card rounded-full transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-xl">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
              <CheckCircle className="w-6 h-6 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold">{approvedCount}</p>
              <p className="text-sm text-muted-foreground">Approved</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="group shadow-card rounded-full transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-xl">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
              <XCircle className="w-6 h-6 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold">{rejectedCount}</p>
              <p className="text-sm text-muted-foreground">Rejected</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default AuditStatsCards

