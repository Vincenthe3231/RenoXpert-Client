import { Button } from "@/components/ui/button";
import { MoreHorizontal, Eye, Edit, Ban } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User } from "@/lib/api/auth/auth.schemas";
import { useAuth } from "@/lib/api/auth/auth.hooks";
import { useMemo } from "react";

interface UserActionsProps {
    user: User;
    onView: (user: User) => void;
    onDeactivate: (user: User) => void;
    onEdit?: (user: User) => void;
    hideDeactivate?: boolean;
    canEdit?: boolean;
}

export const UserActions = ({ 
    user, 
    onView, 
    onDeactivate,
    onEdit,
    hideDeactivate = false,
    canEdit = false
}: UserActionsProps) => {
    const { data: currentUser } = useAuth()
    
    // Check if the current user is trying to edit/deactivate themselves
    const isCurrentUser = useMemo(() => {
        if (!currentUser || !user) return false
        // Compare by ID or UUID
        if (currentUser.id && user.id && currentUser.id === user.id) return true
        if (currentUser.uuid && user.uuid && currentUser.uuid === user.uuid) return true
        return false
    }, [currentUser, user])

    // Check if current user is admin (not super-admin)
    const isCurrentUserAdmin = useMemo(() => {
        if (!currentUser || !currentUser.profile) return false
        const profile = currentUser.profile as any
        const userRoles = Array.isArray(profile?.roles) ? profile.roles : []
        const normalizedUserRoles = userRoles.map((role: unknown) => {
            if (typeof role !== 'string') return ''
            return role.toLowerCase().trim().replace(/\s+/g, '-').replace(/_/g, '-')
        }).filter((role: string) => role.length > 0)
        
        const isSuperAdmin = normalizedUserRoles.some((role: string) => 
            role === 'super-admin' || role === 'superadmin' || role === 'super_admin'
        )
        const isAdmin = normalizedUserRoles.includes('admin')
        
        // Admin but not super-admin
        return isAdmin && !isSuperAdmin
    }, [currentUser])

    // Prevent admins from editing/deactivating themselves
    const canEditThisUser = canEdit && onEdit && !(isCurrentUserAdmin && isCurrentUser)
    const canDeactivateThisUser = !hideDeactivate && user.status === 'active' && !(isCurrentUserAdmin && isCurrentUser)

    return (
    <DropdownMenu>
        <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal size={16} />
            </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem onClick={() => onView(user)}>
                <Eye size={14} className="mr-2" />
                View Details
            </DropdownMenuItem>
            {canEditThisUser && (
                <DropdownMenuItem onClick={() => onEdit!(user)}>
                    <Edit size={14} className="mr-2" />
                    Edit User
                </DropdownMenuItem>
            )}
            {canDeactivateThisUser && (
                <DropdownMenuItem 
                    className="text-destructive focus:text-destructive"
                    onClick={() => onDeactivate(user)}
                >
                    <Ban size={14} className="mr-2" />
                    Deactivate
                </DropdownMenuItem>
            )}
        </DropdownMenuContent>
    </DropdownMenu>
    )
}

