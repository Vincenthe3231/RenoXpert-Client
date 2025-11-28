import { CardContent, CardHeader, CardTitle } from "@/app/components/shadcn-ui/Default-Ui/card";
import CardBox from "@/app/components/shared/CardBox";

function QuickActions() {
    return (
        <CardBox className="rounded-tw">
            <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
                <p>Quick Actions</p>
            </CardContent>
        </CardBox>
    )
}

export default QuickActions;