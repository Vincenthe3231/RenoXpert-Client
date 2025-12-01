"use client";
import React, { useEffect } from "react";
import {
    createColumnHelper,
    useReactTable,
    getCoreRowModel,
    flexRender,
} from "@tanstack/react-table";
import { Badge } from "flowbite-react";
import Image from "next/image";
import { getUserStatusBadge } from "@/utils/user-helpers";
import { Owner, PaginatedResponse } from "@/lib/schemas";
import { Button } from "flowbite-react";
import { useStaffType } from "@/hooks/use-staff-type";
import Link from "next/link";

export interface OwnerTableType {
    id?: number;
    avatar?: any;
    name?: string;
    email?: string;
    phoneNumber?: string;
    profileCompletion?: number;
    status?: string;
    actions?: string;
}


const columnHelper = createColumnHelper<OwnerTableType>();

// Calculate profile completion percentage
const calculateProfileCompletion = (user: Owner): number => {
    const fields = [
        user.name,
        user.email,
        user.phoneNo,
        user.countryCode,
        user.emailVerifiedAt,
    ];

    const completedFields = fields.filter(field => field && field !== '').length;
    return Math.round((completedFields / fields.length) * 100);
};

interface OwnerTableProps {
    ownerList?: PaginatedResponse<Owner>;
    isOwnerLoading: boolean;
    ownerError: Error | null;
    isOwnerError: boolean;
}

const OwnerTable = ({ ownerList, isOwnerLoading, ownerError, isOwnerError }: OwnerTableProps) => {
    const [data, setData] = React.useState<OwnerTableType[]>([]);
    const [density, setDensity] = React.useState("md");
    const { isSuperAdmin } = useStaffType();

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
        columnHelper.accessor("phoneNumber", {
            header: () => <span>Phone Number</span>,
            cell: (info) => {
                const phone = info.getValue();
                return (
                    <span className="text-xs">
                        +{phone || "-"}
                    </span>
                );
            },
        }),
        columnHelper.accessor("profileCompletion", {
            header: () => <span>Profile Completion %</span>,
            cell: (info) => {
                const completion = info.getValue() || 0;
                const color = completion >= 80 ? "success" : completion >= 50 ? "warning" : "failure";
                return (
                    <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                                className={`h-2 rounded-full ${completion >= 80
                                    ? "bg-green-500"
                                    : completion >= 50
                                        ? "bg-yellow-500"
                                        : "bg-red-500"
                                    }`}
                                style={{ width: `${completion}%` }}
                            />
                        </div>
                        <span className="text-xs font-medium">{completion}%</span>
                    </div>
                );
            },
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
            cell: (info) => (
                <div className="flex gap-2">
                    <Button
                        size="xs"
                        color='primary'
                        className='border border-primary text-primary hover:bg-primary hover:text-white rounded-md'
                        outline
                        as={Link}
                        href={`/users/${info.row.original.id}/edit`}
                    >
                        Edit
                    </Button>
                </div>
            ),
        }),
    ];

    useEffect(() => {
        if (ownerList?.data) {
            const mappedData: OwnerTableType[] = ownerList.data.map((owner) => {
                const phoneNumber = owner.countryCode && owner.phoneNo
                    ? `${owner.countryCode} ${owner.phoneNo}`
                    : owner.phoneNo || "";

                return {
                    id: owner.id || undefined,
                    avatar: "/images/profile/user-1.jpg", // Owners might not have profile avatars
                    name: owner.name || '',
                    email: owner.email || '',
                    phoneNumber: phoneNumber,
                    profileCompletion: calculateProfileCompletion(owner),
                    status: owner.status || '',
                };
            });
            setData(mappedData);
        }
    }, [ownerList]);

    const error = isOwnerError
        ? (ownerError instanceof Error
            ? ownerError.message
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
            {isOwnerLoading && (
                <div className="text-center py-8">
                    <p className="text-gray-600 dark:text-gray-400">Loading owners...</p>
                </div>
            )}

            {ownerError && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
                    <p className="text-red-800 dark:text-red-200">Error: {error}</p>
                </div>
            )}

            {!isOwnerLoading && !ownerError && (
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
                                                No owners found
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

                    {ownerList && ownerList.meta.total > 0 && (
                        <div className="mt-4 text-xs text-gray-600 dark:text-gray-400">
                            Showing {ownerList.meta.from} to {ownerList.meta.to} of {ownerList.meta.total} owners
                        </div>
                    )}
                </>
            )}
        </>
    );
};

export default OwnerTable;

