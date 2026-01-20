"use client"

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Download } from "lucide-react";
import { Card } from '@/components/ui/card'
import { Input } from "@/components/ui/input";
import { useMemo, useState, useEffect, useCallback } from "react";
import UserFilters from "./components/UserFilters";
import { useUsers, useAuth, useOwners } from "@/lib/api/auth/auth.hooks";
import type { UserStatus, UserType, GetUsersParams } from "@/lib/api/auth/auth.schemas";
import UserTable from "./components/UserTable";

// Status filter options (in order for keyboard navigation)
const STATUS_FILTER_OPTIONS: (UserStatus | "all")[] = ["all", "active", "verifying", "deactivated", "rejected"];

const UsersPage = () => {
    const { data: currentUser } = useAuth();
    const [statusFilter, setStatusFilter] = useState<string>("all");
    // For staff users, default to "owner" and don't allow changing
    const [typeFilter, setTypeFilter] = useState<string>("owner");
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");

    // Helper function to check if user has required role
    const hasRequiredRole = useCallback((requiredRole: 'super-admin' | 'admin' | 'staff' | undefined): boolean => {
        if (!requiredRole) return true;
        if (!currentUser || !currentUser.profile) return false;

        const userRoles = currentUser.profile.roles || [];
        const normalizedUserRoles = userRoles.map(role => {
            if (typeof role !== 'string') return '';
            return role.toLowerCase().trim().replace(/\s+/g, '-').replace(/_/g, '-');
        }).filter(role => role.length > 0);
        
        const normalizedRequired = requiredRole.toLowerCase();

        if (normalizedUserRoles.includes(normalizedRequired)) {
            return true;
        }

        const isSuperAdmin = normalizedUserRoles.some(role => 
            role === 'super-admin' || role === 'superadmin'
        );
        
        if (isSuperAdmin) {
            return true;
        }

        if (normalizedRequired === 'admin' || normalizedRequired === 'staff') {
            if (normalizedUserRoles.includes('admin')) {
                return true;
            }
        }

        if (normalizedRequired === 'staff') {
            if (normalizedUserRoles.includes('staff')) {
                return true;
            }
        }

        return false;
    }, [currentUser]);

    // Check if current user is staff (not admin or super-admin)
    const isStaff = useMemo(() => {
        if (!currentUser || !currentUser.profile) return false;
        const userRoles = currentUser.profile.roles || [];
        const normalizedUserRoles = userRoles.map(role => {
            if (typeof role !== 'string') return '';
            return role.toLowerCase().trim().replace(/\s+/g, '-').replace(/_/g, '-');
        }).filter(role => role.length > 0);
        
        const isSuperAdmin = normalizedUserRoles.some(role => 
            role === 'super-admin' || role === 'superadmin'
        );
        const isAdmin = normalizedUserRoles.includes('admin');
        
        // Staff if they have staff role but not admin or super-admin
        return normalizedUserRoles.includes('staff') && !isAdmin && !isSuperAdmin;
    }, [currentUser]);

    // Debounce search query to avoid excessive API calls
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery);
        }, 500); // Wait 500ms after user stops typing

        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Helper function to navigate filters
    const navigateFilter = useCallback((direction: 'prev' | 'next') => {
        setStatusFilter((currentFilter) => {
            const currentIndex = STATUS_FILTER_OPTIONS.indexOf(currentFilter as UserStatus | "all")
            if (currentIndex === -1) {
                // If current filter is not found, default to first
                return STATUS_FILTER_OPTIONS[0]
            } else {
                if (direction === 'prev') {
                    // Wrap to last if at first index
                    const previousIndex = currentIndex === 0
                        ? STATUS_FILTER_OPTIONS.length - 1
                        : currentIndex - 1
                    return STATUS_FILTER_OPTIONS[previousIndex]
                } else {
                    // Wrap to first if at last index
                    const nextIndex = currentIndex === STATUS_FILTER_OPTIONS.length - 1
                        ? 0
                        : currentIndex + 1
                    return STATUS_FILTER_OPTIONS[nextIndex]
                }
            }
        })
    }, [])

    // Keyboard shortcuts for filter navigation (A = left/previous, D = right/next)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Don't trigger if user is typing in an input/textarea/contenteditable
            const target = e.target as HTMLElement
            if (
                target instanceof HTMLInputElement ||
                target instanceof HTMLTextAreaElement ||
                target.isContentEditable
            ) {
                return
            }

            // Check if modifier keys are pressed (we want only A or D, no modifiers)
            if (e.ctrlKey || e.metaKey || e.altKey || e.shiftKey) {
                return
            }

            const key = e.key.toLowerCase()

            // A key - navigate to previous filter (left direction)
            if (key === 'a') {
                e.preventDefault()
                navigateFilter('prev')
            }

            // D key - navigate to next filter (right direction)
            if (key === 'd') {
                e.preventDefault()
                navigateFilter('next')
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [navigateFilter])

    // Listen for custom events from CommandPalette
    useEffect(() => {
        const handleFilterPrev = () => navigateFilter('prev')
        const handleFilterNext = () => navigateFilter('next')

        window.addEventListener('filter-nav-prev', handleFilterPrev)
        window.addEventListener('filter-nav-next', handleFilterNext)

        return () => {
            window.removeEventListener('filter-nav-prev', handleFilterPrev)
            window.removeEventListener('filter-nav-next', handleFilterNext)
        }
    }, [navigateFilter])

    // Build filter params for the API
    const filterParams = useMemo<GetUsersParams>(() => {
        const params: GetUsersParams = {};

        if (statusFilter !== "all") {
            params.status = statusFilter as UserStatus;
        }
        // For staff users, always filter by "owner", otherwise use selected typeFilter
        params.type = (isStaff ? "owner" : typeFilter) as UserType;
        if (debouncedSearchQuery.trim()) {
            params.search = debouncedSearchQuery.trim();
        }

        return params;
    }, [statusFilter, typeFilter, debouncedSearchQuery, isStaff]);

    // Staff users must use /api/owners endpoint (they don't have permission for /api/auth/users)
    // Admin and super-admin continue using /api/auth/users endpoint (unchanged)
    const isStaffFilteringOwners = isStaff && filterParams.type === 'owner';
    
    // Only call useOwners when staff is filtering for owners
    const { data: ownersData, isLoading: isOwnersLoading, error: ownersError } = useOwners(
        isStaffFilteringOwners ? filterParams : undefined
    );
    
    // Admin and super-admin always use useUsers (unchanged)
    // Staff users also use useUsers when NOT filtering for owners (though this shouldn't happen due to UI lock)
    const { data: usersData, isLoading: isUsersLoading, error: usersError } = useUsers(
        !isStaffFilteringOwners ? filterParams : undefined
    );
    
    // Use owners data for staff filtering owners, users data otherwise (admin/super-admin)
    const usersDataFinal = isStaffFilteringOwners ? ownersData : usersData;
    const isLoading = isStaffFilteringOwners ? isOwnersLoading : isUsersLoading;
    const error = isStaffFilteringOwners ? ownersError : usersError;
    const users = usersDataFinal?.data ?? [];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold text-foreground">All Users</h2>
                <p className="text-muted-foreground mt-1">
                    Manage and monitor all user accounts
                </p>
            </div>

            {/* Filters and Search */}
            <Card className="p-5 rounded-full shadow-card transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-xl">
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

                    {/* Type Filters - Only show if not staff */}
                    {!isStaff && (
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
                    )}
                </div>

                {/* Search and Actions */}
                <div className="mt-4 flex flex-col gap-4 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="relative flex-1 sm:max-w-xs isolate">
                        <Search
                            size={18}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground z-20 pointer-events-none"
                        />
                        <Input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search email, name, phone..."
                            className="pl-10 relative z-10"
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
                    <Skeleton className="h-14 rounded-xl bg-muted/10" />
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
                <div className="rounded-full bg-card shadow-card">
                    <UserTable users={users} isStaff={isStaff} />
                </div>
            ) : (
                <div className="rounded-full bg-card p-12 text-center shadow-card">
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
                        Showing {users.length} of {usersDataFinal?.meta?.total || users.length} users
                    </span>
                </div>
            )}
        </div>
    )
}

export default UsersPage