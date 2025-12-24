"use client"

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Search, Download } from "lucide-react";
import { Card } from '@/components/ui/card'
import InputPlaceholderAnimate from '@/app/components/animatedComponents/AnimatedInputPlaceholder';
import { useState } from "react";
import UserFilters from "./components/UserFilters";

const UsersPage = () => {
    const [searchTerm, setSearchTerm] = useState('')
    // const typeFromUrl = searchParams.get("type") as UserType | null;

  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-foreground">All Users</h2>
                    <p className="text-muted-foreground">
                        Manage and monitor all user accounts
                    </p>
                </div>
                <Button variant="default">
                    <Plus size={16} className="mr-2" />
                    Add User
                </Button>
            </div>

            {/* Filters and Search */}
            <Card className="">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    {/* Status Filters */}
                    <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">
                            Filter by Status
                        </p>
                        <UserFilters
                            activeFilter={statusFilter}
                            onFilterChange={setStatusFilter}
                            filterType="status"
                        />
                    </div>

                    {/* Type Filters */}
                    <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">
                            Filter by Type
                        </p>
                        <UserFilters
                            activeFilter={typeFilter}
                            onFilterChange={setTypeFilter}
                            filterType="type"
                        />
                    </div>
                </div>

                {/* Search and Actions */}
                <div className="mt-4 flex flex-col gap-4 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="relative flex-1 sm:max-w-xs">
                        <Search
                            size={18}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                        />
                        {/* <Input
                            placeholder="Search users..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        /> */}
                        <InputPlaceholderAnimate
                            value={searchQuery}
                            onChange={(val: string) => setSearchQuery(val)}
                            placeholders={['Search email...', 'Search name...', 'Search phone...']}
                            className="pl-10"
                        />
                    </div>
                    <Button variant="outline" size="sm">
                        <Download size={16} className="mr-2" />
                        Export
                    </Button>
                </div>
            </Card>
        </div>
    )
}

export default UsersPage