import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody, TableRow, TableHeader, TableHead, TableCell } from "@/components/ui/table"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { CheckCircle2, XCircle } from "lucide-react"
import { Onboarding } from "@/lib/api/onboarding"
import { StaffUser } from "@/lib/api/auth"


interface OnboardingTableProps {
    onboardingList: Onboarding[]
    handleRejectClick: (onboardingId: number, userName: string) => void
    handleApproveClick: (onboardingId: number, userName: string) => void
}

const OnboardingTable = ({ onboardingList, handleRejectClick, handleApproveClick }: OnboardingTableProps) => {
    return (
        <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow className="bg-muted/5 hover:bg-muted/10">
                        <TableHead>User</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Applied</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {onboardingList.map((onboarding) => (
                        <TableRow key={onboarding.id}>
                            <TableCell>
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={(onboarding.user as StaffUser)?.profile?.avatarUrl || undefined} />
                                        <AvatarFallback className="text-xs">
                                            {onboarding.user?.name.split(" ").map((n) => n[0]).join("").toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-medium text-foreground">{onboarding.user?.name}</p>
                                        <p className="text-sm text-muted-foreground">{onboarding.user?.email}</p>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell className="capitalize">{(onboarding.user as StaffUser)?.userType}</TableCell>
                            <TableCell>
                                {format(new Date(onboarding.createdAt || ""), "h:mmaaa").toLowerCase()} - {format(new Date(onboarding.createdAt || ""), "dd MMM yyyy")}
                            </TableCell>
                            <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                    <Button
                                        size="sm"
                                        variant="outlinesuccess"
                                        className="text-success hover:bg-lightsuccess hover:text-success"
                                        onClick={() => handleApproveClick(onboarding.id as number, onboarding.user?.name || "")}
                                    // disabled={approveUser.isPending}
                                    >
                                        <CheckCircle2 size={16} className="mr-1" />
                                        Approve
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outlineerror"
                                        className="text-error hover:bg-lighterror hover:text-error"
                                        onClick={() => handleRejectClick(onboarding.id as number, onboarding.user?.name || "")}
                                    // disabled={rejectOnboarding.isPending}
                                    >
                                        <XCircle size={16} className="mr-1" />
                                        Reject
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}

export default OnboardingTable