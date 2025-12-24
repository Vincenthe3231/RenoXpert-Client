import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { UserStatus, UserType, StaffRole } from "@/lib/api/auth/auth.schemas";

type UserRole = StaffRole;

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

const roleFilters: { label: string; value: UserRole | "all" }[] = [
    { label: "All", value: "all" },
    { label: "Super Admin", value: "super-admin" },
    { label: "Admin", value: "admin" },
    { label: "Staff", value: "staff" },
];

const typeFilters: { label: string; value: UserType | "all" }[] = [
    { label: "All", value: "all" },
    { label: "Staff", value: "staff" },
    { label: "Owner", value: "owner" },
];

const UserFilters = ({
    activeFilter,
    onFilterChange,
    filterType,
}: UserFiltersProps) => {
    const filters =
        filterType === "status"
            ? statusFilters
            : filterType === "role"
                ? roleFilters
                : typeFilters;

    return (
        <div className="flex flex-wrap gap-2">
            {filters.map((filter) => (
                <Button
                    key={filter.value}
                    variant={activeFilter === filter.value ? "default" : "lightprimary"}
                    size="sm"
                    onClick={() => onFilterChange(filter.value)}
                    className={cn(
                        "rounded-xl",
                        "transition-all",
                        activeFilter === filter.value && "shadow-md"
                    )}
                >
                    {filter.label}
                </Button>
            ))}
        </div>
    );
};

export default UserFilters;
