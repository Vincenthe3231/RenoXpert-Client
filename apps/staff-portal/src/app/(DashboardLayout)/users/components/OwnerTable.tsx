import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { OwnerUser, User } from "@/lib/api/auth/auth.schemas";
import UserStatusBadge from "./UserStatusBadge";
import Image from "next/image";
import { getFlagPath } from "@/lib/country";
import { UserAvatar } from "./UserAvatar";
import { UserActions } from "./UserActions";

interface OwnerTableProps {
    users: OwnerUser[];
    onView: (user: User) => void;
    onDeactivate: (user: User) => void;
    onEdit?: (user: User) => void;
    hideDeactivate?: boolean;
    canEdit?: boolean;
}

export const OwnerTable = ({ 
    users, 
    onView, 
    onDeactivate,
    onEdit,
    hideDeactivate = false,
    canEdit = false
}: OwnerTableProps) => (
    <div className="rounded-xl border border-border bg-card shadow-card transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-xl overflow-hidden">
        <Table>
            <TableHeader>
                <TableRow className="bg-muted/5 hover:bg-muted/10">
                    <TableHead className="font-semibold">Name</TableHead>
                    <TableHead className="font-semibold">Phone</TableHead>
                    <TableHead className="font-semibold">Location</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold">Email</TableHead>
                    <TableHead className="text-right font-semibold">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {users.map((user, index) => {
                    const location = [user.profile.city, user.profile.state]
                        .filter(Boolean)
                        .join(", ");

                    return (
                        <TableRow
                            key={user.uuid}
                            className={cn("animate-fade-in transition-all duration-200 ease-in-out cursor-pointer", "hover:bg-muted/50 hover:-translate-y-0.5")}
                            style={{ animationDelay: `${index * 50}ms` }}
                            onClick={() => onView(user)}
                        >
                            <TableCell>
                                <div className="flex items-center gap-3">
                                    <UserAvatar name={user.name} />
                                    <div>
                                        <p className="font-medium text-foreground">
                                            {user.profile.salutation ? `${user.profile.salutation} ` : ""}
                                            {user.name}
                                        </p>
                                        <p className="text-xs text-muted-foreground">{user.profile.ic || "—"}</p>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-2">
                                    {getFlagPath(user.countryCode) && (
                                        <Image
                                            src={getFlagPath(user.countryCode)!}
                                            alt={`Flag ${user.countryCode}`}
                                            width={16}
                                            height={12}
                                            className="rounded-sm flex-shrink-0"
                                        />
                                    )}
                                    <span className="text-sm text-muted-foreground">
                                        +{user.countryCode} {user.phoneNo || ""}
                                    </span>
                                </div>
                            </TableCell>
                            <TableCell>
                                <span className="text-sm text-muted-foreground">
                                    {location || "—"}
                                </span>
                            </TableCell>
                            <TableCell>
                                <UserStatusBadge status={user.status} />
                            </TableCell>
                            <TableCell>
                                <span className="text-sm text-muted-foreground">{user.email}</span>
                            </TableCell>
                            <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                                <UserActions 
                                    user={user} 
                                    onView={onView} 
                                    onDeactivate={onDeactivate}
                                    onEdit={onEdit}
                                    hideDeactivate={hideDeactivate}
                                    canEdit={canEdit}
                                />
                            </TableCell>
                        </TableRow>
                    );
                })}
            </TableBody>
        </Table>
    </div>
);

