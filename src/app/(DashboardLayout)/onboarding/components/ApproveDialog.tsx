import { Button } from "@/components/ui/button";
import { Dialog, DialogHeader, DialogContent, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2 } from "lucide-react";
import { useState, useMemo } from "react";
import { StaffType } from "@/lib/api/auth";
import { useRoles } from "@/lib/api/roles";

interface ApproveDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onApprove: (onboardingId: number, staffType: StaffType) => void;
    userName: string;
    onboardingId: number;
    isLoading?: boolean;
}

/**
 * Helper to normalize role name to StaffType format
 * Converts "super_admin" -> "super-admin", "staff" -> "staff"
 */
function normalizeRoleToStaffType(roleName: string): StaffType {
    // Normalize underscores to hyphens and lowercase
    const normalized = roleName.toLowerCase().replace(/_/g, '-');
    // Map to valid StaffType values
    if (normalized === 'super-admin' || normalized === 'superadmin') {
        return 'super-admin';
    }
    if (normalized === 'admin') {
        return 'admin';
    }
    if (normalized === 'staff') {
        return 'staff';
    }
    // Default fallback
    return 'staff';
}

/**
 * Helper to format role name for display
 */
function formatRoleName(roleName: string): string {
    return roleName
        .split(/[-_]/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
}

const ApproveDialog = ({ open, onOpenChange, onApprove, userName, onboardingId, isLoading = false }: ApproveDialogProps) => {
    const { data: rolesData, isLoading: rolesLoading } = useRoles();
    const [staffType, setStaffType] = useState<StaffType>("staff");

    // Filter roles to only show assignable staff roles (exclude super_admin)
    const assignableRoles = useMemo(() => {
        if (!rolesData?.data) {
            // Fallback to default roles while loading
            return [
                { name: 'admin', displayName: 'Admin' },
                { name: 'staff', displayName: 'Staff' },
            ];
        }

        return rolesData.data
            .filter(role => {
                const normalized = role.name.toLowerCase().replace(/_/g, '-');
                // Exclude super-admin roles from assignment during onboarding
                return normalized !== 'super-admin' && normalized !== 'superadmin';
            })
            .map(role => ({
                name: normalizeRoleToStaffType(role.name),
                displayName: formatRoleName(role.name),
            }))
            // Remove duplicates
            .filter((role, index, self) => 
                index === self.findIndex(r => r.name === role.name)
            );
    }, [rolesData]);

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
                    {rolesLoading ? (
                        <Select disabled>
                            <SelectTrigger id="staffType">
                                <SelectValue placeholder="Loading roles..." />
                            </SelectTrigger>
                        </Select>
                    ) : (
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
                    )}
                    <p className="text-sm text-muted-foreground">
                        {staffType === "admin" || staffType === "super-admin"
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