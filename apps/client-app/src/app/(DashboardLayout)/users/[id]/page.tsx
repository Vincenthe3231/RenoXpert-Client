
"use client"

import { Owner, Staff } from "@/lib/schemas";
import { useQuery } from "@tanstack/react-query";
import { Button } from "flowbite-react";
import { ChevronLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { TabItem, Tabs } from 'flowbite-react'
import ProfileSection from "./components/ProfileSection";
import AccountDetail from "./components/AccountDetail";
import StaffInfo from "./components/StaffInfo";
import OwnerInfo from "./components/OwnerInfo";
import AddressDetail from "./components/AddressDetail";
import StaffAccessOverview from "./components/StaffAccessOverview";
import QuickActions from "./components/QuickActions";
import { Icon } from '@iconify/react'
import Link from "next/link";

function page() {
    const router = useRouter();
    const { id } = useParams();
    const { data: user, isLoading, error } = useQuery<Owner | Staff>({
        queryKey: ['user', id],
        queryFn: async () => {
            const response = await fetch(`/api/users/${id}`);
            if (!response.ok) {
                throw new Error('Failed to fetch user');
            }
            return response.json();
        },
    });

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error: {error.message}</div>;

    return (
        <div className="flex flex-col h-[calc(100vh-100px)] space-y-2">
            <div className="flex justify-between flex-shrink-0">
                <div className="flex gap-2 items-center mb-6">
                    <Button color="ghost" size="icon" className="text-xs" onClick={() => router.back()}><ChevronLeft /></Button>
                    <h1 className="text-3xl font-bold">User Detail</h1>
                </div>
                <div className="flex">
                    <Button
                        color={"primary"}
                        className="inline-block rounded-md"
                        as={Link}
                        href={`/users/${id}/edit`}
                    >
                        Update Information
                    </Button>
                </div>
            </div>
            <div className="flex w-full gap-3 flex-1 min-h-0">
                <div className="flex flex-col gap-3 flex-[5]">
                    <ProfileSection user={user as Owner | Staff} />

                    <Tabs aria-label='Tabs with underline' variant='underline'>
                        {user?.userType === 'staff' &&
                            <TabItem
                                active
                                title='Info'
                                icon={() => <Icon icon='solar:shield-user-outline' height={20} />}
                            >
                                <StaffInfo user={user as Staff} />
                            </TabItem>
                        }
                        {user?.userType === 'owner' &&
                            <TabItem
                                title='Info'
                                icon={() => <Icon icon='solar:shield-user-outline' height={20} />}
                            >
                                <OwnerInfo user={user as Owner} />
                            </TabItem>
                        }
                        {user?.userType === 'owner' &&
                            <TabItem
                                title='Address'
                                icon={() => <Icon icon='solar:map-point-outline' height={20} />}
                            >
                                <AddressDetail user={user as Owner} />
                            </TabItem>
                        }
                        <TabItem
                            title='Account'
                            icon={() => <Icon icon='solar:user-outline' height={20} />}
                        >
                            <AccountDetail user={user as Owner | Staff} />
                        </TabItem>
                    </Tabs>
                </div>
                <div className="flex flex-col gap-3 flex-[2]">
                    {user?.userType === 'staff' && <StaffAccessOverview user={user as Staff} />}
                    <QuickActions />
                </div>
            </div>
        </div>
    )
}

export default page;