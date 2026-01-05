import { Button } from "@/components/ui/button"
import { Dialog, DialogFooter, DialogHeader, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RejectOnboardingInput, rejectOnboardingSchema } from "@/lib/api/onboarding"
import { AlertTriangle } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from '@hookform/resolvers/zod';

interface RejectDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onReject: (onboardingId: number, reason: string) => void;
    userName: string;
    onboardingId: number;
}

const RejectDialog = ({
    open,
    onOpenChange,
    onReject,
    userName,
    onboardingId,
}: RejectDialogProps) => {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<RejectOnboardingInput>({
        resolver: zodResolver(rejectOnboardingSchema as any),
    });

    const onSubmit = (data: RejectOnboardingInput) => {
        onReject(onboardingId, data.rejectionReason);
        reset();
    };

    const handleClose = () => {
        reset();
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="border-none">
                <DialogHeader>
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-error-light">
                        <AlertTriangle size={24} className="text-error" />
                    </div>
                    <DialogTitle className="text-center">Reject User</DialogTitle>
                    <DialogDescription className="text-center">
                        You are about to reject <span className="font-medium text-foreground">{userName}</span>. Please provide a
                        reason for the rejection.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="reason">Rejection Reason</Label>
                            <Textarea
                                id="reason"
                                placeholder="Please explain why this user is being rejected..."
                                className="min-h-[120px] resize-none"
                                {...register("rejectionReason")}
                            />
                            {errors.rejectionReason && (
                                <p className="text-sm text-error">{errors.rejectionReason.message}</p>
                            )}
                        </div>
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button type="button" variant="outline" shape="roundedXl" onClick={handleClose}>
                            Cancel
                        </Button>
                        <Button type="submit" variant="destructive" shape="roundedXl" disabled={isSubmitting}>
                            Confirm Rejection
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

export default RejectDialog