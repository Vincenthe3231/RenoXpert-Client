import { useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Eye, Edit, Trash2, UserIcon } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import UserStatusBadge from "./UserStatusBadge";
import RoleBadge from "./RoleBadge";
import UserDetailsDialog from "./UserDetailsDialog";
import { cn } from "@/lib/utils";
import { User, StaffUser, OwnerUser, VendorUser } from "@/lib/api/auth/auth.schemas";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { getFlagPath } from "@/lib/country";

interface UserTableProps {
    users: User[];
    onViewUser?: (user: User) => void;
}

// Type guards
const isStaffUser = (user: User): user is StaffUser => user.userType === "staff";
const isOwnerUser = (user: User): user is OwnerUser => user.userType === "owner";
const isVendorUser = (user: User): user is VendorUser => user.userType === "vendor";

// Avatar component
const UserAvatar = ({ avatarUrl, name }: { avatarUrl?: string | null; name: string }) => {
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

// Actions dropdown
const UserActions = ({ user, onView }: { user: User; onView: (user: User) => void }) => (
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
            <DropdownMenuItem>
                <Edit size={14} className="mr-2" />
                Edit User
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive focus:text-destructive">
                <Trash2 size={14} className="mr-2" />
                Delete
            </DropdownMenuItem>
        </DropdownMenuContent>
    </DropdownMenu>
);

// Staff Users Table
const StaffTable = ({ users, onView }: { users: StaffUser[]; onView: (user: User) => void }) => (
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
                        className={cn("animate-fade-in transition-colors", "hover:bg-muted/10")}
                        style={{ animationDelay: `${index * 50}ms` }}
                    >
                        <TableCell>
                            <div className="flex items-center gap-3">
                                <UserAvatar avatarUrl={user.profile.avatarUrl} name={user.name} />
                                <div>
                                    <p className="font-medium text-foreground">{user.name}</p>
                                    <p className="text-xs text-muted-foreground">{user.phoneNo || ""}</p>
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
                        <TableCell className="text-right">
                            <UserActions user={user} onView={onView} />
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    </div>
);

// Owner Users Table
const OwnerTable = ({ users, onView }: { users: OwnerUser[]; onView: (user: User) => void }) => (
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
                            className={cn("animate-fade-in transition-colors", "hover:bg-muted/10")}
                            style={{ animationDelay: `${index * 50}ms` }}
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
                            <TableCell className="text-right">
                                <UserActions user={user} onView={onView} />
                            </TableCell>
                        </TableRow>
                    );
                })}
            </TableBody>
        </Table>
    </div>
);

// Vendor Users Table
const VendorTable = ({ users, onView }: { users: VendorUser[]; onView: (user: User) => void }) => (
    <div className="rounded-full border border-border bg-card shadow-card transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-xl overflow-hidden">
        <Table>
            <TableHeader>
                <TableRow className="bg-muted/5 hover:bg-muted/10">
                    <TableHead className="font-semibold">Name</TableHead>
                    <TableHead className="font-semibold">Phone</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold">Email</TableHead>
                    <TableHead className="text-right font-semibold">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {users.map((user, index) => (
                    <TableRow
                        key={user.uuid}
                        className={cn("animate-fade-in transition-colors", "hover:bg-muted/10")}
                        style={{ animationDelay: `${index * 50}ms` }}
                    >
                        <TableCell>
                            <div className="flex items-center gap-3">
                                <UserAvatar name={user.name} />
                                <p className="font-medium text-foreground">{user.name}</p>
                            </div>
                        </TableCell>
                        <TableCell>
                            <span className="text-sm text-muted-foreground">
                                {user.phoneNo || "—"}
                            </span>
                        </TableCell>
                        <TableCell>
                            <UserStatusBadge status={user.status} />
                        </TableCell>
                        <TableCell>
                            <span className="text-sm text-muted-foreground">{user.email}</span>
                        </TableCell>
                        <TableCell className="text-right">
                            <UserActions user={user} onView={onView} />
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    </div>
);

const UserTable = ({ users, onViewUser }: UserTableProps) => {
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
    const [detailsOpen, setDetailsOpen] = useState(false);

    const handleViewDetails = (user: User) => {
        setSelectedUserId(user.uuid);
        setDetailsOpen(true);
        onViewUser?.(user);
    };

    // Group users by type
    const staffUsers = users.filter(isStaffUser);
    const ownerUsers = users.filter(isOwnerUser);
    const vendorUsers = users.filter(isVendorUser);

    return (
        <>
            <div className="space-y-6">
                {staffUsers.length > 0 && (
                    <StaffTable users={staffUsers} onView={handleViewDetails} />
                )}
                {ownerUsers.length > 0 && (
                    <OwnerTable users={ownerUsers} onView={handleViewDetails} />
                )}
                {vendorUsers.length > 0 && (
                    <VendorTable users={vendorUsers} onView={handleViewDetails} />
                )}
            </div>
            
            <UserDetailsDialog
                open={detailsOpen}
                onOpenChange={setDetailsOpen}
                userId={selectedUserId}
            />
        </>
    );
};

export default UserTable;
