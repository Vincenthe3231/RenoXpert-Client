"use client"

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Search, Download } from "lucide-react";
import { Card } from '@/components/ui/card'
import InputPlaceholderAnimate from '@/app/components/animatedComponents/AnimatedInputPlaceholder';
import { useMemo, useState, useEffect } from "react";
import UserFilters from "./components/UserFilters";
import { useUsers } from "@/lib/api/auth/auth.hooks";
import type { UserStatus, UserType, GetUsersParams } from "@/lib/api/auth/auth.schemas";
import UserTable from "./components/UserTable";

const UsersPage = () => {
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [typeFilter, setTypeFilter] = useState<string>("staff");
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");

    // Debounce search query to avoid excessive API calls
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery);
        }, 500); // Wait 500ms after user stops typing

        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Build filter params for the API
    const filterParams = useMemo<GetUsersParams>(() => {
        const params: GetUsersParams = {};

        if (statusFilter !== "all") {
            params.status = statusFilter as UserStatus;
        }
        // Always include type filter (defaults to "staff")
        params.type = typeFilter as UserType;
        if (debouncedSearchQuery.trim()) {
            params.search = debouncedSearchQuery.trim();
        }

        return params;
    }, [statusFilter, typeFilter, debouncedSearchQuery]);

    const { data: usersData, isLoading, error } = useUsers(filterParams);
    const users = usersData?.data ?? [];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-foreground">All Users</h2>
                    <p className="text-muted-foreground">
                        Manage and monitor all user accounts
                    </p>
                </div>
                <Button variant="default">
                    <Plus size={16} className="mr-2" />
                    Add User
                </Button>
            </div>

            {/* Filters and Search */}
            <Card className="p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    {/* Status Filters */}
                    <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">
                            Filter by Status
                        </p>
                        <UserFilters
                            activeFilter={statusFilter}
                            onFilterChange={setStatusFilter}
                            filterType="status"
                        />
                    </div>

                    {/* Type Filters */}
                    <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">
                            Filter by Type
                        </p>
                        <UserFilters
                            activeFilter={typeFilter}
                            onFilterChange={setTypeFilter}
                            filterType="type"
                        />
                    </div>
                </div>

                {/* Search and Actions */}
                <div className="mt-4 flex flex-col gap-4 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="relative flex-1 sm:max-w-xs">
                        <Search
                            size={18}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                        />
                        <InputPlaceholderAnimate
                            value={searchQuery}
                            onChange={(val: string) => setSearchQuery(val)}
                            placeholders={['Search email...', 'Search name...', 'Search phone...']}
                            className="pl-10"
                        />
                    </div>
                    <Button variant="outline" size="sm">
                        <Download size={16} className="mr-2" />
                        Export
                    </Button>
                </div>
            </Card>

            {/* Users Table */}
            {isLoading ? (
                <div className="space-y-4">
                    <Skeleton className="h-14 rounded-xl" />
                    {Array.from({ length: 5 }).map((_, i) => (
                        <Skeleton key={i} className="h-16 rounded-lg" />
                    ))}
                </div>
            ) : error ? (
                <div className="rounded-xl bg-destructive/10 p-12 text-center">
                    <p className="text-lg font-medium text-destructive">
                        Failed to load users
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">
                        {error.message || "Please try again later"}
                    </p>
                </div>
            ) : users.length > 0 ? (
                <div className="rounded-xl bg-card shadow-card">
                    <UserTable users={users} />
                </div>
            ) : (
                <div className="rounded-xl bg-card p-12 text-center shadow-card">
                    <p className="text-lg font-medium text-muted-foreground">
                        No users found
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Try adjusting your filters or search query
                    </p>
                </div>
            )}

            {/* Pagination Info */}
            {users.length > 0 && (
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>
                        Showing {users.length} of {users?.length || 0} users
                    </span>
                </div>
            )}
        </div>
    )
}

export default UsersPage