"use client"

import { VisuallyHidden } from "@radix-ui/react-visually-hidden"
import { Dialog, DialogContent, DialogFooter, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Loader2, Save, X, User as UserIcon, Phone, Mail, MapPin, Shield, Globe } from "lucide-react"
import { StaffUser, OwnerUser, User, StaffType } from "@/lib/api/auth/auth.schemas"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/api/auth/auth.hooks"
import axios from "axios"
import { useState, useEffect, useMemo } from "react"
import { AUTH_QUERY_KEYS } from "@/lib/api/auth/constants"
import { ACTIVITY_LOGS_QUERY_KEYS } from "@/lib/api/activity-logs/constants"
import { useUser } from "@/lib/api/auth/auth.hooks"
import { AdminDialogHeader } from "./AdminDialogHeader"
import { AdminSection } from "./AdminSection"
import { AdminFormField } from "./AdminFormField"
import UserStatusBadge from "./UserStatusBadge"
import { COUNTRY_CODES } from "@/lib/country"
import Image from "next/image"
import { getFlagPath } from "@/lib/country"

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
  const [countryCode, setCountryCode] = useState<string>("")
  const [phoneNo, setPhoneNo] = useState("")
  const [location, setLocation] = useState("")
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

  // Check if the user being edited is a super admin
  const isEditedUserSuperAdmin = useMemo(() => {
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

  // Initialize form when user changes
  useEffect(() => {
    if (user) {
      setName(user.name || "")
      setEmail(user.email || "")
      setCountryCode(user.countryCode || "")
      setPhoneNo(user.phoneNo || "")
      
      // Format location from owner address fields
      if (user.userType === 'owner') {
        const owner = user as OwnerUser
        const addressParts = [
          owner.profile.address1,
          owner.profile.address2,
          owner.profile.city,
          owner.profile.state,
          owner.profile.postcode,
        ].filter(Boolean)
        setLocation(addressParts.join(", ") || "")
      }
      
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
    mutationFn: async (data: { name?: string; email?: string; phoneNo?: string; countryCode?: string; staffType?: StaffType }) => {
      if (!user) throw new Error("No user selected")
      
      // For owners, prefer UUID (more reliable and universal)
      // For staff, use ID if available, otherwise UUID
      const identifier = user.userType === 'owner'
        ? (user.uuid || (user.id ? String(user.id) : ''))
        : (user.id ? String(user.id) : user.uuid)
      
      if (!identifier) {
        throw new Error("No valid identifier found for user")
      }
      
      // Transform camelCase to snake_case for backend
      const backendData: Record<string, any> = {}
      if (data.name !== undefined) backendData.name = data.name
      if (data.email !== undefined) backendData.email = data.email
      if (data.phoneNo !== undefined) backendData.phone_no = data.phoneNo
      if (data.countryCode !== undefined) backendData.country_code = data.countryCode
      
      // IMPORTANT: Backend OwnerController::update() method is not yet implemented
      // Use /api/users/{id}/profile for owner updates (this endpoint works)
      // Use /api/auth/users/{id}/profile for staff profiles (super-admin/admin only)
      const endpoint = user.userType === 'owner'
        ? `/api/users/${identifier}/profile`
        : `/api/auth/users/${identifier}/profile`
      
      const { data: response } = await axios.put(endpoint, backendData)
      return response
    },
    onSuccess: (response) => {
      // Invalidate and refetch user/owner queries to ensure UserDetailsDialog updates
      if (user) {
        if (user.userType === 'owner') {
          // Invalidate owner list to refresh the table
          queryClient.invalidateQueries({ queryKey: ['owners'] })
          // Invalidate and refetch individual owner query to update UserDetailsDialog immediately
          queryClient.invalidateQueries({ queryKey: ['owner', user.uuid] })
          queryClient.refetchQueries({ queryKey: ['owner', user.uuid] })
          // Also invalidate user query in case it's being used
          queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.USER(user.uuid) })
        } else {
          // Invalidate staff user list to refresh the table
          queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.USERS })
          // Invalidate and refetch individual user query to update UserDetailsDialog immediately
          queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.USER(user.uuid) })
          queryClient.refetchQueries({ queryKey: AUTH_QUERY_KEYS.USER(user.uuid) })
          // Also invalidate owner query in case it's being used
          queryClient.invalidateQueries({ queryKey: ['owner', user.uuid] })
        }
      }
      // Refetch activity logs instead of invalidating to preserve previous data during refetch
      // This prevents the audit log from temporarily showing empty during refetch
      // Activity logs are immutable and append-only, so we preserve integrity by using refetchQueries
      queryClient.refetchQueries({ queryKey: ACTIVITY_LOGS_QUERY_KEYS.LIST })
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

    const updateData: { name?: string; email?: string; phoneNo?: string; countryCode?: string } = {}
    // Only include fields that have actually changed and have non-empty values
    // Treat null/undefined/empty string as equivalent to avoid false positives
    if (name !== user.name && name.trim() !== '') updateData.name = name
    if (email !== user.email && email.trim() !== '') updateData.email = email
    // For countryCode: only update if there's a change
    const normalizedCountryCode = countryCode.trim() || null
    const normalizedUserCountryCode = user.countryCode?.trim() || null
    if (normalizedCountryCode !== normalizedUserCountryCode) {
      updateData.countryCode = normalizedCountryCode || ''
    }
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
    // Skip role change logic if editing a super admin (they cannot have their role changed)
    let normalizedCurrentRole: StaffType = 'staff'
    let hasRoleChange = false
    if (user.userType === 'staff' && isSuperAdmin && !isEditedUserSuperAdmin) {
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
      // Handle backend error format: { error: "ERROR_CODE", message: "...", status: 400, fields?: {...} }
      let errorTitle = 'Failed to update user'
      let errorDescription = 'Please try again.'
      
      // Check for backend error format
      if (error?.code || error?.status) {
        const status = error.status || error?.response?.status
        const code = error.code || error?.response?.data?.error
        
        if (status === 409 || code === 'RESOURCE_ALREADY_EXISTS') {
          // Duplicate email or IC
          errorTitle = 'Duplicate Entry'
          errorDescription = error.message || error?.response?.data?.message || 'A user with this email or IC already exists.'
        } else if (status === 404 || code === 'RESOURCE_NOT_FOUND') {
          // Owner not found
          errorTitle = 'User Not Found'
          errorDescription = error.message || error?.response?.data?.message || 'The user you\'re trying to update no longer exists.'
        } else if (status === 422 || code === 'INVALID_FORMAT') {
          // Validation errors
          if (error.fields || error?.response?.data?.fields) {
            const fields = error.fields || error?.response?.data?.fields
            const fieldErrors = Object.entries(fields)
              .map(([field, messages]: [string, any]) => {
                const msgArray = Array.isArray(messages) ? messages : [messages]
                return `${field}: ${msgArray.join(', ')}`
              })
              .join('\n')
            errorTitle = 'Validation Error'
            errorDescription = fieldErrors
          } else {
            errorTitle = 'Validation Error'
            errorDescription = error.message || error?.response?.data?.message || 'Please check your input and try again.'
          }
        } else {
          // Other errors
          errorDescription = error.message || error?.response?.data?.message || 'Please try again.'
        }
      } else {
        // Legacy error format
        errorDescription = error?.response?.data?.message || error?.message || 'Please try again.'
      }
      
      toast({
        variant: 'destructive',
        title: errorTitle,
        description: errorDescription,
      })
    }
  }

  const handleRoleChange = (value: StaffType) => {
    setSelectedRole(value)
  }

  if (!user) return null

  const isStaff = user.userType === 'staff'
  const getInitials = (name: string) => 
    name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)

  const handleClose = () => {
    if (updateUser.isPending || changeStaffType.isPending) return
    onOpenChange(false)
    // Reset form when closing - use fresh user data if available
    const userToReset = freshUserData || initialUser
    if (userToReset) {
      setName(userToReset.name || "")
      setEmail(userToReset.email || "")
      setCountryCode(userToReset.countryCode || "")
      setPhoneNo(userToReset.phoneNo || "")
      if (userToReset.userType === 'owner') {
        const owner = userToReset as OwnerUser
        const addressParts = [
          owner.profile.address1,
          owner.profile.address2,
          owner.profile.city,
          owner.profile.state,
          owner.profile.postcode,
        ].filter(Boolean)
        setLocation(addressParts.join(", ") || "")
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent 
        className="max-w-lg overflow-hidden p-0 sm:max-w-xl rounded-lg shadow-2xl bg-background dark:bg-darkgray border-2 border-border"
      >
        <VisuallyHidden>
          <DialogTitle>Edit User</DialogTitle>
        </VisuallyHidden>
        <AdminDialogHeader
          title="EDIT USER"
          name={user.name}
          email={user.email}
          avatarUrl={isStaff ? (user as StaffUser).profile.avatarUrl || undefined : undefined}
          className="mb-0"
        />

        <form onSubmit={handleSubmit}>
          <div className="max-h-[60vh] space-y-6 overflow-y-auto p-6 pt-4">
            <AdminSection title="Personal Information">
              <div className="grid gap-4 sm:grid-cols-2">
                <AdminFormField
                  id="name"
                  label="Full Name"
                  icon={UserIcon}
                  value={name}
                  onChange={setName}
                  placeholder="Enter full name"
                  disabled={updateUser.isPending}
                />
                <AdminFormField
                  id="email"
                  label="Email Address"
                  icon={Mail}
                  type="email"
                  value={email}
                  onChange={setEmail}
                  placeholder="Enter email address"
                  disabled={updateUser.isPending}
                />
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <Globe className="h-4 w-4" />
                    Country Code
                  </Label>
                  <Select
                    value={countryCode || ""}
                    onValueChange={setCountryCode}
                    disabled={updateUser.isPending}
                  >
                    <SelectTrigger className="h-11 border-border/50 bg-[var(--field-bg)] dark:bg-[var(--field-bg)] transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20">
                      <SelectValue placeholder="Select country code">
                        {countryCode ? (
                          <div className="flex items-center gap-2">
                            {getFlagPath(countryCode) && (
                              <Image
                                src={getFlagPath(countryCode)!}
                                alt={`Flag ${countryCode}`}
                                width={16}
                                height={12}
                                className="rounded-sm shrink-0"
                              />
                            )}
                            <span>+{countryCode}</span>
                          </div>
                        ) : (
                          "Select country code"
                        )}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="bg-popover">
                      {COUNTRY_CODES.map((country) => (
                        <SelectItem key={country.code} value={country.code}>
                          <div className="flex items-center gap-2">
                            {getFlagPath(country.code) && (
                              <Image
                                src={getFlagPath(country.code)!}
                                alt={`Flag ${country.code}`}
                                width={16}
                                height={12}
                                className="rounded-sm shrink-0"
                              />
                            )}
                            <span>+{country.code} - {country.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <AdminFormField
                  id="phone"
                  label="Phone Number"
                  icon={Phone}
                  type="tel"
                  value={phoneNo || ""}
                  onChange={setPhoneNo}
                  placeholder="Enter phone number"
                  disabled={updateUser.isPending}
                />
                <AdminFormField
                  id="location"
                  label="Location"
                  icon={MapPin}
                  value={location || ""}
                  onChange={setLocation}
                  placeholder="Enter location"
                  disabled={updateUser.isPending}
                />
              </div>
            </AdminSection>

            {isStaff && isSuperAdmin && (
              <AdminSection title="Account Information">
                <div className="space-y-4">
                  {/* Role Select */}
                  <div className="group space-y-2">
                    <Label className="flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors group-focus-within:text-primary">
                      <Shield className="h-4 w-4" />
                      Role
                    </Label>
                    {isEditedUserSuperAdmin ? (
                      <div className="h-11 flex items-center px-3 rounded-md border border-border/50 bg-muted/50 text-sm text-muted-foreground cursor-not-allowed">
                        Super Admin
                      </div>
                    ) : (
                      <Select
                        value={selectedRole}
                        onValueChange={handleRoleChange}
                        disabled={updateUser.isPending || changeStaffType.isPending}
                      >
                        <SelectTrigger className="h-11 border-border/50 bg-[var(--field-bg)] dark:bg-[var(--field-bg)] transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20">
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent className="bg-popover">
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="staff">Staff</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </div>

                  {/* Current Status Preview */}
                  <div className="flex items-center gap-3 rounded-lg border border-dashed border-border/50 bg-muted/30 p-3">
                    <span className="text-sm text-muted-foreground">
                      Current status:
                    </span>
                    <UserStatusBadge status={user.status} />
                  </div>
                </div>
              </AdminSection>
            )}
          </div>

          <DialogFooter className="flex-row justify-end gap-2 border-t bg-muted/30 px-6 py-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={updateUser.isPending || changeStaffType.isPending}
              className="gap-2 transition-all duration-200 hover:bg-muted hover:text-foreground"
            >
              <X className="h-4 w-4" />
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={updateUser.isPending || changeStaffType.isPending}
              className="gap-2 bg-gradient-to-r from-primary to-secondary text-white transition-all duration-200 hover:opacity-90 hover:shadow-lg"
            >
              {updateUser.isPending || changeStaffType.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
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
