import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Clock, XCircle, Ban, AlertCircle } from "lucide-react"
import { User, UserStatus, StaffUser } from "@/lib/api/auth"
import RoleBadge from "@/app/(DashboardLayout)/users/components/RoleBadge"
import UserStatusBadge from "@/app/(DashboardLayout)/users/components/UserStatusBadge"

interface RegularUserViewProps {
  user: User | null | undefined
}

const RegularUserView = ({ user }: RegularUserViewProps) => {
  const status = user?.status || 'verifying'
  
  // Status configuration for dynamic display
  const statusConfig: Record<
    UserStatus,
    {
      icon: React.ReactNode
      iconBg: string
      iconColor: string
      title: string
      description: string
    }
  > = {
    active: {
      icon: <CheckCircle className="w-8 h-8 text-success" />,
      iconBg: "bg-success/10",
      iconColor: "text-success",
      title: "Welcome to RenoXpert",
      description: "Your access has been approved. You can now use the system.",
    },
    verifying: {
      icon: <Clock className="w-8 h-8 text-warning" />,
      iconBg: "bg-warning/10",
      iconColor: "text-warning",
      title: "Account Verification",
      description: "Your account is currently under verification by an administrator. You will be notified once verification is complete.",
    },
    deactivated: {
      icon: <Ban className="w-8 h-8 text-purple-500" />,
      iconBg: "bg-purple-500/10",
      iconColor: "text-purple-500",
      title: "Account Deactivated",
      description: "Your account has been deactivated. Please contact your system administrator for assistance.",
    },
    rejected: {
      icon: <XCircle className="w-8 h-8 text-destructive" />,
      iconBg: "bg-destructive/10",
      iconColor: "text-destructive",
      title: "Account Access Denied",
      description: "Your account access has been rejected.",
    },
  }

  const config = statusConfig[status]

  // Determine role based on userType
  const getUserRole = (): string => {
    if (!user) return "Staff"
    
    // For staff users, use profile.roles
    if (user.userType === 'staff' && 'profile' in user && 'roles' in user.profile) {
      const roles = (user as StaffUser).profile.roles || []
      return roles[0] || "Staff"
    }
    
    // For owners and vendors, use userType (capitalize first letter)
    if (user.userType === 'owner' || user.userType === 'vendor') {
      return user.userType.charAt(0).toUpperCase() + user.userType.slice(1)
    }
    
    return "Staff"
  }

  return (
    <div className="space-y-6">
      <Card className="max-w-2xl mx-auto shadow-card rounded-full">
        <CardHeader className="text-center">
          <div className={`mx-auto mb-4 w-16 h-16 rounded-full ${config.iconBg} flex items-center justify-center`}>
            {config.icon}
          </div>
          <CardTitle className="text-xl">{config.title}</CardTitle>
          <CardDescription className="text-base mt-2">
            {config.description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-muted rounded-lg p-4 space-y-3">
            <h3 className="font-medium text-sm text-muted-foreground">Your Account</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Name:</span>
                <span className="font-medium text-foreground">{user?.name || "—"}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Email:</span>
                <span className="font-medium text-foreground">{user?.email || "—"}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Role:</span>
                <RoleBadge role={getUserRole()} />
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Status:</span>
                <UserStatusBadge status={status} />
              </div>
            </div>
          </div>
          
          {/* Display rejection reason for rejected users */}
          {status === 'rejected' && (user as any)?.rejectionReason && (
            <div className="mt-4 p-4 rounded-lg bg-destructive/10 border border-destructive/20">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-destructive">Rejection Reason</p>
                  <p className="text-sm text-foreground whitespace-pre-wrap">
                    {(user as any).rejectionReason}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default RegularUserView

