"use client"

import { VisuallyHidden } from "@radix-ui/react-visually-hidden"
import { Dialog, DialogContent, DialogFooter, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Building2, Loader2, Save, X, User as UserIcon, Phone, Mail, MapPin, Shield, Globe } from "lucide-react"
import { StaffUser, OwnerUser, VendorUser, User, StaffType, UserDepartments } from "@/lib/api/auth/auth.schemas"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/api/auth/auth.hooks"
import { updateOwner, updateVendor } from "@/lib/api/auth/auth"
import axios, { AxiosError } from "axios"
import { mapDepartmentToBackendFormat } from "@/lib/api/utils/department"
import { laravelRootApi } from "@/lib/api/axios"
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

const DEPARTMENTS = UserDepartments.map(dept => ({
  value: dept,
  label: dept
}))

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
  const [salutation, setSalutation] = useState<string>("")
  const [address1, setAddress1] = useState("")
  const [address2, setAddress2] = useState("")
  const [city, setCity] = useState("")
  const [state, setState] = useState("")
  const [postcode, setPostcode] = useState("")
  const [selectedRole, setSelectedRole] = useState<StaffType>("staff")
  const [selectedDepartment, setSelectedDepartment] = useState<string>("")
  const queryClient = useQueryClient()
  const { toast } = useToast()

  // Check if current user is super-admin
  const isSuperAdmin = useMemo(() => {
    if (!currentUser || !currentUser.profile) return false
    const userRoles = (currentUser as StaffUser).profile?.roles || []
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

  // Check if the current user is trying to edit themselves
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
    const userRoles = (currentUser as StaffUser).profile?.roles || []
    const normalizedUserRoles = userRoles.map(role => {
      if (typeof role !== 'string') return ''
      return role.toLowerCase().trim().replace(/\s+/g, '-').replace(/_/g, '-')
    }).filter(role => role.length > 0)

    const isSuperAdmin = normalizedUserRoles.some(role =>
      role === 'super-admin' || role === 'superadmin' || role === 'super_admin'
    )
    const isAdmin = normalizedUserRoles.includes('admin')

    // Admin but not super-admin
    return isAdmin && !isSuperAdmin
  }, [currentUser])

  // Initialize form when user changes
  useEffect(() => {
    if (user) {
      setEmail(user.email || "")
      setCountryCode(user.countryCode || "")
      setPhoneNo(user.phoneNo || "")

      // Handle name - remove salutation prefix if it exists
      let cleanName = user.name || ""
      if (user.userType === 'owner' || user.userType === 'vendor') {
        const ownerOrVendor = user as OwnerUser | VendorUser
        const salutationValue = ownerOrVendor.profile.salutation || ""

        // Set salutation
        setSalutation(salutationValue || "")

        // Remove salutation from name if it's prefixed
        if (salutationValue && cleanName.startsWith(salutationValue)) {
          cleanName = cleanName.substring(salutationValue.length).trim()
        }

        // Set address fields
        setAddress1(ownerOrVendor.profile.address1 || "")
        setAddress2(ownerOrVendor.profile.address2 || "")
        setCity(ownerOrVendor.profile.city || "")
        setState(ownerOrVendor.profile.state || "")
        setPostcode(ownerOrVendor.profile.postcode || "")

        // Format location from address fields
        const addressParts = [
          ownerOrVendor.profile.address1,
          ownerOrVendor.profile.address2,
          ownerOrVendor.profile.city,
          ownerOrVendor.profile.state,
          ownerOrVendor.profile.postcode,
        ].filter(Boolean)
        setLocation(addressParts.join(", ") || "")
      } else {
        // Staff users don't have salutation
        setSalutation("")
        setAddress1("")
        setAddress2("")
        setCity("")
        setState("")
        setPostcode("")
        setLocation("")
      }

      setName(cleanName)

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

        // Initialize department for staff users
        const validDepartments = UserDepartments
        const userProfile = (user as StaffUser).profile

        // Priority 1: Direct department field
        if (userProfile.department) {
          setSelectedDepartment(userProfile.department)
        } else {
          // Priority 2: Fallback to roles extraction
          const department = roles.find((role: string) => validDepartments.includes(role as any))
          if (department) {
            setSelectedDepartment(department)
          } else {
            setSelectedDepartment("")
          }
        }
      }
    }
  }, [user])

  const updateUser = useMutation({
    mutationFn: async (data: {
      name?: string
      email?: string
      phoneNo?: string
      countryCode?: string
      salutation?: string
      address1?: string
      address2?: string
      city?: string
      state?: string
      postcode?: string
      staffType?: StaffType
      department?: string
    }) => {
      if (!user) throw new Error("No user selected")

      // For owners and vendors, use updateOwner/updateVendor functions
      if (user.userType === 'owner' || user.userType === 'vendor') {
        const identifier = user.uuid || (user.id ? String(user.id) : '')
        if (!identifier) {
          throw new Error("No valid identifier found for user")
        }

        if (user.userType === 'owner') {
          return await updateOwner(identifier, data)
        } else {
          return await updateVendor(identifier, data)
        }
      }

      // For staff users, use the Next.js API route (which proxies to Laravel)
      const identifier = user.id ? String(user.id) : user.uuid
      if (!identifier) {
        throw new Error("No valid identifier found for user")
      }

      // Transform camelCase to snake_case for backend
      const backendData: Record<string, any> = {
        user_type: 'staff'
      }
      if (data.name !== undefined) backendData.name = data.name
      if (data.email !== undefined) backendData.email = data.email
      if (data.phoneNo !== undefined) backendData.phone_no = data.phoneNo
      if (data.countryCode !== undefined) backendData.country_code = data.countryCode
      
      // Include staff_type in the same request
      if (data.staffType !== undefined) {
        backendData.staff_type = data.staffType
      }
      
      // Map department to backend format (capitalized with spaces)
      if (data.department !== undefined) {
        backendData.department = mapDepartmentToBackendFormat(data.department)
      }

      // Use the Next.js API route which handles CSRF and authentication
      const { data: response } = await axios.put(`/api/users/${identifier}`, backendData)
      return response
    },
    onSuccess: (response) => {
      // Invalidate and refetch user/owner/vendor queries to ensure UserDetailsDialog updates
      if (user) {
        if (user.userType === 'owner') {
          // Invalidate owner list to refresh the table
          queryClient.invalidateQueries({ queryKey: ['owners'] })
          // Invalidate and refetch individual owner query to update UserDetailsDialog immediately
          queryClient.invalidateQueries({ queryKey: ['owner', user.uuid] })
          queryClient.refetchQueries({ queryKey: ['owner', user.uuid] })
          // Also invalidate user query in case it's being used
          queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.USER(user.uuid) })
        } else if (user.userType === 'vendor') {
          // Invalidate vendor list to refresh the table
          queryClient.invalidateQueries({ queryKey: ['vendors'] })
          // Invalidate and refetch individual vendor query to update UserDetailsDialog immediately
          queryClient.invalidateQueries({ queryKey: ['vendor', user.uuid] })
          queryClient.refetchQueries({ queryKey: ['vendor', user.uuid] })
          // Also invalidate user query in case it's being used
          queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.USER(user.uuid) })
        } else {
          // Invalidate staff user list to refresh the table
          queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.USERS })
          // Invalidate and refetch individual user query to update UserDetailsDialog immediately
          queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.USER(user.uuid) })
          queryClient.refetchQueries({ queryKey: AUTH_QUERY_KEYS.USER(user.uuid) })
          // Also invalidate owner/vendor queries in case it's being used
          queryClient.invalidateQueries({ queryKey: ['owner', user.uuid] })
          queryClient.invalidateQueries({ queryKey: ['vendor', user.uuid] })
        }
      }
      // Refetch activity logs instead of invalidating to preserve previous data during refetch
      // This prevents the audit log from temporarily showing empty during refetch
      // Activity logs are immutable and append-only, so we preserve integrity by using refetchQueries
      queryClient.refetchQueries({ queryKey: ACTIVITY_LOGS_QUERY_KEYS.LIST })
      // Don't show toast here - handled in handleSubmit
    },
    onError: (error: unknown) => {
      // Don't show toast here - handled in handleSubmit
      throw error // Re-throw so we can catch it in handleSubmit
    },
  })

  const changeStaffType = useMutation({
    mutationFn: async (payload: { staffType: StaffType; department?: string }) => {
      if (!user) throw new Error("No user selected")

      const identifier = user.id ? String(user.id) : user.uuid
      const { data: response } = await laravelRootApi.post(`/api/auth/users/${identifier}/change-staff-type`, payload)
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

    // Prevent admins from editing themselves
    if (isCurrentUserAdmin && isCurrentUser) {
      toast({
        variant: 'destructive',
        title: 'Cannot edit own account',
        description: 'Admins cannot edit their own account. Please contact a super admin for assistance.',
      })
      return
    }
    if (!user) return

    const updateData: {
      name?: string
      email?: string
      phoneNo?: string
      countryCode?: string
      salutation?: string
      address1?: string
      address2?: string
      city?: string
      state?: string
      postcode?: string
      staffType?: StaffType
      department?: string
    } = {}

    // Only include fields that have actually changed and have non-empty values
    // Handle name - compare with clean name (without salutation)
    let userCleanName = user.name || ""
    if (user.userType === 'owner' || user.userType === 'vendor') {
      const ownerOrVendor = user as OwnerUser | VendorUser
      const userSalutation = ownerOrVendor.profile.salutation || ""
      if (userSalutation && userCleanName.startsWith(userSalutation)) {
        userCleanName = userCleanName.substring(userSalutation.length).trim()
      }
    }
    if (name !== userCleanName && name.trim() !== '') updateData.name = name
    if (email !== user.email && email.trim() !== '') updateData.email = email

    const normalizedCountryCode = countryCode.trim() || null
    const normalizedUserCountryCode = user.countryCode?.trim() || null
    if (normalizedCountryCode !== normalizedUserCountryCode) {
      updateData.countryCode = normalizedCountryCode || ''
    }

    const normalizedPhoneNo = phoneNo.trim() || null
    const normalizedUserPhoneNo = user.phoneNo?.trim() || null
    if (normalizedPhoneNo !== normalizedUserPhoneNo) {
      if (normalizedPhoneNo !== null || normalizedUserPhoneNo !== null) {
        updateData.phoneNo = normalizedPhoneNo || ''
      }
    }

    if (user.userType === 'owner' || user.userType === 'vendor') {
      const ownerOrVendor = user as OwnerUser | VendorUser
      const normalizedSalutation = salutation.trim() || null
      const normalizedUserSalutation = ownerOrVendor.profile.salutation?.trim() || null
      if (normalizedSalutation !== normalizedUserSalutation) {
        updateData.salutation = normalizedSalutation || ''
      }
      if (address1 !== ownerOrVendor.profile.address1) updateData.address1 = address1
      if (address2 !== ownerOrVendor.profile.address2) updateData.address2 = address2
      if (city !== ownerOrVendor.profile.city) updateData.city = city
      if (state !== ownerOrVendor.profile.state) updateData.state = state
      if (postcode !== ownerOrVendor.profile.postcode) updateData.postcode = postcode
    }

    // Check for role/department changes - only for staff and super-admin
    let hasRoleOrDeptUpdate = false
    let normalizedCurrentRole: StaffType = 'staff'
    let hasRoleChange = false
    let hasDeptChange = false

    if (user.userType === 'staff' && isSuperAdmin && !isEditedUserSuperAdmin) {
      const currentRole = (user as StaffUser).profile.roles?.[0]?.toLowerCase().replace(/\s+/g, '-').replace(/_/g, '-')
      normalizedCurrentRole = currentRole === 'super-admin' || currentRole === 'superadmin' || currentRole === 'super_admin'
        ? 'super-admin'
        : currentRole === 'admin'
          ? 'admin'
          : 'staff'

      hasRoleChange = selectedRole !== normalizedCurrentRole

      const currentRoles = (user as StaffUser).profile.roles || []
      const currentDirectDept = (user as StaffUser).profile.department
      const currentRoleDept = currentRoles.find(role => UserDepartments.includes(role as any))
      const normalizedCurrentDept = currentDirectDept || currentRoleDept || ""

      hasDeptChange = selectedDepartment !== normalizedCurrentDept

      hasRoleOrDeptUpdate = hasRoleChange || hasDeptChange
    }

    // Add department to updateData if changed
    if (hasDeptChange) {
      updateData.department = selectedDepartment
    }

    // Include staffType in updateData if role changed
    if (hasRoleChange) {
      updateData.staffType = selectedRole
    }

    if (Object.keys(updateData).length === 0) {
      toast({
        title: 'No changes',
        description: 'No changes were made.',
      })
      return
    }

    try {
      // SINGLE REQUEST with all fields (name, phone, department, staff_type)
      await updateUser.mutateAsync(updateData)

      const changes: string[] = []
      const otherInfoChanges = Object.keys(updateData).filter(k => k !== 'department' && k !== 'staffType').length > 0

      if (otherInfoChanges && hasDeptChange && hasRoleChange) changes.push('user information, department, and role')
      else if (otherInfoChanges && hasDeptChange) changes.push('user information and department')
      else if (otherInfoChanges && hasRoleChange) changes.push('user information and role')
      else if (hasDeptChange && hasRoleChange) changes.push('department and role')
      else if (otherInfoChanges) changes.push('user information')
      else if (hasDeptChange) changes.push('department')
      else if (hasRoleChange) changes.push('role')

      toast({
        title: 'User updated successfully',
        description: `User ${changes.join(' and ')} has been updated.`,
      })

      onOpenChange(false)
    } catch (error: unknown) {
      let errorTitle = 'Failed to update user'
      let errorDescription = 'Please try again.'

      const err = error as any

      if (err?.code || err?.status || err?.response?.status) {
        const status = err.status || err?.response?.status
        const code = err.code || err?.response?.data?.error

        if (status === 409 || code === 'RESOURCE_ALREADY_EXISTS') {
          errorTitle = 'Duplicate Entry'
          errorDescription = err.message || err?.response?.data?.message || 'A user with this email or IC already exists.'
        } else if (status === 404 || code === 'RESOURCE_NOT_FOUND') {
          errorTitle = 'User Not Found'
          errorDescription = err.message || err?.response?.data?.message || 'The user you\'re trying to update no longer exists.'
        } else if (status === 422 || code === 'INVALID_FORMAT') {
          if (err.fields || err?.response?.data?.fields) {
            const fields = err.fields || err?.response?.data?.fields
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
            errorDescription = err.message || err?.response?.data?.message || 'Please check your input and try again.'
          }
        } else {
          errorDescription = err.message || err?.response?.data?.message || 'Please try again.'
        }
      } else {
        errorDescription = err?.response?.data?.message || err?.message || 'Please try again.'
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
    if (updateUser.isPending) return
    onOpenChange(false)
    // Reset form when closing - use fresh user data if available
    const userToReset = freshUserData || initialUser
    if (userToReset) {
      setEmail(userToReset.email || "")
      setCountryCode(userToReset.countryCode || "")
      setPhoneNo(userToReset.phoneNo || "")

      // Initialize role and department for staff
      if (userToReset.userType === 'staff') {
        const roles = (userToReset as StaffUser).profile.roles || []
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

        const validDepartments = UserDepartments
        const userProfile = (userToReset as StaffUser).profile

        // Priority 1: Direct department field
        if (userProfile.department) {
          setSelectedDepartment(userProfile.department)
        } else {
          // Priority 2: Fallback to roles extraction
          const department = roles.find((role: string) => validDepartments.includes(role as any))
          if (department) {
            setSelectedDepartment(department)
          } else {
            setSelectedDepartment("")
          }
        }
      }

      // Handle name - remove salutation prefix if it exists
      let cleanName = userToReset.name || ""
      if (userToReset.userType === 'owner' || userToReset.userType === 'vendor') {
        const ownerOrVendor = userToReset as OwnerUser | VendorUser
        const salutationValue = ownerOrVendor.profile.salutation || ""

        // Set salutation
        setSalutation(salutationValue || "")

        // Remove salutation from name if it's prefixed
        if (salutationValue && cleanName.startsWith(salutationValue)) {
          cleanName = cleanName.substring(salutationValue.length).trim()
        }

        // Set address fields
        setAddress1(ownerOrVendor.profile.address1 || "")
        setAddress2(ownerOrVendor.profile.address2 || "")
        setCity(ownerOrVendor.profile.city || "")
        setState(ownerOrVendor.profile.state || "")
        setPostcode(ownerOrVendor.profile.postcode || "")

        // Format location from address fields
        const addressParts = [
          ownerOrVendor.profile.address1,
          ownerOrVendor.profile.address2,
          ownerOrVendor.profile.city,
          ownerOrVendor.profile.state,
          ownerOrVendor.profile.postcode,
        ].filter(Boolean)
        setLocation(addressParts.join(", ") || "")
      } else {
        setSalutation("")
        setAddress1("")
        setAddress2("")
        setCity("")
        setState("")
        setPostcode("")
        setLocation("")
      }

      setName(cleanName)
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
                {(user.userType === 'owner' || user.userType === 'vendor') && (
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <UserIcon className="h-4 w-4" />
                      Salutation
                    </Label>
                    <Select
                      value={salutation ? salutation : "__none__"}
                      onValueChange={(value) => {
                        // Handle special "__none__" value to clear salutation
                        setSalutation(value === "__none__" ? "" : value)
                      }}
                      disabled={updateUser.isPending}
                    >
                      <SelectTrigger className="h-11 border-border/50 bg-[var(--field-bg)] dark:bg-[var(--field-bg)] transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20">
                        <SelectValue placeholder="Select salutation" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover">
                        <SelectItem value="__none__">None</SelectItem>
                        <SelectItem value="Mr">Mr</SelectItem>
                        <SelectItem value="Mrs">Mrs</SelectItem>
                        <SelectItem value="Ms">Ms</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
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
                {(user.userType === 'owner' || user.userType === 'vendor') ? (
                  <>
                    <AdminFormField
                      id="address1"
                      label="Address Line 1"
                      icon={MapPin}
                      value={address1 || ""}
                      onChange={setAddress1}
                      placeholder="Enter address line 1"
                      disabled={updateUser.isPending}
                    />
                    <AdminFormField
                      id="address2"
                      label="Address Line 2"
                      icon={MapPin}
                      value={address2 || ""}
                      onChange={setAddress2}
                      placeholder="Enter address line 2 (optional)"
                      disabled={updateUser.isPending}
                    />
                    <AdminFormField
                      id="city"
                      label="City"
                      icon={MapPin}
                      value={city || ""}
                      onChange={setCity}
                      placeholder="Enter city"
                      disabled={updateUser.isPending}
                    />
                    <AdminFormField
                      id="state"
                      label="State"
                      icon={MapPin}
                      value={state || ""}
                      onChange={setState}
                      placeholder="Enter state"
                      disabled={updateUser.isPending}
                    />
                    <AdminFormField
                      id="postcode"
                      label="Postcode"
                      icon={MapPin}
                      value={postcode || ""}
                      onChange={setPostcode}
                      placeholder="Enter postcode"
                      disabled={updateUser.isPending}
                    />
                  </>
                ) : (
                  <AdminFormField
                    id="location"
                    label="Location"
                    icon={MapPin}
                    value={location || ""}
                    onChange={setLocation}
                    placeholder="Enter location"
                    disabled={updateUser.isPending}
                  />
                )}
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
                        disabled={updateUser.isPending}
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

                  {/* Department Select */}
                  {!isEditedUserSuperAdmin && (
                    <div className="group space-y-2">
                      <Label className="flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors group-focus-within:text-primary">
                        <Building2 className="h-4 w-4" />
                        Department
                      </Label>
                      <Select
                        value={selectedDepartment}
                        onValueChange={setSelectedDepartment}
                        disabled={updateUser.isPending}
                      >
                        <SelectTrigger className="h-11 border-border/50 bg-[var(--field-bg)] dark:bg-[var(--field-bg)] transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20">
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent className="bg-popover">
                          {DEPARTMENTS.map((dept) => (
                            <SelectItem key={dept.value} value={dept.value}>
                              {dept.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

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
              disabled={updateUser.isPending}
              className="gap-2 transition-all duration-200 hover:bg-muted hover:text-foreground"
            >
              <X className="h-4 w-4" />
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={updateUser.isPending}
              className="gap-2 bg-gradient-to-r from-primary to-secondary text-white transition-all duration-200 hover:opacity-90 hover:shadow-lg"
            >
              {updateUser.isPending ? (
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
