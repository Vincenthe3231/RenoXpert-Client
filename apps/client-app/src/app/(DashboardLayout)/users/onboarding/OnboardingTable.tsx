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
import { getUserTypeLabel, getUserTypeBadge, getUserStatusBadge } from "@/utils/user-helpers";
import TitleSelectionCard from "@/app/components/shared/TitleSelectionCard";
import { Onboarding, Staff } from "@/lib/schemas";
import { Button } from "@/app/components/shadcn-ui/Default-Ui/button";
import { useStaffType } from "@/hooks/use-staff-type";
import TitleIconCard from "@/app/components/shared/TitleIconCard";
import { toDate, toDateTime, toTime } from "@/utils/date-helpers";
import ApprovalModal from "./Modal/ApprovalModal";
import RejectModal from "./Modal/RejectModal";

export interface TableTypeDense {
    avatar?: any;
    id?: number;
    name?: string;
    email?: string;
    userType?: string;
    userRoles?: string[];
    status?: string;
    actions?: string;
    createdDate?: string;
    createdTime?: string;
}

interface PaginatedResponse {
    current_page: number;
    data: Onboarding[];
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    links: Array<{
        url: string | null;
        label: string;
        page: number;
        active: boolean;
    }>;
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
}

const columnHelper = createColumnHelper<TableTypeDense>();

const listOptions = [
    { value: "onboarding", label: "Onboarding" },
    { value: "all", label: "All Staff" },
];

interface OnboardingTableProps {
    title: string;
    className: string;
    onboardingList?: PaginatedResponse;
    isOnboardingLoading: boolean;
    onboardingError: Error | null;
    isOnboardingError: boolean;
    refetchOnboardingList: () => void;
}

const OnboardingTable = ({ title, className, onboardingList, isOnboardingLoading, onboardingError, isOnboardingError, refetchOnboardingList }: OnboardingTableProps) => {
    const [data, setData] = React.useState<TableTypeDense[]>([]);
    const [density, setDensity] = React.useState("md");
    const [approvalModalOpen, setApprovalModalOpen] = React.useState(false);
    const [rejectModalOpen, setRejectModalOpen] = React.useState(false);
    const [selectedOnboardStaff, setSelectedOnboardStaff] = React.useState<{ id?: number; name?: string; email?: string; userType?: string } | null>(null);
    const columns = [
        columnHelper.accessor("avatar", {
            header: () => <span>User</span>,
            cell: (info) => {
                const avatarUrl = info.getValue() || "/images/profile/user-1.jpg";
                const userName = info.row.original.name || "User";
                const userEmail = info.row.original.email || "";

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
                                // Fallback to default avatar on error
                                e.currentTarget.src = "/images/profile/user-1.jpg";
                            }}
                        />
                        <div className="truncate">
                            <h6 className="text-sm font-medium">{userName}</h6>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{userEmail}</p>
                        </div>
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
        columnHelper.accessor("createdDate", {
            header: () => <span>Onboarding Date</span>,
            cell: (info) => (
                <div className="flex flex-col">
                    <p className="text-xs text-gray-500 dark:text-gray-400">{info.row.original.createdDate} - {info.row.original.createdTime}</p>
                </div>
            ),
        }),
        columnHelper.accessor("actions", {
            header: () => <span>Actions</span>,
            cell: (info) => (
                <div className="flex gap-2">
                    <Button
                        variant="outlinesuccess"
                        size="xs"
                        className="text-xs"
                        onClick={() => {
                            setSelectedOnboardStaff({
                                id: info.row.original.id,
                                name: info.row.original.name,
                                email: info.row.original.email,
                                userType: info.row.original.userType,
                            });
                            setApprovalModalOpen(true);
                        }}>
                        Approve
                    </Button>
                    <Button
                        variant="error"
                        size="xs"
                        className="text-xs"
                        onClick={() => {
                            setSelectedOnboardStaff({
                                id: info.row.original.id,
                                name: info.row.original.name,
                                email: info.row.original.email,
                                userType: info.row.original.userType,
                            });
                            setRejectModalOpen(true);
                        }}>
                        Reject
                    </Button>
                </div>
            ),
        }),
    ];

    useEffect(() => {
        if (onboardingList?.data) {
            const mappedData: TableTypeDense[] = onboardingList.data.map((onboarding) => ({
                avatar: onboarding.staff?.profile.avatarUrl || onboarding.staff?.profile.avatarBig || "/images/profile/user-1.jpg",
                id: onboarding.id || undefined,
                name: onboarding.staff?.name || '',
                email: onboarding.staff?.email || '',
                userType: onboarding.staff?.userType || '',
                status: onboarding.status || '',
                createdDate: toDate(onboarding.staff?.createdAt || ''),
                createdTime: toTime(onboarding.staff?.createdAt || ''),
            }));
            setData(mappedData);
        }
    }, [onboardingList]);

    const error = isOnboardingError
        ? (onboardingError instanceof Error
            ? onboardingError.message
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
            <TitleIconCard title="Onboarding List">
                {isOnboardingLoading && (
                    <div className="text-center py-8">
                        <p className="text-gray-600 dark:text-gray-400">Loading users...</p>
                    </div>
                )}

                {onboardingError && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
                        <p className="text-red-800 dark:text-red-200">Error: {error}</p>
                    </div>
                )}

                {!isOnboardingLoading && !onboardingError && (
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
                                                            className={`whitespace-nowrap transition-all duration-200 ${getPadding(density)} text-sm`}
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

                        {onboardingList && onboardingList.total > 0 && (
                            <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                                Showing {onboardingList.from} to {onboardingList.to} of {onboardingList.total} users
                            </div>
                        )}
                    </>
                )}
            </TitleIconCard>

            <ApprovalModal
                isOpen={approvalModalOpen}
                setIsOpen={setApprovalModalOpen}
                id={selectedOnboardStaff?.id}
                name={selectedOnboardStaff?.name}
                email={selectedOnboardStaff?.email}
                refetchOnboardingList={refetchOnboardingList}
            />
            <RejectModal
                isOpen={rejectModalOpen}
                setIsOpen={setRejectModalOpen}
                id={selectedOnboardStaff?.id}
                name={selectedOnboardStaff?.name}
                email={selectedOnboardStaff?.email}
                refetchOnboardingList={refetchOnboardingList}
            />
        </>
    );
};

export default OnboardingTable;
