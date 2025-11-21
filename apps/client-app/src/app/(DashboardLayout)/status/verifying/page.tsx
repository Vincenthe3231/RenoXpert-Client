"use client"
import React from "react";
import { useUser } from "@/app/context/UserContext";
import { UserLoadingState } from "@/app/components/UserLoadingState";
import CardBox from "@/app/components/shared/CardBox";
import { Clock } from "lucide-react";
import { Button } from "flowbite-react";
import { useRouter } from "next/navigation";

export default function VerifyingPage() {
    const { user, isLoading, logout } = useUser();
    const router = useRouter();

    if (isLoading) {
        return <UserLoadingState message="Loading..." />;
    }

    const handleLogout = async () => {
        await logout();
        router.push("/login");
    };

    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
            <CardBox className="max-w-md w-full p-8 text-center">
                <div className="flex justify-center mb-6">
                    <div className="relative">
                        <Clock className="w-20 h-20 text-yellow-500 animate-pulse" />
                    </div>
                </div>
                <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
                    Account Verification Pending
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Your account is currently being verified by super admin. This process usually takes 24-48 hours.
                </p>
                {user && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6">
                        <p className="text-sm text-blue-800 dark:text-blue-200">
                            <strong>Email:</strong> {user.email}
                        </p>
                        <p className="text-sm text-blue-800 dark:text-blue-200 mt-2">
                            <strong>Name:</strong> {user.name}
                        </p>
                    </div>
                )}
                <div className="space-y-3">
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                        You will be notified once your account has been approved.
                    </div>
                    <Button
                        color="primary"
                        className="w-full"
                        onClick={handleLogout}
                    >
                        Logout
                    </Button>
                </div>
            </CardBox>
        </div>
    );
}