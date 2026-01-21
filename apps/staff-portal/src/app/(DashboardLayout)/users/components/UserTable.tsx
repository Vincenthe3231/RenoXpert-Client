import { useState, useMemo } from "react";
import { User, StaffUser, OwnerUser } from "@/lib/api/auth/auth.schemas";
import { useDeactivateUser, useAuth } from "@/lib/api/auth/auth.hooks";
import { useToast } from "@/hooks/use-toast";
import UserDetailsDialog from "./UserDetailsDialog";
import { DeactivateUserDialog } from "./DeactivateUserDialog";
import EditUserDialog from "./EditUserDialog";
import { StaffTable } from "./StaffTable";
import { OwnerTable } from "./OwnerTable";

interface UserTableProps {
    users: User[];
    onViewUser?: (user: User) => void;
    isStaff?: boolean;
}

// Type guards
const isStaffUser = (user: User): user is StaffUser => user.userType === "staff";
const isOwnerUser = (user: User): user is OwnerUser => user.userType === "owner";

const UserTable = ({ users, onViewUser, isStaff = false }: UserTableProps) => {
    const { data: currentUser } = useAuth();
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [userToEdit, setUserToEdit] = useState<User | null>(null);
    const [deactivateDialogOpen, setDeactivateDialogOpen] = useState(false);
    const [userToDeactivate, setUserToDeactivate] = useState<User | null>(null);
    const deactivateUser = useDeactivateUser();
    const { toast } = useToast();

    // Check if current user is super-admin
    const isSuperAdmin = useMemo(() => {
        if (!currentUser || !currentUser.profile) return false;
        const userRoles = currentUser.profile.roles || [];
        const normalizedUserRoles = userRoles.map(role => {
            if (typeof role !== 'string') return '';
            return role.toLowerCase().trim().replace(/\s+/g, '-').replace(/_/g, '-');
        }).filter(role => role.length > 0);
        
        return normalizedUserRoles.some(role => 
            role === 'super-admin' || role === 'superadmin'
        );
    }, [currentUser]);

    // Check if current user is admin or staff (not super-admin) - these users can manage owner profiles
    const isCurrentUserAdminOrStaff = useMemo(() => {
        if (!currentUser || !currentUser.profile) return false;
        const userRoles = currentUser.profile.roles || [];
        const normalizedUserRoles = userRoles.map(role => {
            if (typeof role !== 'string') return '';
            return role.toLowerCase().trim().replace(/\s+/g, '-').replace(/_/g, '-');
        }).filter(role => role.length > 0);
        
        const isSuperAdmin = normalizedUserRoles.some(role => 
            role === 'super-admin' || role === 'superadmin' || role === 'super_admin'
        );
        const isAdmin = normalizedUserRoles.includes('admin');
        const isStaff = normalizedUserRoles.includes('staff');
        
        // Return true if user is admin or staff (but not super-admin)
        return (isAdmin || isStaff) && !isSuperAdmin;
    }, [currentUser]);

    // Check if current user has "manage owners" permission
    const canManageOwners = useMemo(() => {
        if (!currentUser || !currentUser.profile) return false;
        const permissions = currentUser.profile.permissions || [];
        return permissions.includes("manage owners");
    }, [currentUser]);

    // Check if user can edit owner profiles (super-admin or staff/admin with "manage owners" permission)
    const canEditOwners = useMemo(() => {
        return isSuperAdmin || (isCurrentUserAdminOrStaff && canManageOwners);
    }, [isSuperAdmin, isCurrentUserAdminOrStaff, canManageOwners]);

    const handleViewDetails = (user: User) => {
        setSelectedUserId(user.uuid);
        setDetailsOpen(true);
        onViewUser?.(user);
    };

    const handleEditClick = (user: User) => {
        setUserToEdit(user);
        setEditDialogOpen(true);
    };

    const handleDeactivateClick = (user: User) => {
        setUserToDeactivate(user);
        setDeactivateDialogOpen(true);
    };

    const handleDeactivateConfirm = async () => {
        if (!userToDeactivate) return;

        try {
            // Backend deactivate endpoint accepts both integer ID and UUID
            const identifier = userToDeactivate.id ? String(userToDeactivate.id) : userToDeactivate.uuid
            await deactivateUser.mutateAsync(identifier)
            toast({
                title: 'User deactivated',
                description: `${userToDeactivate.name} has been deactivated successfully.`,
            })
            setDeactivateDialogOpen(false)
            setUserToDeactivate(null)
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Failed to deactivate user',
                description: error?.response?.data?.message || error?.message || 'Please try again.',
            })
        }
    };

    // Group users by type
    const staffUsers = users.filter(isStaffUser);
    const ownerUsers = users.filter(isOwnerUser);

    return (
        <>
            <div className="space-y-6">
                {/* Only show StaffTable if not staff user */}
                {!isStaff && staffUsers.length > 0 && (
                    <StaffTable 
                        users={staffUsers} 
                        onView={handleViewDetails} 
                        onDeactivate={handleDeactivateClick}
                        onEdit={isSuperAdmin ? handleEditClick : undefined}
                        hideDeactivate={isStaff}
                        canEdit={isSuperAdmin}
                    />
                )}
                {ownerUsers.length > 0 && (
                    <OwnerTable 
                        users={ownerUsers} 
                        onView={handleViewDetails} 
                        onDeactivate={handleDeactivateClick}
                        onEdit={canEditOwners ? handleEditClick : undefined}
                        hideDeactivate={isStaff}
                        canEdit={canEditOwners}
                    />
                )}
            </div>
            
            <UserDetailsDialog
                open={detailsOpen}
                onOpenChange={setDetailsOpen}
                userId={selectedUserId}
                canEdit={isSuperAdmin || (isCurrentUserAdminOrStaff && canManageOwners)}
                onEdit={(isSuperAdmin || (isCurrentUserAdminOrStaff && canManageOwners)) ? (user) => {
                    // Don't close the details dialog - keep it open
                    setUserToEdit(user);
                    setEditDialogOpen(true);
                } : undefined}
            />

            {userToEdit && (
                <EditUserDialog
                    open={editDialogOpen}
                    onOpenChange={setEditDialogOpen}
                    user={userToEdit}
                />
            )}

            {userToDeactivate && isSuperAdmin && (
                <DeactivateUserDialog
                    open={deactivateDialogOpen}
                    onOpenChange={setDeactivateDialogOpen}
                    user={userToDeactivate}
                    onConfirm={handleDeactivateConfirm}
                />
            )}
        </>
    );
};

export default UserTable;
