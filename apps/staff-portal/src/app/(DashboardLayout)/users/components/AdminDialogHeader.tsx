"use client"

import React from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

interface AdminDialogHeaderProps {
  avatarUrl?: string
  name: string
  email: string
  title?: string
  className?: string
  rightContent?: React.ReactNode
}

export function AdminDialogHeader({
  avatarUrl,
  name,
  email,
  title,
  className,
  rightContent,
}: AdminDialogHeaderProps) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-t-lg bg-gradient-to-r from-primary to-secondary px-6 py-6",
        className
      )}
    >
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10" />
        <div className="absolute -bottom-4 -left-4 h-24 w-24 rounded-full bg-white/5" />
        <div className="absolute right-1/4 top-1/2 h-16 w-16 rounded-full bg-white/5" />
      </div>

      {/* Content */}
      <div className="relative flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0">
          <div className="group relative shrink-0">
            <div className="absolute -inset-1 rounded-full bg-white/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <Avatar className="h-16 w-16 ring-2 ring-white/30 transition-transform duration-300 group-hover:scale-105">
              <AvatarImage src={avatarUrl} alt={name} className="object-cover" />
              <AvatarFallback className="bg-white/20 text-lg font-semibold text-white">
                {initials}
              </AvatarFallback>
            </Avatar>
          </div>

          <div className="flex flex-col gap-0.5 min-w-0">
            {title && (
              <span className="text-[10px] font-medium uppercase tracking-wider text-white/60">
                {title}
              </span>
            )}
            <h2 className="text-xl font-semibold text-white truncate">{name}</h2>
            <p className="text-sm text-white/70 truncate">{email}</p>
          </div>
        </div>

        {rightContent && <div className="relative shrink-0">{rightContent}</div>}
      </div>
    </div>
  )
}


