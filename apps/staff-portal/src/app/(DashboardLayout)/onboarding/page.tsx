"use client"

import { Skeleton } from "@/components/ui/skeleton";
import { Clock, CheckCircle2, Users, Loader2 } from "lucide-react";
import { Onboarding, useOnboardings } from "@/lib/api/onboarding";
import OnboardingTable from "./OnboardingTable";
import { useState } from "react";
import RejectDialog from "./components/RejectDialog";
import { StaffType, StaffUser } from "@/lib/api/auth";
import ApproveDialog from "./components/ApproveDialog";

const OnboardingPage = () => {
    const { data: onboardingListData, isLoading, error } = useOnboardings();
    const onboardingList = onboardingListData?.data ?? [];

    const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
    const [approveDialogOpen, setApproveDialogOpen] = useState(false);
    const [selectedOnboarding, setSelectedOnboarding] = useState<Onboarding | null>(null);

    const handleRejectClick = (onboardingId: number, userName: string) => {
        setSelectedOnboarding({ id: onboardingId, user: { name: userName } as StaffUser } as Onboarding);
        setRejectDialogOpen(true);
    };

    const handleApproveClick = (onboardingId: number, userName: string) => {
        setSelectedOnboarding({ id: onboardingId, user: { name: userName } as StaffUser } as Onboarding);
        setApproveDialogOpen(true);
    };

    const handleRejectConfirm = (onboardingId: number, reason: string) => {
        // if (selectedUser) {
        //     rejectUser.mutate({ userId: selectedUser.id, reason });
        //     setRejectDialogOpen(false);
        //     setSelectedUser(null);
        // }
        console.log(onboardingId, reason);
    };

    const handleApproveConfirm = (onboardingId: number, staffType: StaffType) => {
        console.log(onboardingId, staffType);
    };

    return (
        <>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-foreground">Pending Approvals</h2>
                        <p className="text-muted-foreground">
                            Review and approve users awaiting verification
                        </p>
                    </div>
                    {/* Count of pending approvals */}
                    {isLoading ? (
                        <div className="flex items-center gap-2 rounded-lg bg-lightmuted/20 px-4 py-2 text-lightmuted">
                            <Loader2 size={18} className="animate-spin" />
                        </div>
                    ) : onboardingList && onboardingList.length > 0 ? (
                        <div className="flex items-center gap-2 rounded-lg bg-lightwarning px-4 py-2 text-warning">
                            <Clock size={18} />
                            <span className="font-medium">{onboardingList.length} pending</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 rounded-lg bg-lightsuccess px-4 py-2 text-success">
                            <CheckCircle2 size={18} />
                            <span className="font-medium">All Caught Up!</span>
                        </div>
                    )}
                </div>

                {/* Table */}
                {isLoading ? (
                    <div className="space-y-3">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <Skeleton key={i} className="h-16 w-full rounded-lg" />
                        ))}
                    </div>
                ) : onboardingList && onboardingList.length > 0 ? (
                    <OnboardingTable onboardingList={onboardingList} handleRejectClick={handleRejectClick} handleApproveClick={handleApproveClick} />
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
                )}
            </div>

            {/* Reject Dialog */}
            {selectedOnboarding && (
                <RejectDialog
                    open={rejectDialogOpen}
                    onOpenChange={setRejectDialogOpen}
                    onReject={handleRejectConfirm}
                    userName={selectedOnboarding.user?.name || ""}
                    onboardingId={selectedOnboarding.id as number}
                />
            )}

            {/* Approve Dialog */}
            {selectedOnboarding && (
                <ApproveDialog
                    open={approveDialogOpen}
                    onOpenChange={setApproveDialogOpen}
                    onApprove={handleApproveConfirm}
                    userName={selectedOnboarding.user?.name || ""}
                    onboardingId={selectedOnboarding.id as number}
                />
            )}
        </>
    )
}

export default OnboardingPage;