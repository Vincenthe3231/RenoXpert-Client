'use client'

import { useAuth } from '@/lib/api/auth'
import { createContext, useContext } from 'react'
import type { User } from '@/lib/api/auth/auth.schemas'

const AuthContext = createContext<{
    user: User | null
    isLoading: boolean
} | null>(null)

export function useAuthContext() {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuthContext must be used within AuthProvider')
    }
    return context
}

export default function AuthProvider({
    children,
}: {
    children: React.ReactNode
}) {
    const { data: user, isLoading } = useAuth() // Only called once here

    return (
        <AuthContext.Provider value={{ user: user ?? null, isLoading }}>
            {children}
        </AuthContext.Provider>
    )
}