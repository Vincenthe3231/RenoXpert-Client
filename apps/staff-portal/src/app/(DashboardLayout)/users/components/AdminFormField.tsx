"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"

interface AdminFormFieldProps {
  id: string
  label: string
  icon: LucideIcon
  value: string
  onChange: (value: string) => void
  type?: string
  placeholder?: string
  disabled?: boolean
  className?: string
}

export function AdminFormField({
  id,
  label,
  icon: Icon,
  value,
  onChange,
  type = "text",
  placeholder,
  disabled,
  className,
}: AdminFormFieldProps) {
  return (
    <div className={cn("group space-y-2", className)}>
      <Label
        htmlFor={id}
        className="flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors group-focus-within:text-primary"
      >
        <Icon className="h-4 w-4" />
        {label}
      </Label>
      <Input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="h-11 border-border/50 bg-[var(--field-bg)] dark:bg-[var(--field-bg)] transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
      />
    </div>
  )
}

