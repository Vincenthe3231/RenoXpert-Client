
"use client"
import React, { useState } from "react";
import { Button, Tooltip } from "flowbite-react";
import UserTable from "./tables/UserTable";
import OutlineCard from "@/app/components/shared/OutlineCard";
import { useQuery } from "@tanstack/react-query";
import { Owner, PaginatedResponse, Staff } from "@/lib/schemas";
import Link from "next/link";
import { useStaffType } from "@/hooks/use-staff-type";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { IconBuildingStore, IconUsers } from "@tabler/icons-react";
import { useRouter } from "next/navigation";

const AddUserModal = ({ open, setOpen }: { open: boolean, setOpen: (open: boolean) => void }) => {
    const router = useRouter();

    const handleOwnerClick = () => {
        setOpen(false);
        router.push('/users/create-owner');
    };

    return (
        <Dialog transition open={open} onClose={() => setOpen(false)} className={'fixed inset-0 flex w-screen items-center justify-center bg-black/60 p-4 transition duration-300 ease-out data-[closed]:opacity-0 z-50'}>
            <div className='fixed inset-0 z-50 w-screen overflow-y-auto'>
                <div className='flex min-h-full items-center justify-center p-4'>
                    <DialogPanel className='w-full max-w-xl rounded-lg bg-white dark:bg-slate-600 p-6 shadow-md dark:dark-shadow-md'>
                        <DialogTitle className='text-xl font-semibold mb-2 text-gray-900 dark:text-white'>Add User</DialogTitle>
                        <p className='text-gray-600 dark:text-gray-300 mb-6'>Select a user type to be created</p>

                        <div className='grid grid-cols-2 gap-4'>
                            <button
                                className='group flex flex-col items-center justify-center p-8 border-1 border-gray-300 dark:border-gray-500 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors'
                                onClick={handleOwnerClick}
                            >
                                <IconUsers className='text-5xl mb-3 transition-transform group-hover:scale-130' />
                                <span className='text-lg font-medium text-gray-900 dark:text-white'>Owner</span>
                            </button>

                            <Tooltip content='Vendor selection is not available yet' placement='top'>
                                <button
                                    disabled
                                    className='group w-full flex flex-col items-center justify-center p-8 border-1 border-gray-300 dark:border-gray-500 rounded-lg opacity-50 cursor-not-allowed transition-colors'
                                    onClick={() => {/* Handle Vendor selection */ }}
                                >
                                    <IconBuildingStore className='text-5xl mb-3' />
                                    <span className='text-lg font-medium text-gray-900 dark:text-white'>Vendor</span>
                                </button>
                            </Tooltip>
                        </div>
                    </DialogPanel>
                </div>
            </div>
        </Dialog>
    )
}

const page = () => {
    const { isSuperAdmin } = useStaffType();
    const [open, setOpen] = useState(false);
    const { data: staffList, isLoading: isStaffLoading, error: staffError, isError: isStaffError } = useQuery<PaginatedResponse<Staff>>({
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

    const { data: ownerList, isLoading: isOwnerLoading, error: ownerError, isError: isOwnerError } = useQuery<PaginatedResponse<Owner>>({
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

    const { data: verifyingStaffList } = useQuery<PaginatedResponse<Staff>>({
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
                    <Button
                        color={"primary"}
                        className="inline-block rounded-md"
                        onClick={() => {
                            setOpen(true);
                        }}
                    >
                        Add User
                    </Button>
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
                                <h3 className="text-primary text-2xl">{ownerList?.meta.total || "-"}</h3>
                                <h6 className="text-base text-primary">Owners</h6>
                            </div>
                        </div>
                        <div className="lg:col-span-4 md:col-span-6  col-span-12">
                            <div
                                className="p-[30px] bg-lightwarning dark:bg-lightwarning text-center rounded-md cursor-pointer"
                            // onClick={() => setFilter('Pending')}
                            >
                                <h3 className="text-warning text-2xl">{staffList?.meta.total || "-"}</h3>
                                <h6 className="text-base text-warning">Internal Staff</h6>
                            </div>
                        </div>
                        <div className="lg:col-span-4 md:col-span-6  col-span-12">
                            <div
                                className="p-[30px] bg-lightsuccess dark:bg-lightsuccess text-center rounded-md cursor-pointer"
                            // onClick={() => setFilter('Open')}
                            >
                                <h3 className="text-success text-2xl">{verifyingStaffList?.meta.total || "-"}</h3>
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

            <AddUserModal open={open} setOpen={setOpen} />
        </div>
    );
};

export default page;
