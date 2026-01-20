"use client"

import React from "react"
import { LucideIcon } from "lucide-react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface AdminInfoCardProps {
  icon: LucideIcon
  label: string
  value: string | React.ReactNode
  className?: string
  index?: number
}

export function AdminInfoCard({
  icon: Icon,
  label,
  value,
  className,
  index = 0,
}: AdminInfoCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.25,
        delay: index * 0.04,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      className={cn(
        "group flex flex-col gap-1.5 rounded-lg border border-border/40 bg-card p-3.5 transition-all duration-200 hover:border-border/60 hover:shadow-sm",
        className
      )}
    >
      <div className="flex items-center gap-1.5">
        <Icon className="h-3.5 w-3.5 text-muted-foreground/70" />
        <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/80">
          {label}
        </span>
      </div>
      <div className="text-sm font-medium text-foreground">
        {typeof value === "string" ? <span className="truncate block">{value}</span> : value}
      </div>
    </motion.div>
  )
}


