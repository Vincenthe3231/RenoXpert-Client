import { CardContent, CardHeader, CardTitle } from "@/app/components/shadcn-ui/Default-Ui/card";
import CardBox from "@/app/components/shared/CardBox";
import { Owner } from "@/lib/schemas";
import { MapPin, Building, Map, Hash } from "lucide-react";

function AddressDetail({ user }: { user: Owner }) {
    return (
        <CardBox className="rounded-tw">
            <CardHeader className="pb-2">
                <CardTitle className="text-base">Address Detail</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1 md:col-span-2">
                        <div className="flex items-center gap-1.5 mb-0.5">
                            <div className="w-5 h-5 flex items-center justify-center rounded bg-red-50 dark:bg-red-900/20 flex-shrink-0">
                                <MapPin className="h-3 w-3 text-red-600 dark:text-red-400" />
                            </div>
                            <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Address 1</span>
                        </div>
                        <div className="flex items-start gap-1.5">
                            <div className="w-5 flex-shrink-0" />
                            <p className="text-sm font-medium text-dark dark:text-white flex-1">
                                {user.address1 || <span className="text-gray-400 italic text-xs">N/A</span>}
                            </p>
                        </div>
                    </div>

                    <div className="space-y-1 md:col-span-2">
                        <div className="flex items-center gap-1.5 mb-0.5">
                            <div className="w-5 h-5 flex items-center justify-center rounded bg-pink-50 dark:bg-pink-900/20 flex-shrink-0">
                                <MapPin className="h-3 w-3 text-pink-600 dark:text-pink-400" />
                            </div>
                            <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Address 2</span>
                        </div>
                        <div className="flex items-start gap-1.5">
                            <div className="w-5 flex-shrink-0" />
                            <p className="text-sm font-medium text-dark dark:text-white flex-1">
                                {user.address2 || <span className="text-gray-400 italic text-xs">N/A</span>}
                            </p>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <div className="flex items-center gap-1.5 mb-0.5">
                            <div className="w-5 h-5 flex items-center justify-center rounded bg-cyan-50 dark:bg-cyan-900/20 flex-shrink-0">
                                <Building className="h-3 w-3 text-cyan-600 dark:text-cyan-400" />
                            </div>
                            <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">City</span>
                        </div>
                        <div className="flex items-start gap-1.5">
                            <div className="w-5 flex-shrink-0" />
                            <p className="text-sm font-medium text-dark dark:text-white flex-1">
                                {user.city || <span className="text-gray-400 italic text-xs">N/A</span>}
                            </p>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <div className="flex items-center gap-1.5 mb-0.5">
                            <div className="w-5 h-5 flex items-center justify-center rounded bg-violet-50 dark:bg-violet-900/20 flex-shrink-0">
                                <Map className="h-3 w-3 text-violet-600 dark:text-violet-400" />
                            </div>
                            <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">State</span>
                        </div>
                        <div className="flex items-start gap-1.5">
                            <div className="w-5 flex-shrink-0" />
                            <p className="text-sm font-medium text-dark dark:text-white flex-1">
                                {user.state || <span className="text-gray-400 italic text-xs">N/A</span>}
                            </p>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <div className="flex items-center gap-1.5 mb-0.5">
                            <div className="w-5 h-5 flex items-center justify-center rounded bg-slate-50 dark:bg-slate-900/20 flex-shrink-0">
                                <Hash className="h-3 w-3 text-slate-600 dark:text-slate-400" />
                            </div>
                            <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Postcode</span>
                        </div>
                        <div className="flex items-start gap-1.5">
                            <div className="w-5 flex-shrink-0" />
                            <div className="flex-1">
                                {user.postcode ? (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-xs">
                                        {user.postcode}
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

export default AddressDetail;