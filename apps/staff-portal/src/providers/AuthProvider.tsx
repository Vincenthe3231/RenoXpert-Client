'use client'

import { useAuth } from '@/lib/api/auth'

export default function AuthProvider({
    children,
}: {
    children: React.ReactNode
}) {
    useAuth() // 👈 THIS MUST RUN
    return <>{children}</>
}