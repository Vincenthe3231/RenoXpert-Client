"use client"

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Download } from "lucide-react";
import { Card } from '@/components/ui/card'
import { Input } from "@/components/ui/input";
import { useMemo, useState, useEffect, useCallback } from "react";
import { useQueries } from "@tanstack/react-query";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import UserFilters from "./components/UserFilters";
import { useAuth } from "@/lib/api/auth/auth.hooks";
import { useUnifiedUsers } from "@/lib/api/auth/useUnifiedUsers";
import type { UserStatus, UserType, GetUsersParams } from "@/lib/api/auth/auth.schemas";
import UserTable from "./components/UserTable";

// Status filter options (in order for keyboard navigation)
const STATUS_FILTER_OPTIONS: (UserStatus | "all")[] = ["all", "active", "verifying", "deactivated", "rejected"];

const UsersPage = () => {
    const { data: currentUser } = useAuth();
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();
    
    const [statusFilter, setStatusFilter] = useState<string>("all");
    // Get initial type filter from URL or default to "staff" for admin/super-admin, "owner" for staff users
    const typeFilterFromUrl = searchParams.get("type");
    const [typeFilter, setTypeFilter] = useState<string>(typeFilterFromUrl || "staff");
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");

    // Helper function to check if user has required role
    const hasRequiredRole = useCallback((requiredRole: 'super-admin' | 'admin' | 'staff' | undefined): boolean => {
        if (!requiredRole) return true;
        if (!currentUser || !currentUser.profile) return false;

        const userRoles = (currentUser.profile as any).roles || [];
        const normalizedUserRoles = userRoles.map((role: string) => {
            if (typeof role !== 'string') return '';
            return role.toLowerCase().trim().replace(/\s+/g, '-').replace(/_/g, '-');
        }).filter((role: string) => role.length > 0);
        
        const normalizedRequired = requiredRole.toLowerCase();

        if (normalizedUserRoles.includes(normalizedRequired)) {
            return true;
        }

        const isSuperAdmin = normalizedUserRoles.some((role: string) => 
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
        const userRoles = (currentUser.profile as any).roles || [];
        const normalizedUserRoles = userRoles.map((role: string) => {
            if (typeof role !== 'string') return '';
            return role.toLowerCase().trim().replace(/\s+/g, '-').replace(/_/g, '-');
        }).filter((role: string) => role.length > 0);
        
        const isSuperAdmin = normalizedUserRoles.some((role: string) => 
            role === 'super-admin' || role === 'superadmin'
        );
        const isAdmin = normalizedUserRoles.includes('admin');
        
        // Staff if they have staff role but not admin or super-admin
        return normalizedUserRoles.includes('staff') && !isAdmin && !isSuperAdmin;
    }, [currentUser]);

    // Sync typeFilter with URL when URL changes (e.g., browser back/forward) or when isStaff changes
    useEffect(() => {
        // For staff users, always use "owner" and update URL if needed
        if (isStaff) {
            const params = new URLSearchParams(searchParams.toString());
            const currentUrlType = params.get("type");
            if (currentUrlType !== "owner") {
                params.set("type", "owner");
                router.replace(`${pathname}?${params.toString()}`, { scroll: false });
            }
            setTypeFilter("owner");
        } else {
            // For admin/super-admin, sync with URL or default to "staff"
            const urlTypeFilter = searchParams.get("type") || "staff";
            setTypeFilter(urlTypeFilter);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams, isStaff]);

    // Update URL when typeFilter changes (only for admin/super-admin)
    const handleTypeFilterChange = useCallback((value: string) => {
        setTypeFilter(value);
        const params = new URLSearchParams(searchParams.toString());
        params.set("type", value);
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
    }, [searchParams, router, pathname]);

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

    // Determine if staff is filtering for owners/vendors (for phone number enrichment)
    const isStaffFilteringOwners = isStaff && filterParams.type === 'owner';
    const isStaffFilteringVendors = isStaff && filterParams.type === 'vendor';
    const isStaffFiltering = isStaffFilteringOwners || isStaffFilteringVendors;

    // Use unified hook that automatically handles role-based endpoint selection
    // The hook internally selects the correct endpoint (users/owners/vendors) based on user role
    const { data: unifiedUsersData, isLoading, error } = useUnifiedUsers(filterParams);
    const users = unifiedUsersData?.data ?? [];
    
    // For owners/vendors missing phone numbers, fetch individual details to get complete data
    // This is needed because the owners/vendors list endpoint may not include phone_no/country_code
    const ownersOrVendorsMissingPhone = useMemo(() => {
        if (!isStaffFiltering) return []
        return users.filter((user: any) => 
            (user.userType === 'owner' || user.userType === 'vendor') && 
            (!user.phoneNo || !user.countryCode) && 
            user.uuid
        )
    }, [users, isStaffFiltering])
    
    // Fetch individual owner/vendor details for missing phone numbers using useQueries
    // Note: For now, vendors will use the same pattern as owners
    // If you create a getVendor function later, update this to use it
    const ownerOrVendorDetailQueries = useQueries({
        queries: ownersOrVendorsMissingPhone.map((user: any) => ({
            queryKey: [user.userType === 'owner' ? 'owner' : 'vendor', user.uuid],
            queryFn: async () => {
                const { getOwner } = await import('@/lib/api/auth/auth')
                // For now, vendors use the same endpoint pattern as owners
                // If backend has a separate /api/vendors/{id} endpoint, create getVendor function
                if (user.userType === 'owner') {
                    return getOwner(user.uuid)
                } else {
                    // For vendors, we'll use getOwner pattern for now
                    // TODO: Create getVendor function if backend has separate endpoint
                    return getOwner(user.uuid)
                }
            },
            enabled: !!user.uuid,
            staleTime: 0, // Always fetch fresh data
        })),
    })
    
    // Create a map of enriched owner/vendor data
    const enrichedOwnerOrVendorMap = useMemo(() => {
        const map = new Map()
        ownerOrVendorDetailQueries.forEach((query, index) => {
            if (query.data && ownersOrVendorsMissingPhone[index]) {
                map.set(ownersOrVendorsMissingPhone[index].uuid, query.data)
            }
        })
        return map
    }, [ownerOrVendorDetailQueries, ownersOrVendorsMissingPhone])
    
    // Enrich owners/vendors list with phone numbers from individual queries
    const enrichedUsers = useMemo(() => {
        if (!isStaffFiltering) return users
        
        return users.map((user: any) => {
            if (user.userType !== 'owner' && user.userType !== 'vendor') return user
            
            // Check if we have enriched data for this owner/vendor
            const enrichedData = enrichedOwnerOrVendorMap.get(user.uuid)
            
            // If we have enriched data with phone number, use it
            if (enrichedData && (!user.phoneNo || !user.countryCode)) {
                return {
                    ...user,
                    phoneNo: enrichedData.phoneNo ?? user.phoneNo,
                    countryCode: enrichedData.countryCode ?? user.countryCode,
                }
            }
            
            return user
        })
    }, [users, isStaffFiltering, enrichedOwnerOrVendorMap])
    
    // Use enriched users for owners/vendors, regular users for staff
    const finalUsers = isStaffFiltering ? enrichedUsers : users;

    // Determine effective type for dynamic header
    const effectiveType = useMemo(() => {
        return (filterParams.type || 'staff') as UserType
    }, [filterParams.type])

    // Dynamic header text based on type
    const headingLabel = useMemo(() => {
        switch (effectiveType) {
            case 'owner':
                return 'All Owners'
            case 'vendor':
                return 'All Vendors'
            default:
                return 'All Staffs'
        }
    }, [effectiveType])

    const headingDescription = useMemo(() => {
        switch (effectiveType) {
            case 'owner':
                return 'Manage and monitor all owner accounts'
            case 'vendor':
                return 'Manage and monitor all vendor accounts'
            default:
                return 'Manage and monitor all user accounts'
        }
    }, [effectiveType])

    const userCountLabel = useMemo(() => {
        switch (effectiveType) {
            case 'owner':
                return 'owners'
            case 'vendor':
                return 'vendors'
            default:
                return 'users'
        }
    }, [effectiveType])

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold text-foreground">{headingLabel}</h2>
                <p className="text-muted-foreground mt-1">
                    {headingDescription}
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
                                onFilterChange={handleTypeFilterChange}
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
                    <UserTable users={finalUsers} isStaff={isStaff} />
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
            {finalUsers.length > 0 && (
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>
                        Showing {finalUsers.length} of {unifiedUsersData?.meta?.total || finalUsers.length} {userCountLabel}
                    </span>
                </div>
            )}
        </div>
    )
}

export default UsersPage