
"use client"
import React from "react";
import { useUser } from "@/app/context/UserContext";
import { UserLoadingState } from "@/app/components/UserLoadingState";
import { UserErrorState } from "@/app/components/UserErrorState";
import { Button } from "flowbite-react";
import CardBox from "@/app/components/shared/CardBox";
import OutlineCard from "@/app/components/shared/OutlineCard";
import { useQuery } from "@tanstack/react-query";
import { Onboarding } from "@/lib/schemas";
import OnboardingTable from "./OnboardingTable";
import { CheckCircle, ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";

interface PaginatedResponse {
    current_page: number;
    data: Onboarding[];
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

// TODO:
// 2. Show activity log (future feature)
// 3. In action column, show approve and reject button
// 4. If approve, show the approve modal (with assign user type and roles)
// 5. If rejected, show the reason field

const page = () => {
    const router = useRouter();
    const { data: onboardingList, isLoading: isOnboardingLoading, error: onboardingError, isError: isOnboardingError, refetch: refetchOnboardingList } = useQuery<PaginatedResponse>({
        queryKey: ['onboardingList'],
        queryFn: async () => {
            const response = await fetch('/api/onboarding?filter[status]=pending');

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || error.error || 'Failed to fetch onboarding');
            }

            return response.json();
        },
        staleTime: 60 * 1000, // 1 minute - data is fresh for 1 minute
        refetchOnWindowFocus: false, // Don't refetch when window regains focus
    });

    return (
        <div className="flex flex-col h-[calc(100vh-170px)] space-y-2">
            <div className="flex justify-between flex-shrink-0">
                <div className="flex gap-2 mb-6">
                    <Button color="ghost" size="icon" className="text-xs" onClick={() => router.back()}><ChevronLeft /></Button>
                    <h1 className="text-3xl font-bold">Onboarding Management</h1>
                </div>
                <div className="flex">
                    {/* <Button color={"primary"} className="inline-block rounded-md">Add User</Button> */}
                </div>
            </div>
            <div className="flex w-full gap-3 flex-1 min-h-0">
                <div className="flex flex-col gap-3 flex-[2] min-h-0">
                    <div className="p-[30px] bg-lightprimary dark:bg-lightprimary text-center rounded-md cursor-pointer">
                        <h3 className="text-primary text-2xl">{onboardingList?.total}</h3>
                        <h6 className="text-base text-primary">Onboardings</h6>
                    </div>
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
                <div className="flex flex-col flex-[5]">
                    <OnboardingTable
                        title="Onboarding"
                        className="h-max"
                        onboardingList={onboardingList as PaginatedResponse}
                        isOnboardingLoading={isOnboardingLoading}
                        onboardingError={onboardingError}
                        isOnboardingError={isOnboardingError}
                        refetchOnboardingList={refetchOnboardingList}
                    />
                </div>
            </div>
        </div>
    );
};

export default page;
