"use client"

import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Clock, CheckCircle2, Loader2 } from "lucide-react";
import { Onboarding, useOnboardings } from "@/lib/api/onboarding";
import OnboardingTable from "./OnboardingTable";
import { useState, useEffect } from "react";
import RejectDialog from "./components/RejectDialog";
import { StaffType, StaffUser } from "@/lib/api/auth";
import ApproveDialog from "./components/ApproveDialog";
import { useApproveOnboarding, useRejectOnboarding } from "@/lib/api/onboarding/onboarding.hooks";

const OnboardingPage = () => {
    const { data: onboardingListData, isLoading, error, refetch } = useOnboardings({ status: 'pending' });
    
    // Refetch onboarding list when page becomes visible (e.g., when user switches tabs back)
    // This ensures Super Admins see new pending requests even if they're already on the page
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                // Refetch when page becomes visible to catch any new pending requests
                refetch()
            }
        }
        
        document.addEventListener('visibilitychange', handleVisibilityChange)
        
        // Also refetch on window focus to catch updates
        const handleFocus = () => {
            refetch()
        }
        
        window.addEventListener('focus', handleFocus)
        
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange)
            window.removeEventListener('focus', handleFocus)
        }
    }, [refetch])
    
    // Periodically refetch to catch new pending requests (every 30 seconds)
    useEffect(() => {
        const interval = setInterval(() => {
            // Only refetch if page is visible
            if (document.visibilityState === 'visible') {
                refetch()
            }
        }, 30000) // 30 seconds
        
        return () => clearInterval(interval)
    }, [refetch])
    const onboardingList = onboardingListData?.data ?? [];
    const approveOnboarding = useApproveOnboarding();
    const rejectOnboarding = useRejectOnboarding();
    const { toast } = useToast();

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

    const handleRejectConfirm = async (onboardingId: number, reason: string) => {
        try {
            await rejectOnboarding.mutateAsync({ onboardingId, reason });
            setRejectDialogOpen(false);
            setSelectedOnboarding(null);
            toast({
                title: 'User rejected successfully',
                description: 'The user has been rejected successfully.',
            });
        } catch (err: any) {
            // Handle different error types
            let errorMessage = 'Please try again.'
            
            if (err?.response?.data?.message) {
                errorMessage = err.response.data.message
            } else if (err?.response?.data?.error) {
                errorMessage = err.response.data.error
            } else if (err?.message) {
                errorMessage = err.message
            } else if (err?.response?.data) {
                // If backend returns validation errors in a different format
                const backendError = err.response.data
                if (Array.isArray(backendError)) {
                    errorMessage = backendError.map((e: any) => e.message || e).join(', ')
                } else if (typeof backendError === 'string') {
                    errorMessage = backendError
                }
            }
            
            toast({
                variant: 'destructive',
                title: 'Failed to reject user',
                description: errorMessage,
            });
        }
    };

    const handleApproveConfirm = async (onboardingId: number, staffType: StaffType) => {
        try {
            await approveOnboarding.mutateAsync({ onboardingId, staffType });
            setApproveDialogOpen(false);
            setSelectedOnboarding(null);
            toast({
                title: 'User approved',
                description: 'The user has been approved and will move to the active list.',
            });
        } catch (err: any) {
            toast({
                variant: 'destructive',
                title: 'Failed to approve user',
                description: err?.response?.data?.message || err?.message || 'Please try again.',
            });
        }
    };

    const errorMessage =
        (error as any)?.response?.data?.message ||
        (error as Error | undefined)?.message ||
        'Please try again later.';

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
                ) : error ? (
                    <div className="rounded-xl bg-destructive/10 p-8 text-center shadow-card">
                        <p className="text-lg font-semibold text-destructive">Failed to load onboarding requests</p>
                        <p className="mt-2 text-sm text-muted-foreground">{errorMessage}</p>
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
                    isLoading={approveOnboarding.isPending}
                    userName={selectedOnboarding.user?.name || ""}
                    onboardingId={selectedOnboarding.id as number}
                />
            )}
        </>
    )
}

export default OnboardingPage;