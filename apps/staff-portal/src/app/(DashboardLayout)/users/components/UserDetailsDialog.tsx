"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loader2, Edit, UserCheck, UserX } from "lucide-react"
import { StaffUser, OwnerUser } from "@/lib/api/auth/auth.schemas"
import { useUser, useActivateUser, useDeactivateUser } from "@/lib/api/auth/auth.hooks"
import UserStatusBadge from "./UserStatusBadge"
import RoleBadge from "./RoleBadge"
import { format } from "date-fns"
import Image from "next/image"
import { getFlagPath } from "@/lib/country"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

interface UserDetailsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: string | null
}

const UserDetailsDialog = ({ open, onOpenChange, userId }: UserDetailsDialogProps) => {
  const { data: user, isLoading, error } = useUser(userId)
  const activateUser = useActivateUser()
  const deactivateUser = useDeactivateUser()
  const { toast } = useToast()
  const router = useRouter()

  const getInitials = (name: string) => 
    name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)

  const handleEdit = () => {
    if (!user) return
    onOpenChange(false)
    // Navigate to edit page - adjust route based on your routing structure
    router.push(`/users/${user.uuid}/edit`)
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto border-none">
        <DialogHeader>
          <DialogTitle>User Details</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-lg font-medium text-destructive">Failed to load user details</p>
            <p className="mt-2 text-sm text-muted-foreground">
              {error.message || "Please try again later"}
            </p>
          </div>
        ) : user ? (
          <div className="space-y-6">
            {/* Profile Header */}
            <div className="flex items-start gap-4 border-b border-border pb-6">
              <Avatar className="h-20 w-20">
                <AvatarImage src={
                  user.userType === 'staff' 
                    ? (user as StaffUser).profile.avatarUrl || undefined 
                    : undefined
                } />
                <AvatarFallback className="bg-primary/10 text-primary text-lg">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-bold">{user.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{user.email}</p>
                  </div>
                  <UserStatusBadge status={user.status} />
                </div>
              </div>
            </div>

            {/* Staff User Details */}
            {user.userType === 'staff' && (
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-3 text-sm text-muted-foreground uppercase">Roles</h4>
                  <div className="flex flex-wrap gap-2">
                    {(user as StaffUser).profile.roles.map((role) => (
                      <RoleBadge key={role} role={role} />
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Phone</p>
                    <p className="text-sm font-medium">
                      {user.countryCode && user.phoneNo 
                        ? `+${user.countryCode} ${user.phoneNo}`
                        : "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Email Verified</p>
                    <p className="text-sm font-medium">
                      {user.emailVerifiedAt 
                        ? format(new Date(user.emailVerifiedAt), "MMM d, yyyy")
                        : "Not verified"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Last Login</p>
                    <p className="text-sm font-medium">
                      {user.lastLoginAt 
                        ? format(new Date(user.lastLoginAt), "MMM d, yyyy 'at' h:mm a")
                        : "Never"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">User Type</p>
                    <Badge variant="outline" className="capitalize">{user.userType}</Badge>
                  </div>
                </div>

                {(user as StaffUser).profile.larksuiteOpenId && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Larksuite Open ID</p>
                    <p className="text-sm font-medium font-mono break-all">
                      {(user as StaffUser).profile.larksuiteOpenId}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Owner User Details */}
            {user.userType === 'owner' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Salutation</p>
                    <p className="text-sm font-medium">
                      {(user as OwnerUser).profile.salutation || "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">IC Number</p>
                    <p className="text-sm font-medium">
                      {(user as OwnerUser).profile.ic || "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Phone</p>
                    <p className="text-sm font-medium">
                      {user.countryCode && user.phoneNo ? (
                        <div className="flex items-center gap-2">
                          {getFlagPath(user.countryCode) && (
                            <Image
                              src={getFlagPath(user.countryCode)!}
                              alt={`Flag ${user.countryCode}`}
                              width={16}
                              height={12}
                              className="rounded-sm"
                            />
                          )}
                          <span>+{user.countryCode} {user.phoneNo}</span>
                        </div>
                      ) : "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Email Verified</p>
                    <p className="text-sm font-medium">
                      {user.emailVerifiedAt 
                        ? format(new Date(user.emailVerifiedAt), "MMM d, yyyy")
                        : "Not verified"}
                    </p>
                  </div>
                </div>

                {(user as OwnerUser).profile.address1 && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Address</p>
                    <p className="text-sm font-medium">
                      {(user as OwnerUser).profile.address1}
                      {(user as OwnerUser).profile.address2 && `, ${(user as OwnerUser).profile.address2}`}
                      {(user as OwnerUser).profile.city && `, ${(user as OwnerUser).profile.city}`}
                      {(user as OwnerUser).profile.state && `, ${(user as OwnerUser).profile.state}`}
                      {(user as OwnerUser).profile.postcode && ` ${(user as OwnerUser).profile.postcode}`}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Common Info */}
            <div className="border-t border-border pt-4">
              <h4 className="font-semibold mb-3 text-sm text-muted-foreground uppercase">Account Information</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">UUID</p>
                  <p className="text-sm font-medium font-mono break-all">{user.uuid}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Status</p>
                  <UserStatusBadge status={user.status} />
                </div>
              </div>
            </div>
          </div>
        ) : null}
        <DialogFooter className="flex items-center justify-between sm:justify-between">
          <div className="flex gap-2">
            {user && user.status === 'active' && (
              <Button
                variant="destructive"
                onClick={handleDeactivate}
                disabled={deactivateUser.isPending}
              >
                {deactivateUser.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deactivating...
                  </>
                ) : (
                  <>
                    <UserX className="mr-2 h-4 w-4" />
                    Deactivate
                  </>
                )}
              </Button>
            )}
            {user && user.status === 'deactivated' && (
              <Button
                variant="default"
                onClick={handleActivate}
                disabled={activateUser.isPending}
              >
                {activateUser.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Activating...
                  </>
                ) : (
                  <>
                    <UserCheck className="mr-2 h-4 w-4" />
                    Activate
                  </>
                )}
              </Button>
            )}
          </div>
          <Button onClick={handleEdit} disabled={!user}>
            <Edit className="mr-2 h-4 w-4" />
            Edit User
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default UserDetailsDialog

