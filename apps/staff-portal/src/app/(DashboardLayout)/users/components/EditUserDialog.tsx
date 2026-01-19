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

interface EditUserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: User | null
}

const EditUserDialog = ({ open, onOpenChange, user }: EditUserDialogProps) => {
  const { data: currentUser } = useAuth()
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
        if (firstRole === 'super-admin' || firstRole === 'superadmin' || firstRole === 'super_admin') {
          setSelectedRole('super-admin')
        } else if (firstRole === 'admin') {
          setSelectedRole('admin')
        } else {
          setSelectedRole('staff')
        }
      }
    }
  }, [user])

  const updateUser = useMutation({
    mutationFn: async (data: { name?: string; email?: string; phoneNo?: string; staffType?: StaffType }) => {
      if (!user) throw new Error("No user selected")
      
      const identifier = user.id ? String(user.id) : user.uuid
      const endpoint = user.userType === 'staff' 
        ? `/api/staff/${identifier}`
        : `/api/owners/${identifier}`
      
      const { data: response } = await axios.put(endpoint, data)
      return response
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.USERS })
      if (user) {
        queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.USER(user.uuid) })
      }
      toast({
        title: 'User updated',
        description: 'User information has been updated successfully.',
      })
      onOpenChange(false)
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Failed to update user',
        description: error?.response?.data?.message || error?.message || 'Please try again.',
      })
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
        queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.USER(user.uuid) })
      }
      toast({
        title: 'Role updated',
        description: 'User role has been updated successfully.',
      })
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Failed to update role',
        description: error?.response?.data?.message || error?.message || 'Please try again.',
      })
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    const updateData: { name?: string; email?: string; phoneNo?: string } = {}
    if (name !== user.name) updateData.name = name
    if (email !== user.email) updateData.email = email
    if (phoneNo !== user.phoneNo) updateData.phoneNo = phoneNo

    // Check for role changes
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
    }

    // If no changes at all
    if (Object.keys(updateData).length === 0 && !hasRoleChange) {
      toast({
        title: 'No changes',
        description: 'No changes were made.',
      })
      return
    }

    // Update user info if there are changes
    if (Object.keys(updateData).length > 0) {
      updateUser.mutate(updateData)
    }

    // Update role if it's a staff user and role changed
    if (hasRoleChange) {
      changeStaffType.mutate(selectedRole)
    }
  }

  const handleRoleChange = (value: StaffType) => {
    setSelectedRole(value)
  }

  if (!user) return null

  const isStaff = user.userType === 'staff'

  const handleClose = () => {
    if (updateUser.isPending) return
    onOpenChange(false)
    // Reset form when closing
    if (user) {
      setName(user.name || "")
      setEmail(user.email || "")
      setPhoneNo(user.phoneNo || "")
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
              disabled={updateUser.isPending}
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

