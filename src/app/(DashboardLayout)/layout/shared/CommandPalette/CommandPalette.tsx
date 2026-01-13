"use client"

import React, { useState, useEffect, useMemo, useContext } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useTheme } from 'next-themes'
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
} from '@/components/ui/command'
import {
  Layout,
  Users,
  FileCheck,
  History,
  Palette,
  Settings,
  User,
  LogOut,
  PanelLeftClose,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { useAuth } from '@/lib/api/auth'
import { CustomizerContext } from '@/app/context/CustomizerContext'
import LogoutDialog from '../LogoutDialog/LogoutDialog'

/**
 * CommandPalette Component
 * 
 * Keyboard Shortcut Pattern (Best Practice):
 * 
 * 1. Command Palette Trigger (Global):
 *    - Ctrl + / (Windows/Linux) or Cmd + / (Mac)
 *    - Ctrl + K (Windows/Linux) or Cmd + K (Mac) - VS Code pattern
 * 
 * 2. Command Shortcuts (When Palette is Open):
 *    - Single letters: D, U, O, A, P, T, etc.
 *    - These only work when the palette is open (safe context)
 *    - Handled automatically by cmdk library
 * 
 * 3. Global Shortcuts (Always Available):
 *    - Ctrl + Alt + T (Windows/Linux) or Cmd + Option + T (Mac) - Theme toggle
 *    - Works globally, even when palette is closed
 * 
 * This pattern avoids conflicts with browser/OS shortcuts while maintaining
 * fast, discoverable keyboard navigation.
 */
const CommandPalette = () => {
  const [open, setOpen] = useState(false)
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const { data: user } = useAuth()
  const { isCollapse, setIsCollapse } = useContext(CustomizerContext)
  
  // Check if we're on the users page
  const isUsersPage = pathname === '/users'

  // Ensure theme is mounted to avoid hydration issues
  useEffect(() => {
    setMounted(true)
  }, [])

  // Detect platform for shortcut display
  const isMac = typeof window !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0

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

  // Build commands with actions
  const commands = useMemo(() => {
    const baseCommands: Array<{ name: string; commands: Array<{
      id: string
      label: string
      icon: React.ElementType
      shortcut: string
      action: () => void
    }> }> = [
      {
        name: 'Navigation',
        commands: [
          {
            id: 'dashboard',
            label: 'Go to Dashboard',
            icon: Layout,
            shortcut: 'Ctrl + Alt + D',
            action: () => {
              router.push('/dashboard')
              setOpen(false)
            },
          },
          {
            id: 'users',
            label: 'Manage Users',
            icon: Users,
            shortcut: 'Ctrl + Alt + U',
            action: () => {
              router.push('/users')
              setOpen(false)
            },
          },
          {
            id: 'onboarding',
            label: 'Review Onboarding',
            icon: FileCheck,
            shortcut: 'Ctrl + Alt + O',
            action: () => {
              router.push('/onboarding')
              setOpen(false)
            },
          },
          {
            id: 'audit',
            label: 'View Decision History',
            icon: History,
            shortcut: 'Ctrl + Alt + A',
            action: () => {
              router.push('/audit')
              setOpen(false)
            },
          },
        ],
      },
      {
        name: 'Account',
        commands: [
          {
            id: 'profile',
            label: 'View Profile',
            icon: User,
            shortcut: 'P',
            action: () => {
              // TODO: Add profile navigation when profile page is available
              setOpen(false)
            },
          },
          {
            id: 'settings',
            label: 'System Settings',
            icon: Settings,
            shortcut: ',',
            action: () => {
              // TODO: Add settings navigation when settings page is available
              setOpen(false)
            },
          },
          {
            id: 'logout',
            label: 'Logout',
            icon: LogOut,
            shortcut: 'L',
            action: () => {
              setOpen(false)
              // Open logout dialog (checkForUnsavedWork is called in LogoutDialog)
              setLogoutDialogOpen(true)
            },
          },
        ],
      },
      {
        name: 'Interface',
        commands: [
          {
            id: 'theme',
            label: 'Toggle Theme',
            icon: Palette,
            shortcut: 'Ctrl+Alt+T',
            action: () => {
              if (mounted) {
                setTheme(theme === 'dark' ? 'light' : 'dark')
              }
              // Don't close on theme toggle - let user see the change
            },
          },
          {
            id: 'sidebar',
            label: 'Toggle Sidebar',
            icon: PanelLeftClose,
            shortcut: 'Ctrl+Alt+S',
            action: () => {
              // Toggle sidebar between full-sidebar and mini-sidebar
              if (isCollapse === 'full-sidebar') {
                setIsCollapse('mini-sidebar')
              } else {
                setIsCollapse('full-sidebar')
              }
              setOpen(false)
            },
          },
          // Filter navigation commands - only show on /users page
          ...(isUsersPage ? [
            {
              id: 'filter-prev',
              label: 'Previous Filter',
              icon: ChevronLeft,
              shortcut: 'A',
              action: () => {
                setOpen(false)
                // Dispatch custom event for filter navigation
                window.dispatchEvent(new CustomEvent('filter-nav-prev'))
              },
            },
            {
              id: 'filter-next',
              label: 'Next Filter',
              icon: ChevronRight,
              shortcut: 'D',
              action: () => {
                setOpen(false)
                // Dispatch custom event for filter navigation
                window.dispatchEvent(new CustomEvent('filter-nav-next'))
              },
            },
          ] : []),
        ],
      },
    ]

    return baseCommands
  }, [router, theme, setTheme, mounted, isCollapse, setIsCollapse, isUsersPage])

  // Global theme toggle shortcut (Ctrl + Alt + T / Cmd + Option + T)
  // This works globally, even when the command palette is closed
  useEffect(() => {
    const handleThemeToggle = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input/textarea
      const target = e.target as HTMLElement
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target.isContentEditable
      ) {
        return
      }

      // Ctrl + Alt + T (Windows/Linux) or Cmd + Option + T (Mac)
      const isMacCombo = isMac && e.metaKey && e.altKey && e.key.toLowerCase() === 't'
      const isWinCombo = !isMac && e.ctrlKey && e.altKey && e.key.toLowerCase() === 't'
      
      if (isMacCombo || isWinCombo) {
        e.preventDefault()
        if (mounted) {
          setTheme(theme === 'dark' ? 'light' : 'dark')
        }
      }
    }

    window.addEventListener('keydown', handleThemeToggle)
    return () => window.removeEventListener('keydown', handleThemeToggle)
  }, [mounted, theme, setTheme, isMac])

  // Global sidebar toggle shortcut (Ctrl + Alt + S / Cmd + Option + S)
  // This works globally, even when the command palette is closed
  useEffect(() => {
    const handleSidebarToggle = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input/textarea
      const target = e.target as HTMLElement
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target.isContentEditable
      ) {
        return
      }

      // Ctrl + Alt + S (Windows/Linux) or Cmd + Option + S (Mac)
      const isMacCombo = isMac && e.metaKey && e.altKey && e.key.toLowerCase() === 's'
      const isWinCombo = !isMac && e.ctrlKey && e.altKey && e.key.toLowerCase() === 's'
      
      if (isMacCombo || isWinCombo) {
        e.preventDefault()
        // Toggle sidebar between full-sidebar and mini-sidebar
        if (isCollapse === 'full-sidebar') {
          setIsCollapse('mini-sidebar')
        } else {
          setIsCollapse('full-sidebar')
        }
      }
    }

    window.addEventListener('keydown', handleSidebarToggle)
    return () => window.removeEventListener('keydown', handleSidebarToggle)
  }, [isMac, isCollapse, setIsCollapse])

  // Global navigation shortcuts (Ctrl + Alt + D, U, O, A / Cmd + Option + D, U, O, A)
  // This works globally, even when the command palette is closed
  useEffect(() => {
    const handleNavigation = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input/textarea
      const target = e.target as HTMLElement
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target.isContentEditable
      ) {
        return
      }

      const key = e.key.toLowerCase()
      
      // Ctrl + Alt + D (Windows/Linux) or Cmd + Option + D (Mac) - Dashboard
      const isDashboardMac = isMac && e.metaKey && e.altKey && key === 'd'
      const isDashboardWin = !isMac && e.ctrlKey && e.altKey && key === 'd'
      
      // Ctrl + Alt + U (Windows/Linux) or Cmd + Option + U (Mac) - Users
      const isUsersMac = isMac && e.metaKey && e.altKey && key === 'u'
      const isUsersWin = !isMac && e.ctrlKey && e.altKey && key === 'u'
      
      // Ctrl + Alt + O (Windows/Linux) or Cmd + Option + O (Mac) - Onboarding
      const isOnboardingMac = isMac && e.metaKey && e.altKey && key === 'o'
      const isOnboardingWin = !isMac && e.ctrlKey && e.altKey && key === 'o'
      
      // Ctrl + Alt + A (Windows/Linux) or Cmd + Option + A (Mac) - Audit
      const isAuditMac = isMac && e.metaKey && e.altKey && key === 'a'
      const isAuditWin = !isMac && e.ctrlKey && e.altKey && key === 'a'

      if (isDashboardMac || isDashboardWin) {
        e.preventDefault()
        router.push('/dashboard')
      } else if (isUsersMac || isUsersWin) {
        e.preventDefault()
        router.push('/users')
      } else if (isOnboardingMac || isOnboardingWin) {
        e.preventDefault()
        router.push('/onboarding')
      } else if (isAuditMac || isAuditWin) {
        e.preventDefault()
        router.push('/audit')
      }
    }

    window.addEventListener('keydown', handleNavigation)
    return () => window.removeEventListener('keydown', handleNavigation)
  }, [isMac, router])

  // Command palette trigger shortcuts (Ctrl + / or Ctrl + K)
  // Single-letter shortcuts (D, U, O, etc.) are handled automatically by cmdk
  // when the palette is open, so we don't need to handle them manually
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input/textarea
      const target = e.target as HTMLElement
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target.isContentEditable
      ) {
        return
      }

      // Ctrl/Cmd + / or Ctrl/Cmd + K to toggle command palette (VS Code pattern)
      if ((e.ctrlKey || e.metaKey) && (e.key === '/' || e.key.toLowerCase() === 'k')) {
        e.preventDefault()
        setOpen((prev) => !prev)
      }

      // Escape to close command palette
      if (e.key === 'Escape' && open) {
        setOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open])

  const formatShortcut = (shortcut: string, commandId?: string) => {
    // Special handling for global shortcuts
    if (commandId === 'theme') {
      return isMac ? '⌘⌥T' : 'Ctrl+Alt+T'
    }
    if (commandId === 'sidebar') {
      return isMac ? '⌘⌥S' : 'Ctrl+Alt+S'
    }
    
    // For command palette shortcuts (single letters when palette is open)
    // Display just the letter, not with modifier keys
    // These shortcuts only work when the command palette is open
    return shortcut
  }

  return (
    <>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search commands..." />
        <CommandList>
          <CommandEmpty>No commands found.</CommandEmpty>
          {commands.map((category) => (
            <CommandGroup key={category.name} heading={category.name}>
              {category.commands.map((cmd) => {
                const Icon = cmd.icon
                return (
                  <CommandItem
                    key={cmd.id}
                    onSelect={cmd.action}
                    className="cursor-pointer"
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    <span>{cmd.label}</span>
                    <CommandShortcut>{formatShortcut(cmd.shortcut, cmd.id)}</CommandShortcut>
                  </CommandItem>
                )
              })}
            </CommandGroup>
          ))}
        </CommandList>
      </CommandDialog>
      <LogoutDialog
        open={logoutDialogOpen}
        onOpenChange={setLogoutDialogOpen}
        unsavedWork={checkForUnsavedWork()}
      />
    </>
  )
}

export default CommandPalette

