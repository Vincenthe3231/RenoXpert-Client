"use client"

import { AnimatePresence, motion } from "framer-motion"
import { AlertTriangle, UserX, Mail, Phone, Shield, Hash, Calendar, MapPin } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, StaffUser, OwnerUser } from "@/lib/api/auth/auth.schemas"
import UserStatusBadge from "./UserStatusBadge"
import { format } from "date-fns"
import Image from "next/image"
import { getFlagPath } from "@/lib/country"

interface DeactivateUserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: User | null
  onConfirm: () => Promise<void> | void
}

export function DeactivateUserDialog({
  open,
  onOpenChange,
  user,
  onConfirm,
}: DeactivateUserDialogProps) {
  const handleConfirm = async () => {
    await onConfirm()
    onOpenChange(false)
  }

  if (!user) return null

  const getInitials = (name: string) => 
    name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)

  const formatPhone = (countryCode?: string | null, phoneNo?: string | null) => {
    if (!countryCode || !phoneNo) return "Not provided"
    return `+${countryCode} ${phoneNo}`
  }

  const formatLocation = (user: User) => {
    if (user.userType === 'owner') {
      const owner = user as OwnerUser
      const addressParts = [
        owner.profile.address1,
        owner.profile.address2,
        owner.profile.city,
        owner.profile.state,
        owner.profile.postcode,
      ].filter(Boolean)
      return addressParts.join(", ") || "Not provided"
    }
    return "Not provided"
  }

  const getRole = (user: User) => {
    if (user.userType === 'staff') {
      const staff = user as StaffUser
      return staff.profile.roles?.join(", ") || "Staff"
    }
    return "Owner"
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-lg p-0 overflow-hidden border-border bg-card">
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="flex flex-col"
            >
              {/* Icon Section */}
              <div className="flex justify-center pt-8 pb-4">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.1, type: "spring", stiffness: 200, damping: 15 }}
                  className="relative"
                >
                  <div className="w-16 h-16 rounded-full bg-destructive/10 dark:bg-destructive/20 flex items-center justify-center ring-4 ring-destructive/20 dark:ring-destructive/30">
                    <AlertTriangle className="w-8 h-8 text-destructive" />
                  </div>
                </motion.div>
              </div>

              {/* Header Section */}
              <AlertDialogHeader className="px-6 pb-4 text-center">
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                  <AlertDialogTitle className="text-xl font-semibold text-foreground">
                    Deactivate User Account
                  </AlertDialogTitle>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                  <AlertDialogDescription className="text-sm text-muted-foreground mt-2">
                    This action will immediately revoke access and disable this user account. Please review the account details below before proceeding.
                  </AlertDialogDescription>
                </motion.div>
              </AlertDialogHeader>

              {/* User Account & Profile Information Section */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="mx-6 mb-4"
              >
                <div className="bg-muted/50 dark:bg-muted/30 rounded-lg border border-border overflow-hidden">
                  {/* User Profile Header */}
                  <div className="p-4 border-b border-border bg-muted/30">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12 ring-2 ring-destructive/20">
                        <AvatarImage 
                          src={user.userType === 'staff' ? (user as StaffUser).profile.avatarUrl || undefined : undefined} 
                          alt={user.name}
                        />
                        <AvatarFallback className="bg-destructive/10 text-destructive text-sm font-semibold">
                          {getInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-semibold text-foreground truncate">{user.name}</span>
                          <UserStatusBadge status={user.status} />
                        </div>
                        <span className="text-xs text-muted-foreground truncate block">{user.email}</span>
                      </div>
                    </div>
                  </div>

                  {/* Account Details Grid */}
                  <div className="p-4 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      {/* User ID */}
                      <div className="flex items-start gap-2">
                        <Hash className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs text-muted-foreground mb-0.5">User ID</p>
                          <p className="text-sm font-medium text-foreground truncate font-mono">{user.uuid}</p>
                        </div>
                      </div>

                      {/* Role */}
                      <div className="flex items-start gap-2">
                        <Shield className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs text-muted-foreground mb-0.5">Role</p>
                          <p className="text-sm font-medium text-foreground truncate">{getRole(user)}</p>
                        </div>
                      </div>

                      {/* Phone */}
                      <div className="flex items-start gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs text-muted-foreground mb-0.5">Phone</p>
                          <div className="flex items-center gap-1.5">
                            {user.countryCode && getFlagPath(user.countryCode) && (
                              <Image
                                src={getFlagPath(user.countryCode)!}
                                alt={`Flag ${user.countryCode}`}
                                width={12}
                                height={9}
                                className="rounded-sm shrink-0"
                              />
                            )}
                            <p className="text-sm font-medium text-foreground truncate">
                              {formatPhone(user.countryCode, user.phoneNo)}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Location */}
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs text-muted-foreground mb-0.5">Location</p>
                          <p className="text-sm font-medium text-foreground truncate">{formatLocation(user)}</p>
                        </div>
                      </div>
                    </div>

                    {/* Member Since */}
                    {(user as any).createdAt && (
                      <div className="flex items-start gap-2 pt-2 border-t border-border">
                        <Calendar className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs text-muted-foreground mb-0.5">Member Since</p>
                          <p className="text-sm font-medium text-foreground">
                            {format(new Date((user as any).createdAt), "MMMM d, yyyy")}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* Consequences Warning */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mx-6 mb-6"
              >
                <div className="bg-destructive/5 dark:bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                    <div className="flex-1 space-y-1.5">
                      <p className="text-sm font-semibold text-destructive">Consequences of Deactivation:</p>
                      <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                        <li>User will immediately lose access to the system</li>
                        <li>All active sessions will be terminated</li>
                        <li>User cannot log in until reactivated by an administrator</li>
                        <li>Account data will be preserved but inaccessible</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Footer Actions */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
                <AlertDialogFooter className="px-6 pb-6 flex-row gap-3 sm:gap-3 border-t border-border pt-4">
                  <AlertDialogCancel asChild>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 h-10 px-4 rounded-md border border-border bg-background text-foreground text-sm font-medium hover:bg-muted transition-colors"
                    >
                      Cancel
                    </motion.button>
                  </AlertDialogCancel>
                  <AlertDialogAction asChild>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleConfirm}
                      className="flex-1 h-10 px-4 rounded-md bg-destructive text-destructive-foreground text-sm font-medium hover:bg-destructive/90 transition-colors"
                    >
                      <UserX className="h-4 w-4 mr-2 inline" />
                      Deactivate Account
                    </motion.button>
                  </AlertDialogAction>
                </AlertDialogFooter>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </AlertDialogContent>
    </AlertDialog>
  )
}
