"use client";
import React, { useState } from "react";
import TitleSelectionCard from "@/app/components/shared/TitleSelectionCard";
import StaffTable from "./StaffTable";
import OwnerTable from "./OwnerTable";
import { Staff, User } from "@/lib/schemas";

interface StaffPaginatedResponse {
    current_page: number;
    data: Staff[];
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

interface OwnerPaginatedResponse {
    current_page: number;
    data: User[];
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

const userTypeOptions = [
    { value: "staff", label: "Staff Table" },
    { value: "owner", label: "Owner Table" },
];

interface UserTableProps {
    title: string;
    className: string;
    staffList?: StaffPaginatedResponse;
    ownerList?: OwnerPaginatedResponse;
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
    const [selectedUserType, setSelectedUserType] = useState("staff");

    return (
        <TitleSelectionCard
            selectPlaceholder="Select a table type"
            selectOptions={userTypeOptions}
            selectValue={selectedUserType}
            onSelectChange={setSelectedUserType}
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
