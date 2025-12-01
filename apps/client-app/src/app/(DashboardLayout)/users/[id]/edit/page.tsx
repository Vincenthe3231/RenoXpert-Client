"use client"

import { EditOwnerInput, EditStaffInput, Owner, Staff } from "@/lib/schemas";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "flowbite-react";
import {
    ChevronLeft,
    Save,
    X,
    User,
    Mail,
    Phone,
    Globe,
    Shield,
    MapPin,
    Building,
    FileText,
    Loader2,
    AlertCircle
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { editStaffSchema, editOwnerSchema } from "@/lib/schemas";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/app/components/shadcn-ui/Default-Ui/form";
import { Input } from "@/app/components/shadcn-ui/Default-Ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/shadcn-ui/Default-Ui/select";
import CardBox from "@/app/components/shared/CardBox";
import { CardContent, CardHeader, CardTitle, CardDescription } from "@/app/components/shadcn-ui/Default-Ui/card";
import { formatIC } from "@/utils/format-helpers";

function EditUserPage() {
    const router = useRouter();
    const { id } = useParams();
    const queryClient = useQueryClient();

    // Fetch user data
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

    // Determine if user is staff (needed early for form initialization)
    const isStaff = user?.userType === 'staff';

    // Get initial values
    const getInitialValues = () => {
        if (!user) return undefined;

        if (isStaff) {
            return {
                name: user.name,
                email: user.email,
                staffType: (user as Staff).staffType,
                userType: 'staff' as const,
            } as EditStaffInput;
        } else {
            return {
                name: user.name,
                email: user.email,
                countryCode: user.countryCode || '',
                phoneNo: user.phoneNo || '',
                salutation: user.salutation || '',
                ic: user.ic || '',
                address1: user.address1 || '',
                address2: user.address2 || '',
                city: user.city || '',
                state: user.state || '',
                postcode: user.postcode || '',
                userType: 'owner' as const,
            } as EditOwnerInput;
        }
    };

    // Initialize form with default values to prevent uncontrolled/controlled warning
    const form = useForm<EditStaffInput | EditOwnerInput>({
        resolver: user ? zodResolver(isStaff ? editStaffSchema : editOwnerSchema) : undefined,
        defaultValues: isStaff ? {
            staffType: undefined as any,
            userType: 'staff',
        } : {
            name: '',
            email: '',
            countryCode: '',
            phoneNo: '',
            salutation: '',
            ic: '',
            address1: '',
            address2: '',
            city: '',
            state: '',
            postcode: '',
            userType: 'owner',
        },
    });

    // Update form when user data loads
    useEffect(() => {
        if (user) {
            const values = getInitialValues();
            if (values) {
                // Clear any errors and reset form with new values
                form.clearErrors();
                form.reset(values as any, { keepDefaultValues: false });
            }
        }
    }, [user, isStaff]);

    // Update mutation
    const updateMutation = useMutation({
        mutationFn: async (data: EditStaffInput | EditOwnerInput) => {
            const response = await fetch(`/api/users/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });
            if (!response.ok) {
                throw new Error('Failed to update user');
            }
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['user', id] });
            router.push(`/users/${id}`);
        },
    });

    const onSubmit = (data: any) => {
        try {
            // For staff users, only the staff type is editable, but we need to include required fields
            if (isStaff) {
                const staffData: EditStaffInput = {
                    staffType: data.staffType,
                    userType: 'staff',
                };
                updateMutation.mutate(staffData);
            } else {
                // For owners, send all the data with userType
                const ownerData: EditOwnerInput = {
                    ...data,
                    userType: 'owner',
                };
                updateMutation.mutate(ownerData);
            }
        } catch (error) {
            console.error('Form submission error:', error);
        }
    };

    const onError = (errors: any) => {
        console.error('Form validation errors:', errors);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-100px)]">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">Loading user data...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-100px)]">
                <div className="flex flex-col items-center gap-4 p-6 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                    <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
                    <div className="text-center">
                        <h3 className="font-semibold text-red-900 dark:text-red-300 mb-1">Error Loading User</h3>
                        <p className="text-sm text-red-700 dark:text-red-400">{error.message}</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-100px)]">
                <div className="flex flex-col items-center gap-4 p-6">
                    <AlertCircle className="h-8 w-8 text-gray-400" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">User not found</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-[calc(100vh-100px)] space-y-4 overflow-y-auto w-full max-w-full">
            {/* Header */}
            <div className="flex justify-between items-center flex-shrink-0 sticky top-0 bg-white dark:bg-dark z-1 pb-4 border-b border-gray-200 dark:border-gray-800 w-full max-w-full">
                {/* Left Section */}
                <div className="flex gap-3 items-center">
                    <Button
                        color="ghost"
                        size="icon"
                        className="text-xs hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                        onClick={() => router.back()}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10">
                            <User className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-dark dark:text-white">Edit User</h1>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {isStaff ? 'Update staff information' : 'Update owner information'}
                            </p>
                        </div>
                    </div>
                </div>
                {/* Right Section */}
                <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${isStaff
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                        : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                        }`}>
                        {isStaff ? 'Staff' : 'Owner'}
                    </span>
                </div>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit, onError)} className="space-y-6 w-full max-w-full">
                    <div className="space-y-6 p-2">
                        {/* Basic Information */}
                        <CardBox className="rounded-lg border-l-4 border-l-primary/50 dark:border-l-primary/30 transition-all w-full max-w-full overflow-hidden">
                            <CardHeader className="pb-4 border-b border-gray-100 dark:border-gray-800">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                                        <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg font-semibold">Basic Information</CardTitle>
                                        <CardDescription className="text-xs mt-1">
                                            {isStaff
                                                ? 'View user\'s personal details and contact information'
                                                : 'Update user\'s personal details and contact information'}
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-6 w-full overflow-hidden">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full min-w-0">
                                    <FormField
                                        control={form.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem className="min-w-0">
                                                <FormLabel className="flex items-center gap-2">
                                                    <User className="h-3.5 w-3.5 text-gray-500" />
                                                    Name
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="Enter full name"
                                                        className="transition-all focus:ring-2 focus:ring-primary/20 w-full"
                                                        value={field.value || ''}
                                                        onChange={field.onChange}
                                                        onBlur={field.onBlur}
                                                        name={field.name}
                                                        ref={field.ref}
                                                        disabled={isStaff}
                                                        readOnly={isStaff}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem className="min-w-0">
                                                <FormLabel className="flex items-center gap-2">
                                                    <Mail className="h-3.5 w-3.5 text-gray-500" />
                                                    Email
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="email"
                                                        placeholder="user@example.com"
                                                        className="transition-all focus:ring-2 focus:ring-primary/20 w-full"
                                                        value={field.value || ''}
                                                        onChange={field.onChange}
                                                        onBlur={field.onBlur}
                                                        name={field.name}
                                                        ref={field.ref}
                                                        disabled={isStaff}
                                                        readOnly={isStaff}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="countryCode"
                                        render={({ field }) => (
                                            <FormItem className="min-w-0">
                                                <FormLabel className="flex items-center gap-2">
                                                    <Globe className="h-3.5 w-3.5 text-gray-500" />
                                                    Country Code
                                                </FormLabel>
                                                <FormControl>
                                                    <div className="relative w-full">
                                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">+</span>
                                                        <Input
                                                            placeholder="60"
                                                            className="pl-7 transition-all focus:ring-2 focus:ring-primary/20 w-full"
                                                            value={field.value || ''}
                                                            onChange={(e) => field.onChange(e.target.value || null)}
                                                            onBlur={field.onBlur}
                                                            name={field.name}
                                                            ref={field.ref}
                                                            disabled={isStaff}
                                                            readOnly={isStaff}
                                                        />
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="phoneNo"
                                        render={({ field }) => (
                                            <FormItem className="min-w-0">
                                                <FormLabel className="flex items-center gap-2">
                                                    <Phone className="h-3.5 w-3.5 text-gray-500" />
                                                    Phone Number
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="1234567890"
                                                        className="transition-all focus:ring-2 focus:ring-primary/20 w-full"
                                                        value={field.value || ''}
                                                        onChange={(e) => field.onChange(e.target.value || null)}
                                                        onBlur={field.onBlur}
                                                        name={field.name}
                                                        ref={field.ref}
                                                        disabled={isStaff}
                                                        readOnly={isStaff}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </CardContent>
                        </CardBox>

                        {/* Staff Specific Fields */}
                        {isStaff && (
                            <CardBox className="rounded-lg border-l-4 border-l-blue-500/50 dark:border-l-blue-500/30 transition-all w-full max-w-full overflow-hidden">
                                <CardHeader className="pb-4 border-b border-gray-100 dark:border-gray-800">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                                            <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-lg font-semibold">Staff Information</CardTitle>
                                            <CardDescription className="text-xs mt-1">
                                                Configure staff role and permissions
                                            </CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-6 w-full overflow-hidden">
                                    <FormField
                                        control={form.control}
                                        name="staffType"
                                        render={({ field }) => {
                                            const staffTypeConfig = {
                                                super_admin: { label: 'Super Admin', color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-900/20' },
                                                admin: { label: 'Admin', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20' },
                                                staff: { label: 'Staff', color: 'text-gray-600 dark:text-gray-400', bg: 'bg-gray-50 dark:bg-gray-800' },
                                            };

                                            return (
                                                <FormItem className="min-w-0">
                                                    <FormLabel className="flex items-center gap-2">
                                                        <Shield className="h-3.5 w-3.5 text-gray-500" />
                                                        Staff Type
                                                    </FormLabel>
                                                    <Select onValueChange={field.onChange} value={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger className="transition-all focus:ring-2 focus:ring-primary/20 w-full">
                                                                <div className="flex items-center gap-2 w-full min-w-0">
                                                                    <SelectValue placeholder="Select staff type" className="flex-1 min-w-0" />
                                                                </div>
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {Object.entries(staffTypeConfig).map(([value, config]) => (
                                                                <SelectItem key={value} value={value}>
                                                                    <div className="flex items-center gap-2">
                                                                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${config.bg} ${config.color}`}>
                                                                            {config.label}
                                                                        </span>
                                                                    </div>
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            );
                                        }}
                                    />
                                </CardContent>
                            </CardBox>
                        )}

                        {/* Owner Specific Fields */}
                        {!isStaff && (
                            <>
                                <CardBox className="rounded-lg border-l-4 border-l-purple-500/50 dark:border-l-purple-500/30 transition-all w-full max-w-full overflow-hidden">
                                    <CardHeader className="pb-4 border-b border-gray-100 dark:border-gray-800">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                                                <FileText className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                            </div>
                                            <div>
                                                <CardTitle className="text-lg font-semibold">Owner Information</CardTitle>
                                                <CardDescription className="text-xs mt-1">
                                                    Update owner's personal identification details
                                                </CardDescription>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="pt-6 w-full overflow-hidden">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full min-w-0">
                                            <FormField
                                                control={form.control}
                                                name="salutation"
                                                render={({ field }) => (
                                                    <FormItem className="min-w-0">
                                                        <FormLabel>Salutation</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                placeholder="e.g., Mr, Mrs, Ms"
                                                                className="w-full"
                                                                value={field.value || ''}
                                                                onChange={(e) => field.onChange(e.target.value || null)}
                                                                onBlur={field.onBlur}
                                                                name={field.name}
                                                                ref={field.ref}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name="ic"
                                                render={({ field }) => (
                                                    <FormItem className="min-w-0">
                                                        <FormLabel>IC Number</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                placeholder="yymmddaabbbb"
                                                                className="w-full"
                                                                value={field.value || ''}
                                                                onChange={(e) => {
                                                                    const value = e.target.value.replace(/[-\s]/g, '');
                                                                    field.onChange(value || null);
                                                                }}
                                                                onBlur={field.onBlur}
                                                                name={field.name}
                                                                ref={field.ref}
                                                            />
                                                        </FormControl>
                                                        {field.value && (
                                                            <div className="mt-2 p-2 rounded-md bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                                                                <p className="text-xs text-gray-600 dark:text-gray-400 font-medium mb-1">Formatted IC:</p>
                                                                <p className="text-sm font-mono text-primary dark:text-primary font-semibold">
                                                                    {formatIC(field.value)}
                                                                </p>
                                                            </div>
                                                        )}
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </CardContent>
                                </CardBox>

                                <CardBox className="rounded-lg border-l-4 border-l-green-500/50 dark:border-l-green-500/30 transition-all w-full max-w-full overflow-hidden">
                                    <CardHeader className="pb-4 border-b border-gray-100 dark:border-gray-800">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-lg bg-green-50 dark:bg-green-900/20">
                                                <MapPin className="h-5 w-5 text-green-600 dark:text-green-400" />
                                            </div>
                                            <div>
                                                <CardTitle className="text-lg font-semibold">Address Information</CardTitle>
                                                <CardDescription className="text-xs mt-1">
                                                    Update owner's residential address details
                                                </CardDescription>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="pt-6 w-full overflow-hidden">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full min-w-0">
                                            <FormField
                                                control={form.control}
                                                name="address1"
                                                render={({ field }) => (
                                                    <FormItem className="md:col-span-2 min-w-0">
                                                        <FormLabel>Address 1</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                placeholder="Enter address line 1"
                                                                className="w-full"
                                                                value={field.value || ''}
                                                                onChange={(e) => field.onChange(e.target.value || null)}
                                                                onBlur={field.onBlur}
                                                                name={field.name}
                                                                ref={field.ref}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name="address2"
                                                render={({ field }) => (
                                                    <FormItem className="md:col-span-2 min-w-0">
                                                        <FormLabel>Address 2</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                placeholder="Enter address line 2"
                                                                className="w-full"
                                                                value={field.value || ''}
                                                                onChange={(e) => field.onChange(e.target.value || null)}
                                                                onBlur={field.onBlur}
                                                                name={field.name}
                                                                ref={field.ref}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name="city"
                                                render={({ field }) => (
                                                    <FormItem className="min-w-0">
                                                        <FormLabel className="flex items-center gap-2">
                                                            <Building className="h-3.5 w-3.5 text-gray-500" />
                                                            City
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                placeholder="Enter city"
                                                                className="transition-all focus:ring-2 focus:ring-primary/20 w-full"
                                                                value={field.value || ''}
                                                                onChange={(e) => field.onChange(e.target.value || null)}
                                                                onBlur={field.onBlur}
                                                                name={field.name}
                                                                ref={field.ref}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name="state"
                                                render={({ field }) => (
                                                    <FormItem className="min-w-0">
                                                        <FormLabel className="flex items-center gap-2">
                                                            <MapPin className="h-3.5 w-3.5 text-gray-500" />
                                                            State
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                placeholder="Enter state"
                                                                className="transition-all focus:ring-2 focus:ring-primary/20 w-full"
                                                                value={field.value || ''}
                                                                onChange={(e) => field.onChange(e.target.value || null)}
                                                                onBlur={field.onBlur}
                                                                name={field.name}
                                                                ref={field.ref}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name="postcode"
                                                render={({ field }) => (
                                                    <FormItem className="min-w-0">
                                                        <FormLabel>Postcode</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                placeholder="Enter postcode"
                                                                className="w-full"
                                                                value={field.value || ''}
                                                                onChange={(e) => field.onChange(e.target.value || null)}
                                                                onBlur={field.onBlur}
                                                                name={field.name}
                                                                ref={field.ref}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </CardContent>
                                </CardBox>
                            </>
                        )}
                    </div>

                    {/* Action Buttons - Sticky Footer */}
                    <div className="sticky bottom-0 bg-white dark:bg-dark border-t border-gray-200 dark:border-gray-800 py-4 mt-6 flex justify-end gap-3 w-full">
                        <Button
                            type="button"
                            color="light"
                            onClick={() => router.back()}
                            className="flex items-center gap-2 px-6 rounded-lg transition-all hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                            <X className="h-4 w-4" />
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            color="primary"
                            disabled={updateMutation.isPending}
                            className="flex items-center gap-2 px-6 rounded-lg transition-all hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary"
                        >
                            {updateMutation.isPending ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="h-4 w-4" />
                                    Save Changes
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}

export default EditUserPage;
