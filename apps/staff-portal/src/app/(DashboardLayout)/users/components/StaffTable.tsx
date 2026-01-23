import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { StaffUser, User } from "@/lib/api/auth/auth.schemas";
import UserStatusBadge from "./UserStatusBadge";
import RoleBadge from "./RoleBadge";
import { UserAvatar } from "./UserAvatar";
import { UserActions } from "./UserActions";
import Image from "next/image";
import { getFlagPath } from "@/lib/country";

interface StaffTableProps {
    users: StaffUser[];
    onView: (user: User) => void;
    onDeactivate: (user: User) => void;
    onEdit?: (user: User) => void;
    hideDeactivate?: boolean;
    canEdit?: boolean;
}

export const StaffTable = ({ 
    users, 
    onView, 
    onDeactivate,
    onEdit,
    hideDeactivate = false,
    canEdit = false
}: StaffTableProps) => (
    <div className="rounded-xl border border-border bg-card shadow-card transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-xl overflow-hidden">
        <Table>
            <TableHeader>
                <TableRow className="bg-muted/5 hover:bg-muted/10">
                    <TableHead className="font-semibold">Name</TableHead>
                    <TableHead className="font-semibold">Roles</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold">Email</TableHead>
                    <TableHead className="text-right font-semibold">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {users.map((user, index) => (
                    <TableRow
                        key={user.uuid}
                        className={cn("animate-fade-in transition-all duration-200 ease-in-out cursor-pointer", "hover:bg-muted/50 hover:-translate-y-0.5")}
                        style={{ animationDelay: `${index * 50}ms` }}
                        onClick={() => onView(user)}
                    >
                        <TableCell>
                            <div className="flex items-center gap-3">
                                <UserAvatar avatarUrl={user.profile.avatarUrl} name={user.name} />
                                <div>
                                    <p className="font-medium text-foreground">{user.name}</p>
                                    {user.phoneNo ? (
                                        <div className="flex items-center gap-1.5">
                                            {user.countryCode && getFlagPath(user.countryCode) && (
                                                <Image
                                                    src={getFlagPath(user.countryCode)!}
                                                    alt={`Flag ${user.countryCode}`}
                                                    width={12}
                                                    height={9}
                                                    className="rounded-sm flex-shrink-0"
                                                />
                                            )}
                                            <span className="text-xs text-muted-foreground">
                                                {user.countryCode ? `+${user.countryCode} ` : ""}{user.phoneNo}
                                            </span>
                                        </div>
                                    ) : (
                                        <p className="text-xs text-muted-foreground">—</p>
                                    )}
                                </div>
                            </div>
                        </TableCell>
                        <TableCell>
                            <div className="flex flex-wrap gap-1">
                                {user.profile.roles.map((role) => (
                                    <RoleBadge key={role} role={role} />
                                ))}
                            </div>
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
                ))}
            </TableBody>
        </Table>
    </div>
);

