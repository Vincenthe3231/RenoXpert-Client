"use client"

import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Clock, CheckCircle2, Loader2, Lock, ChevronLeft, Building2 } from "lucide-react";
import { Onboarding, useOnboardings } from "@/lib/api/onboarding";
import OnboardingTable from "./OnboardingTable";
import { useState, useEffect } from "react";
import RejectDialog from "./components/RejectDialog";
import { StaffType, StaffUser, useAuth } from "@/lib/api/auth";
import ApproveDialog from "./components/ApproveDialog";
import { useApproveOnboarding, useRejectOnboarding } from "@/lib/api/onboarding/onboarding.hooks";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { AddDepartmentDialog } from "./components/AddDepartmentDialog";

const OnboardingPage = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { data: user, isLoading: isAuthLoading } = useAuth();
    const { data: onboardingListData, isLoading, error, refetch } = useOnboardings({ status: 'pending' });

    // Check if user is super-admin
    const isSuperAdmin = (() => {
        if (!user || !user.profile) return false;
        const userRoles = user.profile.roles || [];
        const normalizedUserRoles = userRoles.map(role => {
            if (typeof role !== 'string') return '';
            return role.toLowerCase().trim().replace(/\s+/g, '-').replace(/_/g, '-');
        }).filter(role => role.length > 0);

        return normalizedUserRoles.some(role =>
            role === 'super-admin' || role === 'superadmin' || role === 'super_admin'
        );
    })();

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
    const [addDepartmentDialogOpen, setAddDepartmentDialogOpen] = useState(false);

    // Check if we should auto-open the add department dialog
    useEffect(() => {
        const action = searchParams.get("action");
        if (action === "add-department" && isSuperAdmin) {
            setAddDepartmentDialogOpen(true);
            // Clean up URL parameter
            router.replace("/onboarding", { scroll: false });
        }
    }, [searchParams, isSuperAdmin, router]);

    const handleRejectClick = (
        onboardingId: number,
        userName: string,
        userId?: number | null,
        userUuid?: string | null
    ) => {
        setSelectedOnboarding({
            id: onboardingId,
            user: {
                name: userName,
                uuid: userUuid
            } as StaffUser,
            userId: userId
        } as Onboarding);
        setRejectDialogOpen(true);
    };

    const handleApproveClick = (
        onboardingId: number,
        userName: string,
        userId?: number | null,
        userUuid?: string | null
    ) => {
        setSelectedOnboarding({
            id: onboardingId,
            user: {
                name: userName,
                uuid: userUuid
            } as StaffUser,
            userId: userId
        } as Onboarding);
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

    const handleApproveConfirm = async (onboardingId: number, staffType: StaffType, department?: string) => {
        try {
            await approveOnboarding.mutateAsync({ onboardingId, staffType, department });
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

    // Show loading state while checking auth
    if (isAuthLoading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-100px)]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    // Check if user has permission (only super-admin can access)
    if (!isSuperAdmin) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-100px)]">
                <div className="flex flex-col items-center gap-4 p-6 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800 max-w-md">
                    <Lock className="h-12 w-12 text-red-600 dark:text-red-400" />
                    <div className="text-center">
                        <h3 className="font-semibold text-red-900 dark:text-red-300 mb-2">Access Denied</h3>
                        <p className="text-sm text-red-700 dark:text-red-400 mb-4">
                            You do not have permission to access the onboarding module. Only super administrators can access this page.
                        </p>
                        <Button
                            variant="outline"
                            onClick={() => router.push('/dashboard')}
                            className="flex items-center gap-2"
                        >
                            <ChevronLeft className="h-4 w-4" />
                            Go to Dashboard
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

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
                    <div className="flex items-center gap-3">
                        {/* Add Department Button */}
                        <Button
                            variant="default"
                            onClick={() => setAddDepartmentDialogOpen(true)}
                            className="flex items-center gap-2"
                        >
                            <Building2 className="h-4 w-4" />
                            Add Department
                        </Button>
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
                {/* Reject Dialog */}
                {selectedOnboarding && (
                    <RejectDialog
                        open={rejectDialogOpen}
                        onOpenChange={setRejectDialogOpen}
                        onReject={handleRejectConfirm}
                        userName={selectedOnboarding.user?.name || ""}
                        userId={selectedOnboarding.userId}
                        userUuid={selectedOnboarding.user?.uuid}
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
                        userId={selectedOnboarding.userId}
                        userUuid={selectedOnboarding.user?.uuid}
                        onboardingId={selectedOnboarding.id as number}
                    />
                )}

                {/* Add Department Dialog */}
                <AddDepartmentDialog
                    open={addDepartmentDialogOpen}
                    onOpenChange={setAddDepartmentDialogOpen}
                />
            </div>
        </>
    )
}

export default OnboardingPage;