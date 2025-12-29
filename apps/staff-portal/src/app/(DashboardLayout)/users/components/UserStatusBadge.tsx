import { Badge } from "@/components/ui/badge";
import { UserStatus } from "@/lib/api/auth/auth.schemas";
import { CheckCircle, Clock, XCircle, Ban } from "lucide-react";

interface UserStatusBadgeProps {
    status: UserStatus;
}

const statusConfig: Record<
    UserStatus,
    { label: string; variant: "lightSuccess" | "lightWarning" | "lightGray" | "lightError"; icon: React.ReactNode }
> = {
    active: {
        label: "Active",
        variant: "lightSuccess",
        icon: <CheckCircle size={12} />,
    },
    verifying: {
        label: "Verifying",
        variant: "lightWarning",
        icon: <Clock size={12} />,
    },
    deactivated: {
        label: "Deactivated",
        variant: "lightGray",
        icon: <Ban size={12} />,
    },
    rejected: {
        label: "Rejected",
        variant: "lightError",
        icon: <XCircle size={12} />,
    },
};

const UserStatusBadge = ({ status }: UserStatusBadgeProps) => {
    const config = statusConfig[status];

    return (
        <Badge variant={config.variant} className="gap-1">
            {config.icon}
            {config.label}
        </Badge>
    );
};

export default UserStatusBadge;
