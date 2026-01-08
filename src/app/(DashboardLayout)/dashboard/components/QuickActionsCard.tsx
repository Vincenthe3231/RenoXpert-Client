import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { UserPlus, History, ArrowRight } from "lucide-react"
import Link from "next/link"

interface QuickActionsCardProps {
  pendingCount: number
}

const QuickActionsCard = ({ pendingCount }: QuickActionsCardProps) => {
  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="text-lg">Quick Actions</CardTitle>
        <CardDescription>Manage staff onboarding</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Link href="/onboarding" className="block">
          <Button variant="outline" className="w-full justify-between group">
            <span className="flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-primary" />
              Review Pending Requests
            </span>
            <span className="flex items-center gap-2">
              {pendingCount > 0 ? (
                <Badge variant="secondary" className="bg-warning/10 text-warning">
                  {pendingCount}
                </Badge>
              ) : null}
              <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </span>
          </Button>
        </Link>
        <Link href="/audit" className="block">
          <Button variant="outline" className="w-full justify-between group">
            <span className="flex items-center gap-2">
              <History className="w-4 h-4 text-primary" />
              View Decision History
            </span>
            <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}

export default QuickActionsCard

