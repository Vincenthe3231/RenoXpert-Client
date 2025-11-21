"use client"
import React from "react";
import { useUser } from "@/app/context/UserContext";
import { UserLoadingState } from "@/app/components/UserLoadingState";
import CardBox from "@/app/components/shared/CardBox";
import { XCircle, AlertCircle } from "lucide-react";
import { Button } from "flowbite-react";
import { useRouter } from "next/navigation";

export default function RejectedPage() {
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
                    <XCircle className="w-20 h-20 text-red-500" />
                </div>
                <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
                    Account Rejected
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Unfortunately, your account application has been rejected. If you believe this is an error, please contact support.
                </p>
                {user && (
                    <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 mb-6">
                        <p className="text-sm text-red-800 dark:text-red-200">
                            <strong>Email:</strong> {user.email}
                        </p>
                        <p className="text-sm text-red-800 dark:text-red-200 mt-2">
                            <strong>Name:</strong> {user.name}
                        </p>
                    </div>
                )}
                <div className="space-y-3">
                    <Button
                        color="primary"
                        className="w-full"
                        onClick={handleLogout}
                    >
                        Return to Login
                    </Button>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Need help? Contact support at support@example.com
                    </p>
                </div>
            </CardBox>
        </div>
    );
}