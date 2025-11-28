import { CardContent, CardHeader, CardTitle } from "@/app/components/shadcn-ui/Default-Ui/card";
import CardBox from "@/app/components/shared/CardBox";
import { Staff } from "@/lib/schemas";

function StaffAccessOverview({ user }: { user: Staff }) {
    return (
        <CardBox className="rounded-tw">
            <CardHeader>
                <CardTitle>Staff Access Overview</CardTitle>
            </CardHeader>
            <CardContent>
                <p>Staff Access Overview</p>
            </CardContent>
        </CardBox>
    )
}

export default StaffAccessOverview;