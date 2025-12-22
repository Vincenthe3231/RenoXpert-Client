"use client";
import React, { useEffect, useState } from "react";
import {
    createColumnHelper,
    useReactTable,
    getCoreRowModel,
    flexRender,
} from "@tanstack/react-table";
import { Badge } from "flowbite-react";
import Image from "next/image";
import { getUserTypeLabel, getUserTypeBadge, getUserStatusBadge, canEditUser } from "@/utils/user-helpers";
import { PaginatedResponse, Staff } from "@/lib/schemas";
import { Button } from "flowbite-react";
import { useStaffType } from "@/hooks/use-staff-type";
import { useUser } from "@/app/context/UserContext";
import Link from "next/link";

export interface StaffTableType {
    id?: number;
    avatar?: any;
    name?: string;
    email?: string;
    userType?: string;
    userRoles?: string[];
    status?: string;
    actions?: string;
}

const columnHelper = createColumnHelper<StaffTableType>();

interface StaffTableProps {
    staffList?: PaginatedResponse<Staff>;
    isStaffLoading: boolean;
    staffError: Error | null;
    isStaffError: boolean;
}

const StaffTable = ({ staffList, isStaffLoading, staffError, isStaffError }: StaffTableProps) => {
    const [data, setData] = useState<StaffTableType[]>([]);
    const [density, setDensity] = useState("md");
    const { staffType: currentUserStaffType } = useStaffType();
    const { user: currentUser } = useUser();

    const columns = [
        columnHelper.accessor("avatar", {
            cell: (info) => {
                const avatarUrl = info.getValue() || "/images/profile/user-1.jpg";
                const userName = info.row.original.name || "User";
                const userEmail = info.row.original.email || "";
                const userId = info.row.original.id;

                return (
                    <div className="flex items-center space-x-2 p-1">
                        <Image
                            src={avatarUrl}
                            alt={`${userName} Avatar`}
                            height={40}
                            width={40}
                            className="h-10 w-10 rounded-full object-cover"
                            unoptimized
                            onError={(e) => {
                                e.currentTarget.src = "/images/profile/user-1.jpg";
                            }}
                        />
                        <Link
                            href={`/users/${userId}`}
                            className="truncate group"
                        >
                            <h6 className="text-xs font-medium group-hover:text-primary transition-colors">{userName}</h6>
                            <p className="text-[10px] text-gray-500 dark:text-gray-400 transition-colors">{userEmail}</p>
                        </Link>
                    </div>
                );
            },
            header: () => <span>User</span>,
        }),
        columnHelper.accessor("userType", {
            header: () => <span>User Type</span>,
            cell: (info) => <Badge
                color={getUserTypeBadge(info.getValue())}
                className="capitalize"
            >
                {getUserTypeLabel(info.getValue())}
            </Badge>,
        }),
        columnHelper.accessor("status", {
            header: () => <span>Status</span>,
            cell: (info) => (
                <Badge
                    color={getUserStatusBadge(info.getValue())}
                    className="capitalize"
                >
                    {info.getValue()}
                </Badge>
            ),
        }),
        columnHelper.accessor("actions", {
            header: () => <span>Actions</span>,
            cell: (info) => {
                // userType in the table data contains the staffType value
                const targetStaffType = info.row.original.userType;
                const canEdit = canEditUser(
                    currentUser?.staffType,
                    'staff',
                    targetStaffType as 'super_admin' | 'admin' | 'staff'
                );

                return (
                    <div className="flex gap-2">
                        {canEdit && (
                            <Button
                                size="xs"
                                color='primary'
                                className='border border-primary text-primary hover:bg-primary hover:text-white rounded-md'
                                outline
                                as={Link}
                                href={`/users/${info.row.original?.id}/edit`}
                            >
                                Edit
                            </Button>
                        )}
                    </div>
                );
            },
        }),
    ];

    useEffect(() => {
        if (staffList?.data) {
            const mappedData: StaffTableType[] = staffList.data.map((staff) => ({
                id: staff.id,
                avatar: staff.avatarUrl || staff.avatarBig || "/images/profile/user-1.jpg",
                name: staff.name || '',
                email: staff.email || '',
                userType: staff.staffType || '',
                status: staff.status || '',
            }));
            setData(mappedData);
            console.log(mappedData);
            
        }
    }, [staffList]);

    const error = isStaffError
        ? (staffError instanceof Error
            ? staffError.message
            : 'An unexpected error occurred')
        : null;

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    const getPadding = (density: string) => {
        switch (density) {
            case "sm":
                return "p-1";
            case "md":
                return "p-2";
            case "lg":
                return "p-4";
            default:
                return "p-2";
        }
    };

    return (
        <>
            {isStaffLoading && (
                <div className="text-center py-8">
                    <p className="text-gray-600 dark:text-gray-400">Loading users...</p>
                </div>
            )}

            {staffError && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
                    <p className="text-red-800 dark:text-red-200">Error: {error}</p>
                </div>
            )}

            {!isStaffLoading && !staffError && (
                <>
                    <div className="border border-ld rounded-md overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead>
                                    {table.getHeaderGroups().map((headerGroup) => (
                                        <tr key={headerGroup.id}>
                                            {headerGroup.headers.map((header) => (
                                                <th
                                                    key={header.id}
                                                    className={`text-sm text-ld font-semibold text-left border-b  border-ld  transition-all duration-200 ${getPadding(density)}`}
                                                >
                                                    {header.isPlaceholder
                                                        ? null
                                                        : flexRender(
                                                            header.column.columnDef.header,
                                                            header.getContext()
                                                        )}
                                                </th>
                                            ))}
                                        </tr>
                                    ))}
                                </thead>
                                <tbody className="divide-y divide-border dark:divide-darkborder">
                                    {table.getRowModel().rows.length === 0 ? (
                                        <tr>
                                            <td colSpan={columns.length} className="text-center py-8 text-gray-500">
                                                No users found
                                            </td>
                                        </tr>
                                    ) : (
                                        table.getRowModel().rows.map((row) => (
                                            <tr key={row.id}>
                                                {row.getVisibleCells().map((cell) => (
                                                    <td
                                                        key={cell.id}
                                                        className={`whitespace-nowrap transition-all duration-200 ${getPadding(density)} text-xs`}
                                                    >
                                                        {flexRender(
                                                            cell.column.columnDef.cell,
                                                            cell.getContext()
                                                        )}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {staffList && staffList.meta.total > 0 && (
                        <div className="mt-4 text-xs text-gray-600 dark:text-gray-400">
                            Showing {staffList.meta.from} to {staffList.meta.to} of {staffList.meta.total} users
                        </div>
                    )}
                </>
            )}
        </>
    );
};

export default StaffTable;

