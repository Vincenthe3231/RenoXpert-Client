import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { getAuditActionDisplay } from "./auditBadgeConfig"

interface ActionBadgeProps {
  event: string
  logName?: string
  log?: any
  size?: "sm" | "md"
  className?: string
}

const sizeStyles = {
  sm: "text-[10px] px-2 py-0.5",
  md: "text-xs px-2.5 py-1",
}

export function ActionBadge({
  event,
  logName,
  log,
  size = "md",
  className,
}: ActionBadgeProps) {
  const display = getAuditActionDisplay(event, logName, log)
  const Icon = display.icon

  return (
    <Badge
      variant="outline"
      className={cn(display.className, sizeStyles[size], "font-medium", className)}
    >
      <Icon size={size === "sm" ? 10 : 12} />
      {display.label}
    </Badge>
  )
}

