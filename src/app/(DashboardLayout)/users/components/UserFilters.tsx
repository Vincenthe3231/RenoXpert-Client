'use client'

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { UserStatus, UserType } from "@/lib/api/auth/auth.schemas";
import { useRoles } from "@/lib/api/roles/roles.hooks";
import { useMemo } from "react";

interface UserFiltersProps {
    activeFilter: string;
    onFilterChange: (filter: string) => void;
    filterType: "status" | "role" | "type";
}

const statusFilters: { label: string; value: UserStatus | "all" }[] = [
    { label: "All", value: "all" },
    { label: "Active", value: "active" },
    { label: "Verifying", value: "verifying" },
    { label: "Deactivated", value: "deactivated" },
    { label: "Rejected", value: "rejected" },
];

/**
 * Helper to format role name for display
 * Converts "super_admin" -> "Super Admin", "staff" -> "Staff"
 */
function formatRoleName(roleName: string): string {
    return roleName
        .split(/[-_]/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
}

const typeFilters: { label: string; value: UserType }[] = [
    { label: "Staff", value: "staff" },
    { label: "Owner", value: "owner" },
];

const UserFilters = ({
    activeFilter,
    onFilterChange,
    filterType,
}: UserFiltersProps) => {
    // Fetch roles from API
    const { data: rolesData, isLoading: rolesLoading } = useRoles();

    // Build role filters from API data
    const roleFilters = useMemo(() => {
        const allOption = { label: "All", value: "all" as const };
        
        if (rolesLoading || !rolesData?.data) {
            // Fallback to empty array with "All" option while loading
            return [allOption];
        }

        const roleOptions = rolesData.data.map(role => ({
            label: formatRoleName(role.name),
            value: role.name,
        }));

        return [allOption, ...roleOptions];
    }, [rolesData, rolesLoading]);

    const filters =
        filterType === "status"
            ? statusFilters
            : filterType === "role"
                ? roleFilters
                : typeFilters;

    // Get color classes based on filter value and type
    const getFilterColorClasses = (value: string, isActive: boolean) => {
        if (isActive) {
            // Active state - use solid colors
            if (filterType === "status") {
                switch (value) {
                    case "all":
                        return "bg-primary text-white hover:bg-primary/90 border-primary";
                    case "active":
                        return "bg-success text-white hover:bg-success/90 border-success";
                    case "verifying":
                        return "bg-warning text-white hover:bg-warning/90 border-warning";
                    case "deactivated":
                        return "bg-pink-500 text-white hover:bg-pink-600 border-pink-500";
                    case "rejected":
                        return "bg-error text-white hover:bg-error/90 border-error";
                    default:
                        return "bg-primary text-white hover:bg-primary/90 border-primary";
                }
            } else if (filterType === "role") {
                // Use consistent styling for role filters
                // Special handling for common roles, fallback for others
                if (value === "all") {
                    return "bg-primary text-white hover:bg-primary/90 border-primary";
                }
                // Check for super admin variants
                if (value === "super-admin" || value === "super_admin" || value === "superadmin") {
                    return "bg-info text-white hover:bg-info/90 border-info";
                }
                if (value === "admin") {
                    return "bg-blue-600 text-white hover:bg-blue-700 border-blue-600";
                }
                if (value === "staff") {
                    return "bg-gray-600 text-white hover:bg-gray-700 border-gray-600";
                }
                // Default for other roles
                return "bg-primary text-white hover:bg-primary/90 border-primary";
            } else {
                // type filters
                switch (value) {
                    case "staff":
                        return "bg-primary text-white hover:bg-primary/90 border-primary";
                    case "owner":
                        return "bg-secondary text-white hover:bg-secondary/90 border-secondary";
                    default:
                        return "bg-primary text-white hover:bg-primary/90 border-primary";
                }
            }
        } else {
            // Inactive state - use light backgrounds with colored text
            if (filterType === "status") {
                switch (value) {
                    case "all":
                        return "bg-lightprimary text-primary hover:bg-lightprimary/80 border-primary/20";
                    case "active":
                        return "bg-lightsuccess text-success hover:bg-lightsuccess/80 border-success/20";
                    case "verifying":
                        return "bg-lightwarning text-warning hover:bg-lightwarning/80 border-warning/20";
                    case "deactivated":
                        return "bg-pink-500/10 text-pink-500/90 hover:bg-disabled border-pink-500/30";
                    case "rejected":
                        return "bg-lighterror text-error hover:bg-lighterror/80 border-error/20";
                    default:
                        return "bg-lightprimary text-primary hover:bg-lightprimary/80 border-primary/20";
                }
            } else if (filterType === "role") {
                // Use consistent styling for role filters (inactive state)
                if (value === "all") {
                    return "bg-lightprimary text-primary hover:bg-lightprimary/80 border-primary/20";
                }
                // Check for super admin variants
                if (value === "super-admin" || value === "super_admin" || value === "superadmin") {
                    return "bg-lightinfo text-info hover:bg-lightinfo/80 border-info/20";
                }
                if (value === "admin") {
                    return "bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200";
                }
                if (value === "staff") {
                    return "bg-gray-50 text-gray-700 hover:bg-gray-100 border-gray-200";
                }
                // Default for other roles
                return "bg-lightprimary text-primary hover:bg-lightprimary/80 border-primary/20";
            } else {
                // type filters
                switch (value) {
                    case "staff":
                        return "bg-lightprimary text-primary hover:bg-lightprimary/80 border-primary/20";
                    case "owner":
                        return "bg-lightsecondary text-secondary hover:bg-lightsecondary/80 border-secondary/20";
                    default:
                        return "bg-lightprimary text-primary hover:bg-lightprimary/80 border-primary/20";
                }
            }
        }
    };

    return (
        <div className="flex flex-wrap gap-2">
            {filters.map((filter) => {
                const isActive = activeFilter === filter.value;
                const colorClasses = getFilterColorClasses(filter.value, isActive);

                return (
                    <Button
                        key={filter.value}
                        variant="outline"
                        size="sm"
                        onClick={() => onFilterChange(filter.value)}
                        className={cn(
                            "rounded-xl",
                            "transition-all duration-200",
                            "border font-medium",
                            colorClasses,
                            isActive && "shadow-md font-semibold"
                        )}
                    >
                        {filter.label}
                    </Button>
                );
            })}
        </div>
    );
};

export default UserFilters;
