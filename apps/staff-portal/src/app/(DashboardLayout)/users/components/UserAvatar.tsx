import { UserIcon } from "lucide-react";

interface UserAvatarProps {
    avatarUrl?: string | null;
    name: string;
}

export const UserAvatar = ({ avatarUrl, name }: UserAvatarProps) => {
    if (avatarUrl) {
        return (
            <img
                src={avatarUrl}
                alt={name}
                className="h-10 w-10 rounded-full object-cover ring-2 ring-border"
            />
        );
    }

    return (
        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center ring-2 ring-border">
            <UserIcon size={20} className="text-primary" />
        </div>
    );
};

