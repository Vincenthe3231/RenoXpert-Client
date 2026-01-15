import { Icon } from '@iconify/react'

import React, { useContext, useState } from 'react'
import * as profileData from './Data'
import Link from 'next/link'
import Image from 'next/image'
import SimpleBar from 'simplebar-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { CustomizerContext } from '@/app/context/CustomizerContext'
import { useAuthContext } from '@/providers/AuthProvider'
import LogoutDialog from '../shared/LogoutDialog/LogoutDialog'

const Profile = () => {
  const { activeDir } = useContext(CustomizerContext)
  const { user } = useAuthContext()
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

  return (
    <div className='relative group/menu ps-4'>
      <DropdownMenu dir={activeDir === 'rtl' ? 'rtl' : 'ltr'}>
        <DropdownMenuTrigger asChild>
          <span className='hover:text-primary hover:bg-lightprimary rounded-full flex justify-center items-center cursor-pointer group-hover/menu:bg-lightprimary group-hover/menu:text-primary'>
            <Image
              src='/images/profile/user-1.jpg'
              alt='logo'
              height='35'
              width='35'
              className='rounded-full'
            />
          </span>
        </DropdownMenuTrigger>

        <DropdownMenuContent className='w-screen sm:w-[360px] py-6 px-0 rounded-sm '>
          {/* Header */}
          <div className='px-6'>
            <h3 className='text-lg font-semibold text-ld'>User Profile</h3>
            <div className='flex items-center gap-6 pb-5 border-b border-border dark:border-darkborder mt-5 mb-3'>
              <Image
                src='/images/profile/user-1.jpg'
                alt='logo'
                height='80'
                width='80'
                className='rounded-full'
              />
              <div>
                <h5 className='card-title text-sm mb-0.5 font-medium'>
                  {user?.name}
                </h5>
                <span className='card-subtitle text-muted font-normal'>
                  Designer
                </span>
                <p className='card-subtitle font-normal text-muted mb-0 mt-1 flex items-center'>
                  <Icon
                    icon='tabler:mail'
                    className='text-base me-1 relative top-0.5'
                  />
                  info@Modernize.com
                </p>
              </div>
            </div>
          </div>

          {/* Dropdown items */}
          <SimpleBar>
            {profileData.profileDD.map((items, index) => (
              <DropdownMenuItem
                key={index}
                asChild
                className='px-6 py-3 flex justify-between items-center bg-hover group/link w-full cursor-pointer '>
                <Link href={items.url} className='flex items-center w-full'>
                  <div className='h-11 w-11 flex-shrink-0 rounded-md flex justify-center items-center bg-lightprimary'>
                    <Image src={items.img} alt='icon' width={24} height={24} />
                  </div>
                  <div className='ps-4 flex justify-between w-full'>
                    <div className='w-3/4'>
                      <h5 className='mb-1 text-sm group-hover/link:text-primary'>
                        {items.title}
                      </h5>
                      <div className='text-xs text-darklink'>
                        {items.subtitle}
                      </div>
                    </div>
                  </div>
                </Link>
              </DropdownMenuItem>
            ))}
          </SimpleBar>

          {/* Logout Button */}

          <div className='pt-2 px-7'>
            <Button
              variant='outline'
              className='w-full rounded-md'
              onClick={() => {
                // Open logout dialog (checkForUnsavedWork is called in LogoutDialog)
                setLogoutDialogOpen(true)
              }}>
              Logout
            </Button>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
      <LogoutDialog
        open={logoutDialogOpen}
        onOpenChange={setLogoutDialogOpen}
        unsavedWork={checkForUnsavedWork()}
      />
    </div>
  )
}

export default Profile
