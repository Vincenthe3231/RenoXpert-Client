"use client"

import { CreateOwnerInput, createOwnerSchema } from "@/lib/schemas";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "flowbite-react";
import {
    ChevronLeft,
    Save,
    X,
    User,
    Mail,
    Phone,
    Globe,
    MapPin,
    Building,
    FileText,
    Loader2,
    AlertCircle,
    CheckCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/app/components/shadcn-ui/Default-Ui/form";
import { Input } from "@/app/components/shadcn-ui/Default-Ui/input";
import CardBox from "@/app/components/shared/CardBox";
import { CardContent, CardHeader, CardTitle, CardDescription } from "@/app/components/shadcn-ui/Default-Ui/card";
import { formatIC } from "@/utils/format-helpers";
import { toast } from "@/hooks/use-toast";

function CreateOwnerPage() {
    const router = useRouter();
    const queryClient = useQueryClient();

    // Initialize form with default values
    const form = useForm<CreateOwnerInput>({
        resolver: zodResolver(createOwnerSchema),
        defaultValues: {
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

    // Create mutation
    const createMutation = useMutation({
        mutationFn: async (data: CreateOwnerInput) => {
            // Clean up empty email string to undefined
            const cleanedData = {
                ...data,
                email: data.email === "" ? undefined : data.email,
            };
            
            const response = await fetch('/api/owners', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(cleanedData),
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || error.error || 'Failed to create owner');
            }
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['ownerList'] });
            toast({
                title: <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-green-500">Owner Created</span>
                </div>,
                description: "The owner has been created successfully.",
            });
            router.push('/users');
        },
        onError: (error: Error) => {
            toast({
                title: <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-500" />
                    <span className="text-red-500">Error</span>
                </div>,
                description: error.message || "Failed to create owner. Please try again.",
                variant: "destructive",
            });
        },
    });

    const onSubmit = (data: CreateOwnerInput) => {
        try {
            createMutation.mutate(data);
        } catch (error) {
            console.error('Form submission error:', error);
        }
    };

    const onError = (errors: any) => {
        console.error('Form validation errors:', errors);
    };

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
                            <h1 className="text-2xl font-bold text-dark dark:text-white">Create Owner</h1>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Add a new owner to the system
                            </p>
                        </div>
                    </div>
                </div>
                {/* Right Section */}
                <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                        Owner
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
                                            Enter owner's personal details and contact information
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
                                                    Name <span className="text-red-500">*</span>
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
                                                    Country Code <span className="text-red-500">*</span>
                                                </FormLabel>
                                                <FormControl>
                                                    <div className="relative w-full">
                                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">+</span>
                                                        <Input
                                                            placeholder="60"
                                                            className="pl-7 transition-all focus:ring-2 focus:ring-primary/20 w-full"
                                                            value={field.value || ''}
                                                            onChange={(e) => field.onChange(e.target.value || '')}
                                                            onBlur={field.onBlur}
                                                            name={field.name}
                                                            ref={field.ref}
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
                                                    Phone Number <span className="text-red-500">*</span>
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="1234567890"
                                                        className="transition-all focus:ring-2 focus:ring-primary/20 w-full"
                                                        value={field.value || ''}
                                                        onChange={(e) => field.onChange(e.target.value || '')}
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

                        {/* Owner Specific Fields */}
                        <CardBox className="rounded-lg border-l-4 border-l-purple-500/50 dark:border-l-purple-500/30 transition-all w-full max-w-full overflow-hidden">
                            <CardHeader className="pb-4 border-b border-gray-100 dark:border-gray-800">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                                        <FileText className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg font-semibold">Owner Information</CardTitle>
                                        <CardDescription className="text-xs mt-1">
                                            Enter owner's personal identification details
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
                                                        onChange={(e) => field.onChange(e.target.value || '')}
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
                                                            field.onChange(value || '');
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
                                            Enter owner's residential address details
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
                                                        onChange={(e) => field.onChange(e.target.value || '')}
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
                                                        onChange={(e) => field.onChange(e.target.value || '')}
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
                                                        onChange={(e) => field.onChange(e.target.value || '')}
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
                                                        onChange={(e) => field.onChange(e.target.value || '')}
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
                                                        onChange={(e) => field.onChange(e.target.value || '')}
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
                            disabled={createMutation.isPending}
                            className="flex items-center gap-2 px-6 rounded-lg transition-all hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary"
                        >
                            {createMutation.isPending ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <Save className="h-4 w-4" />
                                    Create Owner
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}

export default CreateOwnerPage;

