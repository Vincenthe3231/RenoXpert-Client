"use client";
import React from "react";
import {
    createColumnHelper,
    useReactTable,
    getCoreRowModel,
    flexRender,
} from "@tanstack/react-table";
import { Badge, Button } from "flowbite-react";
import Image from "next/image";
import TitleIconCard from "@/app/components/shared/TitleIconCard";
import { getUserTypeLabel, getUserTypeBadge, getUserStatusBadge } from "@/utils/user-helpers";

export interface TableTypeDense {
    avatar?: any;
    name?: string;
    email?: string;
    user_type?: string;
    user_roles?: string[];
    status?: string;
    actions?: string;
}

// API Response interfaces - matches the backend API response structure
interface UserResponse {
    id: number;
    uuid: string;
    larksuite_open_id?: string;
    larksuite_union_id?: string;
    avatar_url?: string;
    avatar_big?: string;
    name: string;
    email: string;
    user_type: string;
    user_status: string;
    user_roles?: string[] | null;
    email_verified_at?: string | null;
    last_login_at?: string | null;
    created_at: string;
    updated_at: string;
    [key: string]: any;
}

interface PaginatedResponse {
    current_page: number;
    data: UserResponse[];
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    links: Array<{
        url: string | null;
        label: string;
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

const columns = [
    columnHelper.accessor("avatar", {
        cell: (info) => {
            const avatarUrl = info.getValue() || "/images/profile/user-1.jpg";
            const userName = info.row.original.name || "User";
            const userEmail = info.row.original.email || "";

            return (
                <div className="flex items-center space-x-2 p-1">
                    <Image
                        src={avatarUrl}
                        alt={`${userName} Avatar`}
                        height={42}
                        width={42}
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
        header: () => <span>User</span>,
    }),
    columnHelper.accessor("email", {
        header: () => <span>Email</span>,
        cell: (info) => <p className=" text-base">{info.getValue()}</p>,
    }),
    columnHelper.accessor("user_type", {
        header: () => <span>User Type</span>,
        cell: (info) => <Badge
            color={getUserTypeBadge(info.getValue())}
            className="capitalize"
        >
            {getUserTypeLabel(info.getValue())}
        </Badge>,
    }),
    // columnHelper.accessor("teams", {
    //     header: () => <span>Team</span>,
    //     cell: (info) => (
    //         <div className="flex">
    //             {info.getValue().map((team) => (
    //                 <div className="-ms-2" key={team.id}>
    //                     <div
    //                         className={`bg-${team.color} text-white border-2 border-white dark:border-darkborder h-10 w-10 flex justify-center items-center text-xl font-medium text-ld rounded-full`}
    //                     >
    //                         {team.text}
    //                     </div>
    //                 </div>
    //             ))}
    //         </div>
    //     ),
    // }),
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
            <></>
        ),
    }),
];

const UserTable = ({ title, className }: { title: string, className: string }) => {
    const [data, setData] = React.useState<TableTypeDense[]>([]);
    const [density, setDensity] = React.useState("md");
    const [isLoading, setIsLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);
    const [pagination, setPagination] = React.useState<PaginatedResponse | null>(null);

    // Fetch users from API
    React.useEffect(() => {
        const fetchUsers = async () => {
            try {
                setIsLoading(true);
                setError(null);

                // You can add query parameters here for filtering
                // Example: ?filter[user_status][0]=inactive&filter[user_status][1]=verifying
                const response = await fetch('/api/users');

                // Parse response once
                const result = await response.json();

                if (!response.ok) {
                    throw new Error(result.message || result.error || 'Failed to fetch users');
                }

                // Type assertion for the paginated response
                const paginatedResult: PaginatedResponse = result;

                // Map backend response to table format based on the API response structure
                const mappedData: TableTypeDense[] = paginatedResult.data.map((user) => ({
                    avatar: user.avatar_url || user.avatar_big || "/images/profile/user-1.jpg",
                    name: user.name || '',
                    email: user.email || '',
                    user_type: user.user_type || '',
                    user_roles: Array.isArray(user.user_roles) ? user.user_roles : [],
                    status: user.user_status || '',
                }));

                setData(mappedData);
                setPagination(paginatedResult);
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
                setError(errorMessage);
                console.error('Error fetching users:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUsers();
    }, []);

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    const handleDownload = () => {
        const headers = [
            "Name",
            "post",
            "pname",
            "status",
            "statuscolor",
            "teams",
        ];
        const rows = data.map((item) => [
            item.name,
            item.email,
            item.user_type,
            item.user_roles?.join(", "),
            item.status,
        ]);

        const csvContent = [
            headers.join(","),
            ...rows.map((e) => e.join(",")),
        ].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "table-data.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleSetting = () => {
        console.log("Setting");
    };

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
        <TitleIconCard title={title} onSetting={handleSetting} className={className} >
            {isLoading && (
                <div className="text-center py-8">
                    <p className="text-gray-600 dark:text-gray-400">Loading users...</p>
                </div>
            )}

            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
                    <p className="text-red-800 dark:text-red-200">Error: {error}</p>
                </div>
            )}

            {!isLoading && !error && (
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
                                                    className={`text-base text-ld font-semibold text-left border-b  border-ld  transition-all duration-200 ${getPadding(
                                                        density
                                                    )}`}
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
                                                        className={`whitespace-nowrap transition-all duration-200 ${getPadding(
                                                            density
                                                        )} text-sm`}
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

                    {pagination && pagination.total > 0 && (
                        <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                            Showing {pagination.from} to {pagination.to} of {pagination.total} users
                        </div>
                    )}
                </>
            )}
        </TitleIconCard>
    );
};

export default UserTable;
