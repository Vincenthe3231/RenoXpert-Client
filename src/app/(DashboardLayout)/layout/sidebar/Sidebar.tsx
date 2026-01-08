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
import { useRouter } from 'next/navigation'
import { useLogout, useAuth } from '@/lib/api/auth'
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
  const router = useRouter()
  const logout = useLogout()
  const { data: user } = useAuth()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Helper function to check if user has required role
  const hasRequiredRole = (requiredRole: 'super-admin' | 'admin' | 'staff' | undefined): boolean => {
    // If no role requirement, everyone can see it
    if (!requiredRole) return true

    const userRoles = user?.profile?.roles || []
    
    // Normalize roles for comparison
    const normalizedUserRoles = userRoles.map(role => 
      role.toLowerCase().replace(/\s+/g, '-').replace(/_/g, '-')
    )
    const normalizedRequired = requiredRole.toLowerCase()

    // Check if user has the exact role
    if (normalizedUserRoles.includes(normalizedRequired)) {
      return true
    }

    // Super admin can access everything
    if (normalizedUserRoles.some(role => 
      role === 'super-admin' || 
      role === 'superadmin' ||
      role === 'super_admin'
    )) {
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

  // Filter sidebar items based on user role
  const filteredSidebarData = SidebarData.map(item => ({
    ...item,
    children: item.children?.filter(child => hasRequiredRole(child.requiredRole))
  }))

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
                      <h3 className='text-base font-semibold'>Mathew</h3>
                      <p className='text-xs font-normal text-muted dark:text-darklink'>
                        Designer
                      </p>
                    </div>
                  </div>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div
                        className='cursor-pointer'
                        onClick={async () => {
                          try {
                            await logout.mutateAsync()
                          } finally {
                            router.push('/login')
                          }
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
    </>
  )
}

export default SidebarLayout
