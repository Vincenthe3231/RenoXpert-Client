import CardBox from "@/app/components/shared/CardBox";
import { Staff, Owner } from "@/lib/schemas";
import { getUserTypeBadge, getUserTypeLabel } from "@/utils/user-helpers";
import { Mail, Phone, User as UserIcon } from "lucide-react";
import { Badge } from "flowbite-react";
import Image from "next/image";

function ProfileSection({ user }: { user: Owner | Staff }) {
    return (
        <CardBox className="rounded-tw">
            <div className='flex items-center gap-6 w-full p-2'>
                <div className="relative">
                    <Image
                        src={(user as Staff)?.profile?.avatarUrl || '/images/profile/user-7.jpg'}
                        alt='Profile'
                        width={80}
                        height={80}
                        className='rounded-full border-4 border-gray-100 dark:border-gray-800 shadow-md'
                    />
                    <div className="absolute -bottom-1 -right-1 p-1.5 bg-white dark:bg-gray-800 rounded-full border-2 border-gray-200 dark:border-gray-700">
                        <UserIcon className="h-3 w-3 text-gray-600 dark:text-gray-400" />
                    </div>
                </div>
                <div className='flex flex-col gap-3 flex-1'>
                    <div className='flex flex-col gap-2'>
                        <h3 className='flex gap-2 items-center font-bold text-xl text-dark dark:text-white'>
                            {user?.name}

                            {user?.userType === 'staff' && (
                                <Badge
                                    color={getUserTypeBadge((user as Staff).profile.type)}
                                    size="xs"
                                    className="capitalize"
                                >
                                    {getUserTypeLabel((user as Staff).profile.type)}
                                </Badge>
                            )}
                        </h3>
                        <div className="flex flex-wrap gap-4 items-center">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 rounded-md bg-purple-50 dark:bg-purple-900/20">
                                    <Mail className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
                                </div>
                                <p className='text-sm font-medium text-gray-700 dark:text-gray-300'>{user?.email}</p>
                            </div>
                            {user?.userType === 'owner' && user?.countryCode && user?.phoneNo && (
                                <div className="flex items-center gap-2">
                                    <div className="p-1.5 rounded-md bg-green-50 dark:bg-green-900/20">
                                        <Phone className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                                    </div>
                                    <p className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                                        +{user?.countryCode} {user?.phoneNo}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </CardBox>
    )
}

export default ProfileSection;