import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CheckCircle, XCircle, History, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { Onboarding } from "@/lib/api/onboarding"
import AuditEmptyState from "./components/AuditEmptyState"

interface AuditTableProps {
  decisions: Onboarding[]
  isLoading: boolean
  getReviewerName: (reviewedBy: number | null | undefined) => string
  getInitials: (name: string) => string
}

const AuditTable = ({ decisions, isLoading, getReviewerName, getInitials }: AuditTableProps) => {
  return (
    <Card className="shadow-card rounded-full transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="w-5 h-5" />
          Decision History & Audit Trail
        </CardTitle>
        <CardDescription>Complete record of all onboarding decisions with created and updated timestamps</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : decisions.length === 0 ? (
          <AuditEmptyState />
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Staff Member</TableHead>
                  <TableHead>Decision</TableHead>
                  <TableHead>Role Assigned</TableHead>
                  <TableHead>Decided By</TableHead>
                  <TableHead>Created Date</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead>Decision Date</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {decisions.map((decision) => (
                  <TableRow 
                    key={decision.id}
                    className="transition-all duration-200 ease-in-out hover:bg-muted/50 hover:-translate-y-0.5 cursor-pointer"
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage 
                            src={
                              decision.user?.profile && 'avatarUrl' in decision.user.profile 
                                ? decision.user.profile.avatarUrl || undefined 
                                : undefined
                            } 
                          />
                          <AvatarFallback className="bg-primary/10 text-primary text-xs">
                            {decision.user?.name ? getInitials(decision.user.name) : "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">{decision.user?.name || "Unknown"}</p>
                          <p className="text-xs text-muted-foreground">{decision.user?.email || "—"}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {decision.status === "approved" ? (
                        <Badge 
                          variant="outline"
                          className="gap-1 bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                        >
                          <CheckCircle size={12} />
                          Approved
                        </Badge>
                      ) : (
                        <Badge 
                          variant="outline"
                          className="gap-1 bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                        >
                          <XCircle size={12} />
                          Rejected
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {decision.assignedUserType ? (
                        <Badge variant="outline" className="capitalize">{decision.assignedUserType}</Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{getReviewerName(decision.reviewedBy)}</span>
                    </TableCell>
                    <TableCell>
                      {decision.createdAt ? (
                        <div className="text-sm">
                          <p>{format(new Date(decision.createdAt), "MMM d, yyyy")}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(decision.createdAt), "h:mm a")}
                          </p>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {decision.updatedAt ? (
                        <div className="text-sm">
                          <p>{format(new Date(decision.updatedAt), "MMM d, yyyy")}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(decision.updatedAt), "h:mm a")}
                          </p>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {decision.reviewedAt ? (
                        <div className="text-sm">
                          <p>{format(new Date(decision.reviewedAt), "MMM d, yyyy")}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(decision.reviewedAt), "h:mm a")}
                          </p>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground max-w-[200px] truncate block">
                        {decision.rejectionReason || "—"}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default AuditTable

