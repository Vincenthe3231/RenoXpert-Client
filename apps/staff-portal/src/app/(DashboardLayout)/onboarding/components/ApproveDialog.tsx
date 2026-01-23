import { Button } from "@/components/ui/button";
import { Dialog, DialogHeader, DialogContent, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { StaffType } from "@/lib/api/auth";

interface ApproveDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onApprove: (onboardingId: number, staffType: StaffType) => void;
    userName: string;
    onboardingId: number;
    isLoading?: boolean;
}

const ApproveDialog = ({ open, onOpenChange, onApprove, userName, onboardingId, isLoading = false }: ApproveDialogProps) => {
    const [staffType, setStaffType] = useState<StaffType>("staff");

    // Only allow Admin and Staff types
    const assignableRoles = [
        { name: 'admin' as StaffType, displayName: 'Admin' },
        { name: 'staff' as StaffType, displayName: 'Staff' },
    ];

    const handleApprove = () => {
        onApprove(onboardingId, staffType);
    };

    const handleClose = () => {
        if (!isLoading) {
            onOpenChange(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="border-none">
                <DialogHeader className="space-y-4">
                    <DialogTitle className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-success" />
                        Approve User
                    </DialogTitle>
                    <DialogDescription>
                        You are about to approve <span className="font-medium text-foreground">{userName}</span>.
                        Please select the staff type for this user.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <Label htmlFor="staffType">Staff Type</Label>
                    <Select value={staffType} onValueChange={(value: StaffType) => setStaffType(value)}>
                        <SelectTrigger id="staffType">
                            <SelectValue placeholder="Select staff type" />
                        </SelectTrigger>
                        <SelectContent>
                            {assignableRoles.map((role) => (
                                <SelectItem key={role.name} value={role.name}>
                                    {role.displayName}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground">
                        {staffType === "admin"
                            ? "Admins have elevated permissions to manage users and settings."
                            : "Staff members have standard access to the system."}
                    </p>
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button type="button" variant="outline" shape="roundedXl" onClick={handleClose} disabled={isLoading}>
                        Cancel
                    </Button>
                    <Button type="button" variant="success" shape="roundedXl" onClick={handleApprove} disabled={isLoading}>
                        {isLoading ? "Approving..." : "Confirm Approval"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default ApproveDialog;