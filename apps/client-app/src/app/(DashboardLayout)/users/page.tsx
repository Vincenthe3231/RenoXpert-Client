
"use client"
import React from "react";
import { useUser } from "@/app/context/UserContext";
import { UserLoadingState } from "@/app/components/UserLoadingState";
import { UserErrorState } from "@/app/components/UserErrorState";
import { Button } from "flowbite-react";
import UserTable from "./tables/UserTable";
import CardBox from "@/app/components/shared/CardBox";
import TitleBorderCard from "@/app/components/shared/TitleBorderCard";
import OutlineCard from "@/app/components/shared/OutlineCard";

const page = () => {
    const { user, isLoading, error, logout, refreshUser, clearError } = useUser();

    if (isLoading) {
        return <UserLoadingState message="Loading dashboard..." />;
    }

    if (error) {
        return (
            <UserErrorState
                error={error}
                onRetry={refreshUser}
                onClearError={clearError}
            />
        );
    }

    return (
        <div className="flex flex-col h-[calc(100vh-170px)] space-y-2">
            <div className="flex justify-between flex-shrink-0">
                <h1 className="text-3xl font-bold mb-6">User Management</h1>
                <div className="flex">
                    <Button color={"primary"} className="inline-block rounded-md">Add User</Button>
                </div>
            </div>
            <div className="flex w-full gap-3 flex-1 min-h-0">
                <div className="flex flex-col gap-3 flex-[5] min-h-0">
                    <div className="flex gap-3 flex-shrink-0">
                        <CardBox className={`shadow-none bg-info dark:bg-darkinfo w-full`}>
                            <div className="text-center">
                                <div className="flex flex-col justify-center">
                                    <p className={`font-semibold text-white mb-1`}>
                                        Owners
                                    </p>
                                    <h5 className={`text-lg font-semibold text-white mb-0`}>125</h5>
                                </div>
                            </div>
                        </CardBox>
                        <CardBox className={`shadow-none bg-orange-400 dark:bg-orange-300 w-full`}>
                            <div className="text-center">
                                <div className="flex flex-col justify-center">
                                    <p className={`font-semibold text-white mb-1`}>
                                        Internal
                                    </p>
                                    <h5 className={`text-lg font-semibold text-white mb-0`}>23</h5>
                                </div>
                            </div>
                        </CardBox>
                        <CardBox className={`shadow-none bg-warning dark:bg-warning w-full`}>
                            <div className="text-center">
                                <div className="flex flex-col justify-center">
                                    <p className={`font-semibold text-white mb-1`}>
                                        Onboarding
                                    </p>
                                    <h5 className={`text-lg font-semibold text-white mb-0`}>6</h5>
                                </div>
                            </div>
                        </CardBox>
                    </div>
                    <div className="flex-1 min-h-0 overflow-hidden">
                        <UserTable title="Users Table" className="h-full" />
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
