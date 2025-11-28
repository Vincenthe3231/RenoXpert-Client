
"use client"
import React from "react";
import { Button } from "flowbite-react";
import UserTable from "./tables/UserTable";
import OutlineCard from "@/app/components/shared/OutlineCard";
import { useQuery } from "@tanstack/react-query";
import { Owner, Staff, User } from "@/lib/schemas";
import Link from "next/link";
import { useStaffType } from "@/hooks/use-staff-type";

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
    data: Owner[];
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

const page = () => {
    const { isSuperAdmin } = useStaffType();

    const { data: staffList, isLoading: isStaffLoading, error: staffError, isError: isStaffError } = useQuery<StaffPaginatedResponse>({
        queryKey: ['staffList'],
        queryFn: async () => {
            const response = await fetch('/api/staff');

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || error.error || 'Failed to fetch users');
            }

            return response.json();
        },
        staleTime: 60 * 1000,
        refetchOnWindowFocus: false,
    });

    const { data: ownerList, isLoading: isOwnerLoading, error: ownerError, isError: isOwnerError } = useQuery<OwnerPaginatedResponse>({
        queryKey: ['ownerList'],
        queryFn: async () => {
            const response = await fetch('/api/owners');

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || error.error || 'Failed to fetch owners');
            }

            return response.json();
        },
        staleTime: 60 * 1000,
        refetchOnWindowFocus: false,
    });

    const { data: verifyingStaffList } = useQuery<StaffPaginatedResponse>({
        queryKey: ['staffList', 'verifying'],
        queryFn: async () => {
            const response = await fetch('/api/staff?filter[status]=verifying');

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || error.error || 'Failed to fetch verifying staff');
            }

            return response.json();
        },
        staleTime: 60 * 1000,
        refetchOnWindowFocus: false,
    });

    return (
        <div className="flex flex-col h-[calc(100vh-100px)] space-y-2">
            <div className="flex justify-between flex-shrink-0">
                <h1 className="text-3xl font-bold mb-6">User Management</h1>
                <div className="flex gap-2">
                    <Button color={"primary"} className="inline-block rounded-md">Add User</Button>
                    {isSuperAdmin && (
                        <Button
                            color={"info"}
                            className="inline-block rounded-md items-center"
                            as={Link}
                            href="/users/onboarding"
                        >
                            Onboarding Management
                        </Button>
                    )}
                </div>
            </div>
            <div className="flex w-full gap-3 flex-1 min-h-0">
                <div className="flex flex-col gap-3 flex-[5]">
                    <div className="grid grid-cols-12 gap-6">
                        <div className="lg:col-span-4 md:col-span-6  col-span-12">
                            <div
                                className="p-[30px] bg-lightprimary dark:bg-lightprimary text-center rounded-md cursor-pointer"
                            // onClick={() => setFilter('total_tickets')}
                            >
                                <h3 className="text-primary text-2xl">{ownerList?.total || "-"}</h3>
                                <h6 className="text-base text-primary">Owners</h6>
                            </div>
                        </div>
                        <div className="lg:col-span-4 md:col-span-6  col-span-12">
                            <div
                                className="p-[30px] bg-lightwarning dark:bg-lightwarning text-center rounded-md cursor-pointer"
                            // onClick={() => setFilter('Pending')}
                            >
                                <h3 className="text-warning text-2xl">{staffList?.total || "-"}</h3>
                                <h6 className="text-base text-warning">Internal Staff</h6>
                            </div>
                        </div>
                        <div className="lg:col-span-4 md:col-span-6  col-span-12">
                            <div
                                className="p-[30px] bg-lightsuccess dark:bg-lightsuccess text-center rounded-md cursor-pointer"
                            // onClick={() => setFilter('Open')}
                            >
                                <h3 className="text-success text-2xl">{verifyingStaffList?.total || "-"}</h3>
                                <h6 className="text-base text-success">Onboarding</h6>
                            </div>
                        </div>
                    </div>
                    <div className="flex-1 min-h-0 overflow-hidden">
                        <UserTable
                            title="Users Table"
                            className="h-full"
                            staffList={staffList}
                            ownerList={ownerList}
                            isStaffLoading={isStaffLoading}
                            isOwnerLoading={isOwnerLoading}
                            staffError={staffError}
                            ownerError={ownerError}
                            isStaffError={isStaffError}
                            isOwnerError={isOwnerError}
                        />
                    </div>
                </div>
                <div className="flex flex-col flex-[2]">
                    <OutlineCard className="h-full">
                        <div className="sm:flex items-center justify-between mb-6">
                            <div>
                                <h5 className="card-title">Activity</h5>
                                <p className="card-subtitle">Recent activity</p>
                            </div>
                            <div className="sm:mt-0 mt-4">

                            </div>
                        </div>
                    </OutlineCard>
                </div>
            </div>
        </div>
    );
};

export default page;
