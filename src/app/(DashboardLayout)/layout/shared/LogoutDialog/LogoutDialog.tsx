"use client"

import React from 'react'
import { AlertTriangle, FileText, CheckCircle2, Clock } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useLogout } from '@/lib/api/auth'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

export interface UnsavedWorkItem {
  id: string | number
  name: string
  type: string
  modifiedAt: Date | string
}

interface LogoutDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  unsavedWork?: UnsavedWorkItem[]
}

const LogoutDialog = ({ open, onOpenChange, unsavedWork = [] }: LogoutDialogProps) => {
  const router = useRouter()
  const logout = useLogout()
  const hasUnsavedWork = unsavedWork.length > 0

  const handleLogout = async () => {
    try {
      await logout.mutateAsync()
      onOpenChange(false)
      // Small delay to ensure React Query cache is fully cleared
      // Use hard redirect to ensure all session data is cleared
      // This bypasses React Router and ensures a fresh page load
      setTimeout(() => {
        window.location.href = '/login'
      }, 100)
    } catch (error) {
      console.error('Logout failed:', error)
      // Even if logout fails, clear frontend session and redirect
      onOpenChange(false)
      setTimeout(() => {
        window.location.href = '/login'
      }, 100)
    }
  }

  const handleStay = () => {
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-amber-500/20 dark:bg-amber-500/10 rounded-lg text-amber-500">
              <AlertTriangle size={20} />
            </div>
            <DialogTitle className="text-lg font-bold text-foreground">
              Warning: Unsaved Work
            </DialogTitle>
          </div>
          <DialogDescription className="text-sm text-muted-foreground">
            {hasUnsavedWork ? (
              <>
                You are attempting to log out while having active modifications. 
                The following items will be{' '}
                <span className="text-red-400 dark:text-red-500 font-semibold underline underline-offset-4 decoration-red-500/30">
                  permanently lost
                </span>{' '}
                if you do not save them first:
              </>
            ) : (
              'Are you sure you want to log out?'
            )}
          </DialogDescription>
        </DialogHeader>

        {hasUnsavedWork && (
          <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
            {unsavedWork.map((item) => (
              <div
                key={item.id}
                className={cn(
                  "group flex items-center justify-between p-4 rounded-xl border border-border dark:border-darkborder",
                  "bg-card dark:bg-darkgray hover:bg-muted/50 dark:hover:bg-dark/80 transition-all"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/10 dark:bg-blue-500/20 rounded-lg text-blue-400 dark:text-blue-500">
                    <FileText size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                      {item.name}
                    </p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">
                      {item.type}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock size={12} />
                  <span className="text-xs">
                    {formatDistanceToNow(new Date(item.modifiedAt), { addSuffix: true })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {hasUnsavedWork && (
          <div className={cn(
            "p-4 rounded-xl bg-blue-500/5 dark:bg-blue-500/10 border border-blue-500/10 dark:border-blue-500/20",
            "flex items-center gap-3"
          )}>
            <CheckCircle2 size={16} className="text-blue-400 dark:text-blue-500" />
            <p className="text-xs text-blue-300/80 dark:text-blue-400/80 italic">
              Tip: Use the "Save All" button in the dashboard before logging out.
            </p>
          </div>
        )}

        <DialogFooter className="grid grid-cols-2 gap-4 sm:grid-cols-2 mt-6">
          <Button
            variant="outline"
            onClick={handleStay}
            className="w-full"
            disabled={logout.isPending}
          >
            {hasUnsavedWork ? 'Stay & Save' : 'Cancel'}
          </Button>
          <Button
            variant="destructive"
            onClick={handleLogout}
            disabled={logout.isPending}
            className="w-full"
          >
            {logout.isPending 
              ? 'Logging out...' 
              : hasUnsavedWork 
                ? 'Discard & Logout' 
                : 'Logout'
            }
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default LogoutDialog

