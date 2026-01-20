"use client"

import { LucideIcon } from "lucide-react"
import { ReactNode } from "react"

interface FieldCardProps {
  icon: LucideIcon
  label: string
  value: string | ReactNode
}

const FieldCard = ({ icon: Icon, label, value }: FieldCardProps) => {
  return (
    <div className="bg-[var(--field-bg)] dark:bg-[var(--field-bg)] border border-[var(--field-border)] dark:border-[var(--field-border)] rounded-xl p-4 flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <Icon size={18} className="text-primary" />
        <span className="text-muted-foreground text-sm">{label}</span>
      </div>
      <span className="text-foreground font-medium text-sm">{value || "—"}</span>
    </div>
  )
}

export default FieldCard
