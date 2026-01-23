'use client'

import React, { useContext, useState, useEffect } from 'react'
import SidebarData from './Sidebaritems'
import NavItems from './NavItems'
import NavCollapse from './NavCollapse'
import SimpleBar from 'simplebar-react'
import FullLogo from '../shared/logo/FullLogo'
import { Icon } from '@iconify/react'
import Image from 'next/image'
import { CustomizerContext } from '@/app/context/CustomizerContext'
import { useAuth } from '@/lib/api/auth'
import LogoutDialog from '../shared/LogoutDialog/LogoutDialog'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
} from '@/components/ui/sidebar'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

const SidebarLayout = () => {
  const { isCollapse, activeDir } = useContext(CustomizerContext)
  const { data: user } = useAuth()
  const [mounted, setMounted] = useState(false)
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false)

  // Check for unsaved work (hardcoded for UX simulation)
  // TODO: Replace with actual unsaved work detection logic
  const checkForUnsavedWork = () => {
    return [
      {
        id: 1,
        name: "Project_Financial_Report_Q4.pdf",
        type: "Document",
        modifiedAt: new Date(Date.now() - 2 * 60 * 1000), // 2 minutes ago
      },
      {
        id: 2,
        name: "User_Persona_Research.sketch",
        type: "Design",
        modifiedAt: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
      },
      {
        id: 3,
        name: "Marketing_Strategy_Notes.txt",
        type: "Text",
        modifiedAt: new Date(Date.now() - 30 * 1000), // 30 seconds ago
      },
    ]
  }

  useEffect(() => {
    setMounted(true)
  }, [])

  // Helper function to check if user has required role
  const hasRequiredRole = (requiredRole: 'super-admin' | 'admin' | 'staff' | undefined): boolean => {
    // If no role requirement, everyone can see it
    if (!requiredRole) return true

    // If user data hasn't loaded yet, show nothing (will re-render when data loads)
    if (!user || !user.profile) {
      return false
    }

    const userRoles = user.profile.roles || []
    
    // Normalize roles for comparison (convert to lowercase, replace spaces/underscores with hyphens)
    const normalizedUserRoles = userRoles.map(role => {
      if (typeof role !== 'string') return ''
      return role.toLowerCase().trim().replace(/\s+/g, '-').replace(/_/g, '-')
    }).filter(role => role.length > 0)
    
    const normalizedRequired = requiredRole.toLowerCase()

    // Check if user has the exact role
    if (normalizedUserRoles.includes(normalizedRequired)) {
      return true
    }

    // Super admin can access everything - check normalized roles array
    // After normalization, "Super Admin", "super_admin", "super-admin" all become "super-admin"
    // Also check for "superadmin" (no hyphen) variant
    const isSuperAdmin = normalizedUserRoles.some(role => 
      role === 'super-admin' || role === 'superadmin' || role === 'super_admin'
    )
    
    if (isSuperAdmin) {
      return true
    }

    // Admin can access admin and staff level items
    if (normalizedRequired === 'admin' || normalizedRequired === 'staff') {
      if (normalizedUserRoles.includes('admin')) {
        return true
      }
    }

    // Staff can only access staff level items
    if (normalizedRequired === 'staff') {
      if (normalizedUserRoles.includes('staff')) {
        return true
      }
    }

    return false
  }

  // Helper function to check if user can access audit (super-admin OR admin with permission)
  const canAccessAudit = (): boolean => {
    if (!user || !user.profile) return false
    
    const userRoles = user.profile.roles || []
    const userPermissions = user.profile.permissions || []
    
    const normalizedUserRoles = userRoles.map(role => {
      if (typeof role !== 'string') return ''
      return role.toLowerCase().trim().replace(/\s+/g, '-').replace(/_/g, '-')
    }).filter(role => role.length > 0)
    
    // Check if super-admin
    const isSuperAdmin = normalizedUserRoles.some(role => 
      role === 'super-admin' || role === 'superadmin' || role === 'super_admin'
    )
    
    if (isSuperAdmin) {
      return true
    }
    
    // Check for "view activity logs" permission
    const hasViewActivityLogsPermission = userPermissions.some(permission => 
      typeof permission === 'string' && 
      permission.toLowerCase().trim() === 'view activity logs'
    )
    
    return hasViewActivityLogsPermission
  }

  // Filter sidebar items based on user role
  const filteredSidebarData = SidebarData.map(item => {
    const filteredChildren = item.children?.filter(child => {
      // Special case: Audit trail - check permission-based access
      if (child.url === '/audit' || child.url?.startsWith('/audit')) {
        return canAccessAudit()
      }
      // For all other items, use role-based check
      return hasRequiredRole(child.requiredRole)
    }) || []
    
    return {
      ...item,
      children: filteredChildren
    }
  })

  return (
    <>
      <div className='flex'>
        <Sidebar
          className='fixed menu-sidebar bg-white dark:bg-dark z-[3] border-ld
          '
          side={activeDir === 'rtl' ? 'right' : 'left'}>
          <SidebarHeader className='p-0'>
            <div
              className={`${
                mounted && isCollapse === 'full-sidebar' ? 'px-6' : 'px-5'
              } flex items-center brand-logo overflow-hidden`}>
              <FullLogo />
            </div>
          </SidebarHeader>

          <SimpleBar className='h-[calc(100vh_-_180px)]'>
            <SidebarContent
              className={`${mounted && isCollapse === 'full-sidebar' ? 'px-6' : 'px-4'}`}>
              <SidebarGroup className='sidebar-nav p-0'>
                {filteredSidebarData.map((item, index) => (
                  <React.Fragment key={index}>
                    <SidebarGroupLabel className='px-0 caption'>
                      <h5 className='text-link font-bold text-xs dark:text-darklink '>
                        <span className='hide-menu leading-21'>
                          {item.heading?.toUpperCase()}
                        </span>
                        <Icon
                          icon='tabler:dots'
                          className='text-ld   leading-6 dark:text-opacity-60 hide-icon mx-2.5 md:block hidden'
                          height={18}
                        />
                      </h5>
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                      <SidebarMenu className='gap-0.5'>
                        {item.children?.map((child, index) => (
                          <React.Fragment key={child.id && index}>
                            {child.children ? (
                              <div className='collpase-items'>
                                <NavCollapse item={child} />
                              </div>
                            ) : (
                              <NavItems item={child} />
                            )}
                          </React.Fragment>
                        ))}
                      </SidebarMenu>
                    </SidebarGroupContent>
                  </React.Fragment>
                ))}
              </SidebarGroup>
            </SidebarContent>
          </SimpleBar>
          {/* Sidebar Profile */}
          <SidebarFooter>
            <div
              className={` my-4 ${
                mounted && isCollapse === 'full-sidebar' ? 'mx-6' : 'mx-0.5'
              }`}>
              <div
                className={` py-4 ${
                  mounted && isCollapse === 'full-sidebar' ? 'px-4' : 'px-2'
                } bg-lightsecondary rounded-md overflow-hidden`}>
                <div className='flex justify-between items-center'>
                  <div className='flex gap-4 items-center'>
                    <Image
                      src={'/images/profile/user-1.jpg'}
                      alt='profile-image'
                      width={40}
                      height={40}
                      className='rounded-full'
                    />
                    <div>
                      <h3 className='text-base font-semibold text-foreground'>Mathew</h3>
                      <p className='text-xs font-normal text-muted-foreground dark:text-muted-foreground'>
                        Designer
                      </p>
                    </div>
                  </div>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div
                        className='cursor-pointer'
                        onClick={() => {
                          // Open logout dialog (checkForUnsavedWork is called in LogoutDialog)
                          setLogoutDialogOpen(true)
                        }}>
                        <Icon
                          icon='tabler:power'
                          className='text-primary text-2xl'
                        />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Logout</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </div>
          </SidebarFooter>
        </Sidebar>
      </div>
      <LogoutDialog
        open={logoutDialogOpen}
        onOpenChange={setLogoutDialogOpen}
        unsavedWork={checkForUnsavedWork()}
      />
    </>
  )
}

export default SidebarLayout
