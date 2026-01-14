import { cookies } from 'next/headers'
import { laravelApi } from '@/lib/api/axios'

/**
 * Helper to get bearer token from /me endpoint
 * Used for API routes that require Bearer token authentication
 */
export async function getBearerToken(): Promise<string | null> {
    try {
        const cookieStore = await cookies()
        const cookieString = cookieStore.getAll()
            .map(c => `${c.name}=${c.value}`)
            .join('; ')

        const meRes = await laravelApi.get('/me', {
            headers: cookieString ? { cookie: cookieString } : undefined,
        })

        // Token is in data.data.token or data.token
        const token = meRes.data?.data?.token || meRes.data?.token || null
        return token
    } catch (error) {
        console.error('Error getting bearer token:', error)
        return null
    }
}

