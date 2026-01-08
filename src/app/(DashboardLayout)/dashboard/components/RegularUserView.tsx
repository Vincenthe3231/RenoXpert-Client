import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle } from "lucide-react"
import { StaffUser } from "@/lib/api/auth"

interface RegularUserViewProps {
  user: StaffUser | null | undefined
}

const RegularUserView = ({ user }: RegularUserViewProps) => {
  return (
    <div className="space-y-6">
      <Card className="max-w-2xl mx-auto shadow-card">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-success/10 flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-success" />
          </div>
          <CardTitle className="text-xl">Welcome to RenoXpert</CardTitle>
          <CardDescription className="text-base mt-2">
            Your access has been approved. You can now use the system.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-muted rounded-lg p-4 space-y-3">
            <h3 className="font-medium text-sm text-muted-foreground">Your Account</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Name:</span>
                <span className="font-medium">{user?.name || "—"}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Email:</span>
                <span className="font-medium">{user?.email || "—"}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Role:</span>
                <Badge variant="secondary">{user?.profile?.roles?.[0] || "Staff"}</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default RegularUserView

