"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Save, X } from "lucide-react"
import { StaffUser, OwnerUser, User, StaffType } from "@/lib/api/auth/auth.schemas"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/api/auth/auth.hooks"
import axios from "axios"
import { useState, useEffect, useMemo } from "react"
import { AUTH_QUERY_KEYS } from "@/lib/api/auth/constants"
import { ACTIVITY_LOGS_QUERY_KEYS } from "@/lib/api/activity-logs/constants"
import { useUser } from "@/lib/api/auth/auth.hooks"

interface EditUserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: User | null
}

const EditUserDialog = ({ open, onOpenChange, user: initialUser }: EditUserDialogProps) => {
  const { data: currentUser } = useAuth()
  // Fetch fresh user data that updates when queries are invalidated
  const { data: freshUserData } = useUser(initialUser?.uuid || null)
  // Use fresh user data if available, fallback to initial user prop
  const user = freshUserData || initialUser
  
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phoneNo, setPhoneNo] = useState("")
  const [selectedRole, setSelectedRole] = useState<StaffType>("staff")
  const queryClient = useQueryClient()
  const { toast } = useToast()

  // Check if current user is super-admin
  const isSuperAdmin = useMemo(() => {
    if (!currentUser || !currentUser.profile) return false
    const userRoles = currentUser.profile.roles || []
    const normalizedUserRoles = userRoles.map(role => {
      if (typeof role !== 'string') return ''
      return role.toLowerCase().trim().replace(/\s+/g, '-').replace(/_/g, '-')
    }).filter(role => role.length > 0)
    
    return normalizedUserRoles.some(role => 
      role === 'super-admin' || role === 'superadmin'
    )
  }, [currentUser])

  // Initialize form when user changes
  useEffect(() => {
    if (user) {
      setName(user.name || "")
      setEmail(user.email || "")
      setPhoneNo(user.phoneNo || "")
      
      // Initialize role for staff users
      if (user.userType === 'staff' && (user as StaffUser).profile.roles) {
        const roles = (user as StaffUser).profile.roles || []
        // Get the first role or default to 'staff'
        const firstRole = roles[0]?.toLowerCase().replace(/\s+/g, '-').replace(/_/g, '-')
        let newRole: StaffType = 'staff'
        if (firstRole === 'super-admin' || firstRole === 'superadmin' || firstRole === 'super_admin') {
          newRole = 'super-admin'
        } else if (firstRole === 'admin') {
          newRole = 'admin'
        } else {
          newRole = 'staff'
        }
        
        setSelectedRole(newRole)
      }
    }
  }, [user])

  const updateUser = useMutation({
    mutationFn: async (data: { name?: string; email?: string; phoneNo?: string; staffType?: StaffType }) => {
      if (!user) throw new Error("No user selected")
      
      const identifier = user.id ? String(user.id) : user.uuid
      // Use the correct endpoint: PUT /api/auth/users/{id}/profile (proxies to Laravel PUT /api/v1/users/{id}/profile)
      // This endpoint handles profile updates: name, email, phone_no, country_code
      const endpoint = `/api/auth/users/${identifier}/profile`
      
      const { data: response } = await axios.put(endpoint, data)
      return response
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.USERS })
      if (user) {
        queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.USER(user.uuid) })
      }
      // Don't show toast here - handled in handleSubmit
    },
    onError: (error: any) => {
      // Don't show toast here - handled in handleSubmit
      throw error // Re-throw so we can catch it in handleSubmit
    },
  })

  const changeStaffType = useMutation({
    mutationFn: async (staffType: StaffType) => {
      if (!user) throw new Error("No user selected")
      
      const identifier = user.id ? String(user.id) : user.uuid
      const { data: response } = await axios.post(`/api/auth/users/${identifier}/change-staff-type`, { staffType })
      return response
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.USERS })
      if (user) {
        // Invalidate and refetch user query to update UserDetailsDialog immediately
        queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.USER(user.uuid) })
        queryClient.refetchQueries({ queryKey: AUTH_QUERY_KEYS.USER(user.uuid) })
      }
      // Refetch activity logs instead of invalidating to preserve previous data during refetch
      // This prevents the audit log from temporarily showing empty during refetch
      queryClient.refetchQueries({ queryKey: ACTIVITY_LOGS_QUERY_KEYS.LIST })
      // Don't show toast here - handled in handleSubmit
    },
    onError: (error: any) => {
      // Don't show toast here - handled in handleSubmit
      throw error // Re-throw so we can catch it in handleSubmit
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    const updateData: { name?: string; email?: string; phoneNo?: string } = {}
    // Only include fields that have actually changed and have non-empty values
    // Treat null/undefined/empty string as equivalent to avoid false positives
    if (name !== user.name && name.trim() !== '') updateData.name = name
    if (email !== user.email && email.trim() !== '') updateData.email = email
    // For phoneNo: only update if there's a meaningful change (handle null vs empty string)
    const normalizedPhoneNo = phoneNo.trim() || null
    const normalizedUserPhoneNo = user.phoneNo?.trim() || null
    if (normalizedPhoneNo !== normalizedUserPhoneNo) {
      // Only include phoneNo if it's not empty, or if we're clearing it (user had phone, now empty)
      if (normalizedPhoneNo !== null || normalizedUserPhoneNo !== null) {
        updateData.phoneNo = normalizedPhoneNo || ''
      }
    }

    // Check for role changes - use fresh user data
    let normalizedCurrentRole: StaffType = 'staff'
    let hasRoleChange = false
    if (user.userType === 'staff' && isSuperAdmin) {
      const currentRole = (user as StaffUser).profile.roles?.[0]?.toLowerCase().replace(/\s+/g, '-').replace(/_/g, '-')
      normalizedCurrentRole = currentRole === 'super-admin' || currentRole === 'superadmin' || currentRole === 'super_admin' 
        ? 'super-admin' 
        : currentRole === 'admin' 
        ? 'admin' 
        : 'staff'
      
      hasRoleChange = selectedRole !== normalizedCurrentRole
      
      // Prevent API call if role hasn't actually changed
      if (!hasRoleChange && Object.keys(updateData).length === 0) {
        toast({
          title: 'No changes',
          description: 'No changes were made.',
        })
        return
      }
    }

    // If no changes at all
    if (Object.keys(updateData).length === 0 && !hasRoleChange) {
      toast({
        title: 'No changes',
        description: 'No changes were made.',
      })
      return
    }

    const hasUserInfoChanges = Object.keys(updateData).length > 0
    const mutations: Promise<any>[] = []

    try {
      // Collect all mutations
      if (hasUserInfoChanges) {
        mutations.push(updateUser.mutateAsync(updateData))
      }
      if (hasRoleChange) {
        mutations.push(changeStaffType.mutateAsync(selectedRole))
      }

      // Wait for all mutations to complete
      await Promise.all(mutations)

      // All mutations succeeded - show single success toast
      const changes: string[] = []
      if (hasUserInfoChanges) changes.push('user information')
      if (hasRoleChange) changes.push('role')
      
      toast({
        title: 'User updated successfully',
        description: `User ${changes.join(' and ')} has been updated.`,
      })

      // Close dialog on success
      onOpenChange(false)
    } catch (error: any) {
      // One or more mutations failed - show error toast
      const errorMessage = error?.response?.data?.message || error?.message || 'Please try again.'
      
      toast({
        variant: 'destructive',
        title: 'Failed to update user',
        description: errorMessage,
      })
    }
  }

  const handleRoleChange = (value: StaffType) => {
    setSelectedRole(value)
  }

  if (!user) return null

  const isStaff = user.userType === 'staff'

  const handleClose = () => {
    if (updateUser.isPending || changeStaffType.isPending) return
    onOpenChange(false)
    // Reset form when closing - use fresh user data if available
    const userToReset = freshUserData || initialUser
    if (userToReset) {
      setName(userToReset.name || "")
      setEmail(userToReset.email || "")
      setPhoneNo(userToReset.phoneNo || "")
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent 
        className="max-w-2xl max-h-[90vh] overflow-y-auto bg-background dark:bg-darkgray border-2 border-border shadow-2xl"
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Edit User</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={updateUser.isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={updateUser.isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phoneNo">Phone Number</Label>
            <Input
              id="phoneNo"
              value={phoneNo}
              onChange={(e) => setPhoneNo(e.target.value)}
              disabled={updateUser.isPending}
            />
          </div>

          {isStaff && isSuperAdmin && (
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select 
                value={selectedRole} 
                onValueChange={handleRoleChange}
                disabled={updateUser.isPending || changeStaffType.isPending}
              >
                <SelectTrigger id="role">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="super-admin">Super Admin</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="staff">Staff</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {selectedRole === "super-admin"
                  ? "Super Admins have full system access and can manage all users."
                  : selectedRole === "admin"
                  ? "Admins have elevated permissions to manage users and settings."
                  : "Staff members have standard access to the system."}
              </p>
            </div>
          )}

          {!isStaff && (user as OwnerUser).profile && (
            <>
              <div className="space-y-2">
                <Label htmlFor="salutation">Salutation</Label>
                <Input
                  id="salutation"
                  value={(user as OwnerUser).profile.salutation || ""}
                  disabled
                  className="bg-muted"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ic">IC Number</Label>
                <Input
                  id="ic"
                  value={(user as OwnerUser).profile.ic || ""}
                  disabled
                  className="bg-muted"
                />
              </div>
            </>
          )}

          <DialogFooter className="flex items-center justify-between sm:justify-between gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={updateUser.isPending || changeStaffType.isPending}
            >
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={updateUser.isPending || changeStaffType.isPending}
            >
              {updateUser.isPending || changeStaffType.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default EditUserDialog

