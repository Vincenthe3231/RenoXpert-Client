"use client";
import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import TitleSelectionCard from "@/app/components/shared/TitleSelectionCard";
import StaffTable from "./StaffTable";
import OwnerTable from "./OwnerTable";
import { Owner, PaginatedResponse, Staff } from "@/lib/schemas";

const userTypeOptions = [
    { value: "staff", label: "Staff Table" },
    { value: "owner", label: "Owner Table" },
];

interface UserTableProps {
    title: string;
    className: string;
    staffList?: PaginatedResponse<Staff>;
    ownerList?: PaginatedResponse<Owner>;
    isStaffLoading: boolean;
    isOwnerLoading: boolean;
    staffError: Error | null;
    ownerError: Error | null;
    isStaffError: boolean;
    isOwnerError: boolean;
}

const UserTable = ({
    title,
    className,
    staffList,
    ownerList,
    isStaffLoading,
    isOwnerLoading,
    staffError,
    ownerError,
    isStaffError,
    isOwnerError
}: UserTableProps) => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    // Get table type from URL or default to "staff"
    const tableTypeFromUrl = searchParams.get("table") || "staff";
    const [selectedUserType, setSelectedUserType] = useState(tableTypeFromUrl);

    // Sync state with URL when URL changes (e.g., browser back/forward)
    useEffect(() => {
        const urlTableType = searchParams.get("table") || "staff";
        setSelectedUserType(urlTableType);
    }, [searchParams]);

    // Update URL when selection changes
    const handleTableTypeChange = (value: string) => {
        setSelectedUserType(value);
        const params = new URLSearchParams(searchParams.toString());
        params.set("table", value);
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
    };

    return (
        <TitleSelectionCard
            selectPlaceholder="Select a table type"
            selectOptions={userTypeOptions}
            selectValue={selectedUserType}
            onSelectChange={handleTableTypeChange}
            className={className}
        >
            {selectedUserType === "staff" ? (
                <StaffTable
                    staffList={staffList}
                    isStaffLoading={isStaffLoading}
                    staffError={staffError}
                    isStaffError={isStaffError}
                />
            ) : (
                <OwnerTable
                    ownerList={ownerList}
                    isOwnerLoading={isOwnerLoading}
                    ownerError={ownerError}
                    isOwnerError={isOwnerError}
                />
            )}
        </TitleSelectionCard>
    );
};

export default UserTable;
