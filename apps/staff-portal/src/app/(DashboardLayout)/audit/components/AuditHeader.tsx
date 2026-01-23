import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

const AuditHeader = () => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Audit History</h2>
        <p className="text-muted-foreground mt-1">
          Complete record of all onboarding decisions and audit information
        </p>
      </div>
      <Link href="/dashboard">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
      </Link>
    </div>
  )
}

export default AuditHeader

