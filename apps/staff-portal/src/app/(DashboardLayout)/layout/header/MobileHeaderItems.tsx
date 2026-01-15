import { useContext, useState, useEffect } from 'react'
import { Icon } from '@iconify/react'
import Messages from './Messages'
import Profile from './Profile'
import { CustomizerContext } from '@/app/context/CustomizerContext'

const MobileHeaderItems = () => {
  const [mounted, setMounted] = useState(false)
  const { setActiveMode, activeMode } = useContext(CustomizerContext)

  useEffect(() => {
    setMounted(true)
  }, [])

  const toggleMode = () => {
    setActiveMode(activeMode === 'light' ? 'dark' : 'light')
  }

  return (
    <nav className='rounded-none bg-white dark:bg-dark flex-1 px-9 '>
      {/* Toggle Icon   */}

      <div className='xl:hidden block w-full'>
        <div className='flex justify-center items-center'>
          {/* Theme Toggle */}
          {mounted && (
            activeMode === 'light' ? (
              <div
                className=' hover:text-primary px-4 group  dark:hover:text-primary focus:ring-0 rounded-full flex justify-center items-center cursor-pointer text-link dark:text-darklink relative'
                onClick={toggleMode}>
                <span className='flex items-center justify-center relative after:absolute after:w-10 after:h-10 after:rounded-full after:-top-1/2   group-hover:after:bg-lightprimary'>
                  <Icon
                    icon='tabler:moon'
                    width='20'
                  // className="text-link group-hover:text-primary"
                  />
                </span>
              </div>
            ) : (
              // Dark Mode Button
              <div
                className=' hover:text-primary px-4   dark:hover:text-primary focus:ring-0 rounded-full flex justify-center items-center cursor-pointer text-link dark:text-darklink group relative'
                onClick={toggleMode}>
                <span className='flex items-center justify-center relative after:absolute after:w-10 after:h-10 after:rounded-full after:-top-1/2   group-hover:after:bg-lightprimary'>
                  <Icon
                    icon='solar:sun-bold-duotone'
                    width='20'
                    className='group-hover:text-primary'
                  />
                </span>
              </div>
            ))}

          {/* Notification Dropdown */}

          {/* Messages Dropdown */}
          <Messages />

          {/* Profile Dropdown */}
          <Profile />
        </div>
      </div>
    </nav>
  )
}

export default MobileHeaderItems
