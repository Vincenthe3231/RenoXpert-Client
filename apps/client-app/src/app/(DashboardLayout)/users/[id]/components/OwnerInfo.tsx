import { CardContent, CardHeader, CardTitle } from "@/app/components/shadcn-ui/Default-Ui/card";
import CardBox from "@/app/components/shared/CardBox";
import { Owner } from "@/lib/schemas";
import { User, Mail, Phone, CreditCard } from "lucide-react";
import Image from "next/image";
import { formatIC } from "@/utils/format-helpers";

function OwnerInfo({ user }: { user: Owner }) {
    // Map country codes to flag file names
    const getFlagPath = (countryCode: string | null): string | null => {
        if (!countryCode) return null;
        
        const codeMap: Record<string, string> = {
            '60': 'my',  // Malaysia
            '65': 'sg',  // Singapore
            '61': 'au',  // Australia
            '86': 'cn',  // China
            '91': 'in',  // India
            '966': 'sa', // Saudi Arabia
            '44': 'en',  // UK
            '33': 'fr',  // France
        };
        
        const flagCode = codeMap[countryCode];
        return flagCode ? `/images/flag/icon-flag-${flagCode}.svg` : null;
    };

    const flagPath = getFlagPath(user.countryCode || null);
    const fullPhoneNumber = user.countryCode && user.phoneNo 
        ? `+${user.countryCode} ${user.phoneNo}` 
        : null;

    return (
        <CardBox className="rounded-tw">
            <CardHeader className="pb-2">
                <CardTitle className="text-base">Owner Detail</CardTitle>
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
                            <div className="w-5 h-5 flex items-center justify-center rounded bg-green-50 dark:bg-green-900/20 flex-shrink-0">
                                <Phone className="h-3 w-3 text-green-600 dark:text-green-400" />
                            </div>
                            <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Phone</span>
                        </div>
                        <div className="flex items-start gap-1.5">
                            <div className="w-5 flex-shrink-0" />
                            <div className="flex-1">
                                {fullPhoneNumber ? (
                                    <span className="inline-flex items-center gap-2 px-2 py-0.5 rounded bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300">
                                        {flagPath && (
                                            <Image
                                                src={flagPath}
                                                alt={`Flag ${user.countryCode}`}
                                                width={16}
                                                height={12}
                                                className="rounded-sm"
                                            />
                                        )}
                                        <span className="font-mono text-xs">{fullPhoneNumber}</span>
                                    </span>
                                ) : (
                                    <span className="text-gray-400 italic text-xs">N/A</span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-1 md:col-span-2">
                        <div className="flex items-center gap-1.5 mb-0.5">
                            <div className="w-5 h-5 flex items-center justify-center rounded bg-orange-50 dark:bg-orange-900/20 flex-shrink-0">
                                <CreditCard className="h-3 w-3 text-orange-600 dark:text-orange-400" />
                            </div>
                            <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">IC</span>
                        </div>
                        <div className="flex items-start gap-1.5">
                            <div className="w-5 flex-shrink-0" />
                            <div className="flex-1">
                                {user.ic ? (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 font-mono text-xs">
                                        {formatIC(user.ic)}
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

export default OwnerInfo;