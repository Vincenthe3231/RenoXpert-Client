"use client"

import { VisuallyHidden } from "@radix-ui/react-visually-hidden"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogTitle } from "@/components/ui/dialog"
import {
  Activity,
  Building,
  Clock,
  Hash,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Shield,
  User as UserIcon,
  UserCheck,
  UserX,
} from "lucide-react"
import { StaffUser, OwnerUser, VendorUser, User } from "@/lib/api/auth/auth.schemas"
import { useUser, useActivateUser, useDeactivateUser, useAuth, useOwner } from "@/lib/api/auth/auth.hooks"
import { useQueryClient } from "@tanstack/react-query"
import UserStatusBadge from "./UserStatusBadge"
import { DepartmentBadge } from "../../audit/components/DepartmentBadge"
import { UserAvatar } from "./UserAvatar"
import { format } from "date-fns"
import Image from "next/image"
import { getFlagPath } from "@/lib/country"
import { useToast } from "@/hooks/use-toast"
import React, { useMemo, useState, useEffect } from "react"
import { AdminDialogHeader } from "./AdminDialogHeader"
import { AdminSection } from "./AdminSection"
import { AdminInfoCard } from "./AdminInfoCard"
import { DeactivateUserDialog } from "./DeactivateUserDialog"

interface UserDetailsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: string | null
  canEdit?: boolean
  onEdit?: (user: User) => void
}

const UserDetailsDialog = ({ open, onOpenChange, userId, canEdit = false, onEdit }: UserDetailsDialogProps) => {
  const { data: currentUser } = useAuth()
  const [deactivateOpen, setDeactivateOpen] = useState(false)
  
  // Check if current user is staff (not admin or super-admin)
  const isStaff = useMemo(() => {
    if (!currentUser || !currentUser.profile) return false
    const profile = currentUser.profile as any
    const userRoles = Array.isArray(profile?.roles) ? profile.roles : []
    const normalizedUserRoles = userRoles.map((role: unknown) => {
      if (typeof role !== 'string') return ''
      return role.toLowerCase().trim().replace(/\s+/g, '-').replace(/_/g, '-')
    }).filter((role: string) => role.length > 0)
    
    const isSuperAdmin = normalizedUserRoles.some((role: string) => 
      role === 'super-admin' || role === 'superadmin'
    )
    const isAdmin = normalizedUserRoles.includes('admin')
    
    // Staff if they have staff role but not admin or super-admin
    return normalizedUserRoles.includes('staff') && !isAdmin && !isSuperAdmin
  }, [currentUser])

  // Check if current user is admin or staff (not super-admin) - these users cannot deactivate anyone
  const isCurrentUserAdminOrStaff = useMemo(() => {
    if (!currentUser || !currentUser.profile) return false
    const profile = currentUser.profile as any
    const userRoles = Array.isArray(profile?.roles) ? profile.roles : []
    const normalizedUserRoles = userRoles.map((role: unknown) => {
      if (typeof role !== 'string') return ''
      return role.toLowerCase().trim().replace(/\s+/g, '-').replace(/_/g, '-')
    }).filter((role: string) => role.length > 0)
    
    const isSuperAdmin = normalizedUserRoles.some((role: string) => 
      role === 'super-admin' || role === 'superadmin' || role === 'super_admin'
    )
    const isAdmin = normalizedUserRoles.includes('admin')
    const isStaff = normalizedUserRoles.includes('staff')
    
    // Return true if user is admin or staff (but not super-admin)
    return (isAdmin || isStaff) && !isSuperAdmin
  }, [currentUser])

  // Use useOwner for staff users, useUser for admin/super-admin
  // Force refetch every time by using a key that changes when dialog opens
  const ownerQuery = useOwner(isStaff && userId ? userId : null)
  const userQuery = useUser(!isStaff && userId ? userId : null)
  
  const { data: ownerData, isLoading: isOwnerLoading, error: ownerError, refetch: refetchOwner } = ownerQuery
  const { data: userData, isLoading: isUserLoading, error: userError, refetch: refetchUser } = userQuery

  // Use the appropriate data based on user role
  const user = isStaff ? ownerData : userData
  const isLoading = isStaff ? isOwnerLoading : isUserLoading
  const error = isStaff ? ownerError : userError

  // ALWAYS refetch from database when dialog opens - simple and direct
  useEffect(() => {
    if (open && userId) {
      // Force refetch from database to get latest phone number
      if (isStaff) {
        refetchOwner()
      } else {
        refetchUser()
      }
    }
  }, [open, userId, isStaff, refetchOwner, refetchUser]) // Refetch every time dialog opens

  // Check if the viewed user is a super admin
  const isViewedUserSuperAdmin = useMemo(() => {
    if (!user || user.userType !== 'staff') return false
    const viewedUserRoles = (user as StaffUser).profile?.roles || []
    const normalizedRoles = viewedUserRoles.map(role => {
      if (typeof role !== 'string') return ''
      return role.toLowerCase().trim().replace(/\s+/g, '-').replace(/_/g, '-')
    }).filter(role => role.length > 0)
    
    return normalizedRoles.some(role => 
      role === 'super-admin' || role === 'superadmin' || role === 'super_admin'
    )
  }, [user])

  // Check if the current user is trying to edit/deactivate themselves
  const isCurrentUser = useMemo(() => {
    if (!currentUser || !user) return false
    // Compare by ID or UUID
    if (currentUser.id && user.id && currentUser.id === user.id) return true
    if (currentUser.uuid && user.uuid && currentUser.uuid === user.uuid) return true
    return false
  }, [currentUser, user])

  // Check if current user is admin (not super-admin)
  const isCurrentUserAdmin = useMemo(() => {
    if (!currentUser || !currentUser.profile) return false
    const profile = currentUser.profile as any
    const userRoles = Array.isArray(profile?.roles) ? profile.roles : []
    const normalizedUserRoles = userRoles.map((role: unknown) => {
      if (typeof role !== 'string') return ''
      return role.toLowerCase().trim().replace(/\s+/g, '-').replace(/_/g, '-')
    }).filter((role: string) => role.length > 0)
    
    const isSuperAdmin = normalizedUserRoles.some((role: string) => 
      role === 'super-admin' || role === 'superadmin' || role === 'super_admin'
    )
    const isAdmin = normalizedUserRoles.includes('admin')
    
    // Admin but not super-admin
    return isAdmin && !isSuperAdmin
  }, [currentUser])

  const activateUser = useActivateUser()
  const deactivateUser = useDeactivateUser()
  const { toast } = useToast()

  const handleEdit = () => {
    if (!user || !onEdit) return
    onEdit(user)
  }

  const handleActivate = async () => {
    if (!user) return
    try {
      const identifier = user.id ? String(user.id) : user.uuid
      await activateUser.mutateAsync(identifier)
      toast({
        title: 'User activated',
        description: `${user.name} has been activated successfully.`,
      })
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Failed to activate user',
        description: error?.response?.data?.message || error?.message || 'Please try again.',
      })
    }
  }

  const handleDeactivate = async () => {
    if (!user) return
    try {
      const identifier = user.id ? String(user.id) : user.uuid
      await deactivateUser.mutateAsync(identifier)
      toast({
        title: 'User deactivated',
        description: `${user.name} has been deactivated successfully.`,
      })
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Failed to deactivate user',
        description: error?.response?.data?.message || error?.message || 'Please try again.',
      })
    }
  }

  if (!userId) return null

  // Format phone number
  const formatPhone = (countryCode?: string | null, phoneNo?: string | null) => {
    if (!countryCode || !phoneNo) return "—"
    return `+${countryCode} ${phoneNo}`
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-md overflow-hidden p-0 sm:max-w-lg rounded-lg shadow-2xl bg-background dark:bg-darkgray border-2 border-border max-h-[85vh] overflow-y-auto"
      >
        <VisuallyHidden>
          <DialogTitle>User Details</DialogTitle>
        </VisuallyHidden>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-6 h-6 animate-spin border-2 border-primary/30 border-t-primary rounded-full" />
          </div>
        ) : error ? (
          <div className="text-center py-12 px-8">
            <p className="text-lg font-medium text-destructive">Failed to load user details</p>
            <p className="mt-2 text-sm text-muted-foreground">
              {error.message || "Please try again later"}
            </p>
          </div>
        ) : user ? (
          <>
            <AdminDialogHeader
              name={user.name}
              email={user.email}
              avatarUrl={user.userType === "staff" ? (user as StaffUser).profile.avatarUrl || undefined : undefined}
              rightContent={<UserStatusBadge status={user.status} />}
            />

            <div className="space-y-5 px-6 py-5">
              <AdminSection title="Personal Information">
                <div className="grid gap-3 sm:grid-cols-2">
                  <AdminInfoCard icon={UserIcon} label="Full Name" value={user.name} index={0} />
                  <AdminInfoCard icon={Mail} label="Email" value={user.email} index={1} />
                  <AdminInfoCard
                    icon={Phone}
                    label="Phone"
                    value={
                      user.phoneNo ? (
                        <div className="flex items-center gap-2 min-w-0">
                          {user.countryCode && getFlagPath(user.countryCode) && (
                            <Image
                              src={getFlagPath(user.countryCode)!}
                              alt={`Flag ${user.countryCode}`}
                              width={16}
                              height={12}
                              className="rounded-sm shrink-0"
                            />
                          )}
                          <span className="truncate">
                            {user.countryCode ? formatPhone(user.countryCode, user.phoneNo) : user.phoneNo}
                          </span>
                        </div>
                      ) : (
                        "Not provided"
                      )
                    }
                    index={2}
                  />
                  <AdminInfoCard
                    icon={MapPin}
                    label="Location"
                    value={
                      user.userType === "owner" || user.userType === "vendor"
                        ? ([
                            (user as OwnerUser | VendorUser).profile.address1,
                            (user as OwnerUser | VendorUser).profile.address2,
                            (user as OwnerUser | VendorUser).profile.city,
                            (user as OwnerUser | VendorUser).profile.state,
                            (user as OwnerUser | VendorUser).profile.postcode,
                          ]
                            .filter(Boolean)
                            .join(", ") || "Not provided")
                        : "—"
                    }
                    index={3}
                  />
                </div>
              </AdminSection>

              <AdminSection title="Account Information">
                <div className="grid gap-3 sm:grid-cols-2">
                  <AdminInfoCard icon={Hash} label="User ID" value={user.uuid} index={4} />
                  <AdminInfoCard
                    icon={Shield}
                    label="Role"
                    value={
                      user.userType === "staff"
                        ? (user as StaffUser).profile.roles?.join(", ") || "—"
                        : user.userType === "owner"
                        ? "Owner"
                        : user.userType === "vendor"
                        ? "Vendor"
                        : "—"
                    }
                    index={5}
                  />
                  {user.userType === "staff" && (
                    <AdminInfoCard
                      icon={Building}
                      label="Department"
                      value={
                        (user as StaffUser).profile?.department ? (
                          <DepartmentBadge department={(user as StaffUser).profile.department} />
                        ) : (
                          "Not assigned"
                        )
                      }
                      index={6}
                    />
                  )}
                  <AdminInfoCard
                    icon={Activity}
                    label="Status"
                    value={<UserStatusBadge status={user.status} />}
                    index={user.userType === "staff" ? 7 : 6}
                  />
                  <AdminInfoCard
                    icon={Clock}
                    label="Last Active"
                    value={user.lastLoginAt ? format(new Date(user.lastLoginAt), "MMM d, yyyy 'at' h:mm a") : "Never"}
                    index={user.userType === "staff" ? 8 : 7}
                  />
                </div>
              </AdminSection>
            </div>

            <DialogFooter className="flex-row justify-between gap-2 border-t bg-muted/20 px-6 py-4">
              <div className="flex gap-2">
                {user.status === "active" && !isViewedUserSuperAdmin && !(isCurrentUserAdmin && isCurrentUser) && (
                  <Button
                    variant="outlineerror"
                    size="sm"
                    className="gap-1.5 text-destructive hover:bg-destructive hover:text-white"
                    onClick={() => setDeactivateOpen(true)}
                    disabled={deactivateUser.isPending}
                  >
                    <UserX className="h-3.5 w-3.5" />
                    Deactivate
                  </Button>
                )}
                {user.status === "deactivated" && !(isCurrentUserAdmin && isCurrentUser) && (
                  <Button size="sm" className="gap-1.5" onClick={handleActivate} disabled={activateUser.isPending}>
                    <UserCheck className="h-3.5 w-3.5" />
                    Activate
                  </Button>
                )}
                {isCurrentUserAdminOrStaff && user.userType === "owner" && canEdit && onEdit && !(isCurrentUserAdmin && isCurrentUser) && (
                  <Button
                    size="sm"
                    className="gap-1.5 bg-gradient-to-r from-primary to-secondary text-white transition-all duration-200 hover:opacity-90 hover:shadow-lg"
                    onClick={() => {
                      onOpenChange(false)
                      handleEdit()
                    }}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Edit Profile
                  </Button>
                )}
              </div>

              {canEdit && onEdit && !isCurrentUserAdminOrStaff && !(isCurrentUserAdmin && isCurrentUser) && (
                <Button
                  size="sm"
                  className="gap-1.5 bg-gradient-to-r from-primary to-secondary text-white transition-all duration-200 hover:opacity-90 hover:shadow-lg"
                  onClick={() => {
                    onOpenChange(false)
                    handleEdit()
                  }}
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Edit User
                </Button>
              )}
            </DialogFooter>

            {!isViewedUserSuperAdmin && (
              <DeactivateUserDialog
                open={deactivateOpen}
                onOpenChange={setDeactivateOpen}
                user={user}
                onConfirm={handleDeactivate}
              />
            )}
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

export default UserDetailsDialog
