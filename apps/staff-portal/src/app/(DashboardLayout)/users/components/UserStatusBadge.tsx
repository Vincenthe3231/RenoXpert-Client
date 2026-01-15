import { Badge } from "@/components/ui/badge";
import { UserStatus } from "@/lib/api/auth/auth.schemas";
import { CheckCircle, Clock, XCircle, Ban } from "lucide-react";

interface UserStatusBadgeProps {
    status: UserStatus;
}

const statusConfig: Record<
    UserStatus,
    { 
        label: string; 
        className: string;
        icon: React.ReactNode;
    }
> = {
    active: {
        label: "Active",
        className: "bg-green-50 text-green-700 border-green-200 hover:bg-green-100",
        icon: <CheckCircle size={12} />,
    },
    verifying: {
        label: "Verifying",
        className: "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100",
        icon: <Clock size={12} />,
    },
    deactivated: {
        label: "Deactivated",
        className: "bg-pink-50 text-pink-500/90 border-pink-500/30 hover:bg-pink-500/20",
        icon: <Ban size={12} />,
    },
    rejected: {
        label: "Rejected",
        className: "bg-red-50 text-red-700 border-red-200 hover:bg-red-100",
        icon: <XCircle size={12} />,
    },
};

const UserStatusBadge = ({ status }: UserStatusBadgeProps) => {
    const config = statusConfig[status];

    return (
        <Badge variant="outline" className={`gap-1 ${config.className}`}>
            {config.icon}
            {config.label}
        </Badge>
    );
};

export default UserStatusBadge;
