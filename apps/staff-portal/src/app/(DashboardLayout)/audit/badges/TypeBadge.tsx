import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { AuditType } from "./auditBadgeConfig"

interface TypeBadgeProps {
  typeLabel: AuditType | string
  size?: "sm" | "md"
  className?: string
}

const sizeStyles = {
  sm: "text-[10px] px-2 py-0.5",
  md: "text-xs px-2.5 py-1",
}

export function TypeBadge({ typeLabel, size = "md", className }: TypeBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "inline-flex items-center rounded-xl border border-primary/20 bg-primary/5 dark:bg-primary/10 backdrop-blur-sm font-medium text-primary shadow-sm",
        sizeStyles[size],
        className
      )}
    >
      {typeLabel}
    </Badge>
  )
}

