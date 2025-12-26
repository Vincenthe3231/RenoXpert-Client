
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, CheckCircle2, Users } from "lucide-react";

const OnboardingPage = () => {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-foreground">Pending Approvals</h2>
                    <p className="text-muted-foreground">
                        Review and approve users awaiting verification
                    </p>
                </div>
                <div className="flex items-center gap-2 rounded-lg bg-lightwarning px-4 py-2 text-warning">
                    <Clock size={18} />
                    {/* <span className="font-medium">{verifyingUsers?.length || 0} pending</span> */}
                    <span className="font-medium">{0} pending</span>
                </div>
            </div>

            {/* Table */}
            {/* {isLoading ? (
                <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton key={i} className="h-16 w-full rounded-lg" />
                    ))}
                </div>
            ) : verifyingUsers && verifyingUsers.length > 0 ? (
                <div className="rounded-xl border bg-card shadow-card">
                    <OnboardingTable />
                </div>
            ) : (
                <div className="rounded-xl bg-card p-12 text-center shadow-card">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success-light">
                        <CheckCircle2 size={32} className="text-success" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">All Caught Up!</h3>
                    <p className="mt-2 text-muted-foreground">
                        There are no users pending verification at the moment.
                    </p>
                </div>
            )} */}
            <div className="rounded-xl bg-card p-12 text-center shadow-card">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success-light">
                    <CheckCircle2 size={32} className="text-success" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">All Caught Up!</h3>
                <p className="mt-2 text-muted-foreground">
                    There are no users pending verification at the moment.
                </p>
            </div>
        </div>
    )
}

export default OnboardingPage;