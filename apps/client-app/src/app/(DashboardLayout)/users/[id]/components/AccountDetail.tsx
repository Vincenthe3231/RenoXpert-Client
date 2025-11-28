import { CardHeader, CardTitle } from "@/app/components/shadcn-ui/Default-Ui/card";
import { CardContent } from "@/app/components/shadcn-ui/Default-Ui/card";
import CardBox from "@/app/components/shared/CardBox";
import { Staff, Owner } from "@/lib/schemas";
import { Key, Calendar } from "lucide-react";

function AccountDetail({ user }: { user: Owner | Staff }) {
    const formatDate = (dateString: string | null | undefined) => {
        if (!dateString) return 'N/A';
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return dateString;
        }
    };

    return (
        <CardBox className="rounded-tw">
            <CardHeader className="pb-2">
                <CardTitle className="text-base">Account Detail</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-1.5 mb-0.5">
                            <div className="w-5 h-5 flex items-center justify-center rounded bg-amber-50 dark:bg-amber-900/20 flex-shrink-0">
                                <Key className="h-3 w-3 text-amber-600 dark:text-amber-400" />
                            </div>
                            <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">UUID</span>
                        </div>
                        <div className="flex items-start gap-1.5">
                            <div className="w-5 flex-shrink-0" />
                            <p className="text-xs font-mono font-medium text-dark dark:text-white flex-1 break-all bg-gray-50 dark:bg-gray-800/50 px-2 py-1.5 rounded">
                                {user.uuid || <span className="text-gray-400 italic">N/A</span>}
                            </p>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <div className="flex items-center gap-1.5 mb-0.5">
                            <div className="w-5 h-5 flex items-center justify-center rounded bg-rose-50 dark:bg-rose-900/20 flex-shrink-0">
                                <Calendar className="h-3 w-3 text-rose-600 dark:text-rose-400" />
                            </div>
                            <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Created Date</span>
                        </div>
                        <div className="flex items-start gap-1.5">
                            <div className="w-5 flex-shrink-0" />
                            <p className="text-sm font-medium text-dark dark:text-white flex-1">
                                {formatDate(user.createdAt) !== 'N/A' ? formatDate(user.createdAt) : <span className="text-gray-400 italic text-xs">N/A</span>}
                            </p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </CardBox>
    )
}

export default AccountDetail;