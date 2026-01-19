import { Button } from "@/components/ui/button";
import { MoreHorizontal, Eye, Edit, Ban } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User } from "@/lib/api/auth/auth.schemas";

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
}: UserActionsProps) => (
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
            {canEdit && onEdit && (
                <DropdownMenuItem onClick={() => onEdit(user)}>
                    <Edit size={14} className="mr-2" />
                    Edit User
                </DropdownMenuItem>
            )}
            {!hideDeactivate && user.status === 'active' && (
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
);

