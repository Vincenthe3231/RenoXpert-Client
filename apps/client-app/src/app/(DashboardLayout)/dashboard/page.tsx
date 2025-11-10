
"use client"
import React from "react";
import { useUser } from "@/app/context/UserContext";
import { UserLoadingState } from "@/app/components/UserLoadingState";
import { UserErrorState } from "@/app/components/UserErrorState";
import { Button } from "flowbite-react";

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
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

            {user ? (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                    <h2 className="text-2xl font-semibold mb-4">Welcome, {user.name}!</h2>
                    <div className="space-y-2">
                        <p><strong>Email:</strong> {user.email}</p>
                        <p><strong>User ID:</strong> {user.id}</p>
                        {user.larksuite_open_id && (
                            <p><strong>LarkSuite Open ID:</strong> {user.larksuite_open_id}</p>
                        )}
                        {user.larksuite_union_id && (
                            <p><strong>LarkSuite Union ID:</strong> {user.larksuite_union_id}</p>
                        )}
                        {user.email_verified_at && (
                            <p><strong>Email Verified:</strong> {new Date(user.email_verified_at).toLocaleDateString()}</p>
                        )}
                    </div>
                    <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <p className="text-green-800 dark:text-green-200">
                            ✅ Successfully authenticated with Laravel backend!
                        </p>
                    </div>
                    <div className="mt-4">
                        <button
                            onClick={async () => {
                                await logout();
                                window.location.href = '/login';
                            }}
                            className="bg-error text-white px-4 py-2 rounded-md hover:bg-lighterror transition-colors"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            ) : (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                    <h2 className="text-2xl font-semibold mb-4">Welcome to Modernize</h2>
                    <p className="text-gray-600 dark:text-gray-300">
                        Please log in to access your dashboard.
                    </p>
                    <div className="mt-4">
                        <Button
                            type="button"
                            color={"primary"}
                            className="inline-block rounded-md"
                            onClick={() => {
                                window.location.href = '/login';
                            }}
                        >
                            Go to Login
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default page;
