"use client"

import { ReactNode } from "react"

interface AdminSectionProps {
  title: string
  children: ReactNode
}

export function AdminSection({ title, children }: AdminSectionProps) {
  return (
    <section className="space-y-3">
      <div className="flex items-center gap-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">
          {title}
        </h3>
        <div className="h-px flex-1 bg-border/40" />
      </div>
      {children}
    </section>
  )
}


