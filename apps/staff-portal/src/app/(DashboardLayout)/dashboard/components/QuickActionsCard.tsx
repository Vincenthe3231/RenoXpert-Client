import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { UserPlus, History, ArrowRight, Users, Building2, Building } from "lucide-react"
import Link from "next/link"

interface QuickActionsCardProps {
  pendingCount: number
}

const QuickActionsCard = ({ pendingCount }: QuickActionsCardProps) => {
  return (
    <Card className="shadow-card rounded-full transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-xl">
      <CardHeader>
        <CardTitle className="text-lg">Quick Actions</CardTitle>
        <CardDescription>Manage staff onboarding</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Link href="/onboarding" className="block">
          <Button variant="outline" className="w-full justify-between group transition-all duration-200 hover:shadow-md">
            <span className="flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-primary transition-transform duration-200 group-hover:scale-110" />
              Review Pending Requests
            </span>
            <span className="flex items-center gap-2">
              {pendingCount > 0 ? (
                <Badge variant="secondary" className="bg-warning/10 text-warning">
                  {pendingCount}
                </Badge>
              ) : null}
              <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200" />
            </span>
          </Button>
        </Link>
        <Link href="/audit" className="block">
          <Button variant="outline" className="w-full justify-between group transition-all duration-200 hover:shadow-md">
            <span className="flex items-center gap-2">
              <History className="w-4 h-4 text-primary transition-transform duration-200 group-hover:scale-110" />
              View Decision History
            </span>
            <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200" />
          </Button>
        </Link>
        <Link href="/users" className="block">
          <Button variant="outline" className="w-full justify-between group transition-all duration-200 hover:shadow-md">
            <span className="flex items-center gap-2">
              <Users className="w-4 h-4 text-primary transition-transform duration-200 group-hover:scale-110" />
              Manage Users
            </span>
            <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200" />
          </Button>
        </Link>
        <Link href="/departments" className="block">
          <Button variant="outline" className="w-full justify-between group transition-all duration-200 hover:shadow-md">
            <span className="flex items-center gap-2">
              <Building className="w-4 h-4 text-primary transition-transform duration-200 group-hover:scale-110" />
              Manage Departments
            </span>
            <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200" />
          </Button>
        </Link>
        <Link href="/onboarding?action=add-department" className="block">
          <Button variant="outline" className="w-full justify-between group transition-all duration-200 hover:shadow-md">
            <span className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-primary transition-transform duration-200 group-hover:scale-110" />
              Add New Department
            </span>
            <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}

export default QuickActionsCard

