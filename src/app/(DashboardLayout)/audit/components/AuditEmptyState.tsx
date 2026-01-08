import { History } from "lucide-react"

const AuditEmptyState = () => {
  return (
    <div className="text-center py-12">
      <History className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
      <h3 className="font-medium text-lg mb-1">No decisions yet</h3>
      <p className="text-sm text-muted-foreground">
        Decisions will appear here once you process onboarding requests.
      </p>
    </div>
  )
}

export default AuditEmptyState

