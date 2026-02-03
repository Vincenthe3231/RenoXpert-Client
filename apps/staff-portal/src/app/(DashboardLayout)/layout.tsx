'use client'
import React, { Activity, useContext } from 'react'
import Sidebar from './layout/sidebar/Sidebar'
import Header from './layout/header/Header'
import { Customizer } from './layout/shared/customizer/Customizer'
import CommandPalette from './layout/shared/CommandPalette/CommandPalette'
import { CustomizerContext } from '@/app/context/CustomizerContext'
import { SidebarProvider } from '@/components/ui/sidebar'
import { UnifiedUserDataProvider } from '@/app/context/UnifiedUserDataContext'

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const { activeLayout, isLayout } = useContext(CustomizerContext)
  return (
    <UnifiedUserDataProvider strategy="smart">
      <SidebarProvider>
        <div className='flex w-full min-h-screen'>
          <div className='page-wrapper flex w-full'>
            {/* Header/sidebar */}

            <Activity mode={activeLayout == 'vertical' ? 'visible' : 'hidden'}>
              <div className='xl:block hidden'>
                <Sidebar />
              </div>
            </Activity>

            <div className='body-wrapper w-full bg-white dark:bg-dark'>
              {/* Top Header  */}
              <Header
                layoutType={
                  activeLayout == 'horizontal' ? 'horizontal' : 'vertical'
                }
              />

              {/* Body Content  */}
              <div
                className={` ${isLayout == 'full'
                  ? 'w-full py-[30px] md:px-[30px] px-5'
                  : 'container py-[30px]'
                  } ${activeLayout == 'horizontal' ? 'xl:mt-3' : ''}
            `}>
                {children}
              </div>
              <Customizer />
              <CommandPalette />
            </div>
          </div>
        </div>
      </SidebarProvider>
    </UnifiedUserDataProvider>
  )
}
