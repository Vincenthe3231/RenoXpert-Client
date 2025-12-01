import { CardContent, CardHeader, CardTitle } from "@/app/components/shadcn-ui/Default-Ui/card";
import CardBox from "@/app/components/shared/CardBox";
import { Staff } from "@/lib/schemas";
import { User, Mail, UserCog, CheckCircle, AlertCircle, XCircle } from "lucide-react";
import { Badge } from "flowbite-react";
import { getUserTypeBadge, getUserTypeLabel } from "@/utils/user-helpers";

function StaffInfo({ user }: { user: Staff }) {
    const formatStaffType = (type: string) => {
        return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    };

    const getStatusBadge = (status: string) => {
        const baseClasses = "inline-flex items-center rounded-full font-medium";
        if (status === 'active') {
            return `${baseClasses} bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400`;
        } else if (status === 'inactive') {
            return `${baseClasses} bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400`;
        } else {
            return `${baseClasses} bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400`;
        }
    };

    return (
        <CardBox className="rounded-tw">
            <CardHeader className="pb-2">
                <CardTitle className="text-base">Staff Information</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-1.5 mb-0.5">
                            <div className="w-5 h-5 flex items-center justify-center rounded bg-blue-50 dark:bg-blue-900/20 flex-shrink-0">
                                <User className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                            </div>
                            <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Name</span>
                        </div>
                        <div className="flex items-start gap-1.5">
                            <div className="w-5 flex-shrink-0" />
                            <p className="text-sm font-medium text-dark dark:text-white flex-1">
                                {user.name || <span className="text-gray-400 italic text-xs">N/A</span>}
                            </p>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <div className="flex items-center gap-1.5 mb-0.5">
                            <div className="w-5 h-5 flex items-center justify-center rounded bg-purple-50 dark:bg-purple-900/20 flex-shrink-0">
                                <Mail className="h-3 w-3 text-purple-600 dark:text-purple-400" />
                            </div>
                            <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Email</span>
                        </div>
                        <div className="flex items-start gap-1.5">
                            <div className="w-5 flex-shrink-0" />
                            <p className="text-sm font-medium text-dark dark:text-white flex-1 break-words">
                                {user.email || <span className="text-gray-400 italic text-xs">N/A</span>}
                            </p>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <div className="flex items-center gap-1.5 mb-0.5">
                            <div className="w-5 h-5 flex items-center justify-center rounded bg-indigo-50 dark:bg-indigo-900/20 flex-shrink-0">
                                <UserCog className="h-3 w-3 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Staff Type</span>
                        </div>
                        <div className="flex items-start gap-1.5">
                            <div className="w-5 flex-shrink-0" />
                            <Badge
                                color={getUserTypeBadge(user.staffType)}
                                size="xs"
                                className="capitalize"
                            >
                                {getUserTypeLabel(user.staffType)}
                            </Badge>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <div className="flex items-center gap-1.5 mb-0.5">
                            <div className="w-5 h-5 flex items-center justify-center rounded bg-emerald-50 dark:bg-emerald-900/20 flex-shrink-0">
                                {user.status === 'active' ? (
                                    <CheckCircle className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                                ) : user.status === 'inactive' ? (
                                    <XCircle className="h-3 w-3 text-gray-600 dark:text-gray-400" />
                                ) : (
                                    <AlertCircle className="h-3 w-3 text-yellow-600 dark:text-yellow-400" />
                                )}
                            </div>
                            <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Status</span>
                        </div>
                        <div className="flex items-start gap-1.5">
                            <div className="w-5 flex-shrink-0" />
                            <div className="flex-1">
                                {user.status ? (
                                    <span className={`${getStatusBadge(user.status)} text-[10px] px-2 py-0.5`}>
                                        {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                                    </span>
                                ) : (
                                    <span className="text-gray-400 italic text-xs">N/A</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </CardBox>
    )
}

export default StaffInfo;