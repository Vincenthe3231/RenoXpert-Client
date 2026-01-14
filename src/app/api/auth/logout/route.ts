import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { laravelApi } from '@/lib/api/axios'

const AUTH_CACHE_COOKIE = 'rx_staff_auth'

export async function POST() {
    try {
        const cookieStore = await cookies()
        
        // Properly format cookies: convert cookie store to HTTP Cookie header format
        // Format: "name1=value1; name2=value2"
        const cookieString = cookieStore.getAll()
            .map(c => `${c.name}=${c.value}`)
            .join('; ')

        const laravelRes = await laravelApi.post(
            '/logout',
            {},
            { headers: cookieString ? { cookie: cookieString } : undefined }
        )

        const res = NextResponse.json({ ok: true })
        
        // Clear the auth cache cookie first
        res.cookies.delete(AUTH_CACHE_COOKIE)
        
        // Also clear it with explicit expiration to ensure it's removed
        res.cookies.set(AUTH_CACHE_COOKIE, '', {
            httpOnly: true,
            sameSite: 'lax',
            path: '/',
            maxAge: 0,
        })

        // Forward any Set-Cookie headers from Laravel (session invalidation, etc.)
        const setCookies = laravelRes.headers['set-cookie']
        if (setCookies) {
            const cookiesArray = Array.isArray(setCookies) ? setCookies : [setCookies]
            for (const cookie of cookiesArray) {
                res.headers.append('Set-Cookie', cookie)
            }
        }

        return res
    } catch (error: any) {
        // Even if backend logout fails, we should clear the frontend session
        // This ensures the user can still log out on the frontend side
        const res = NextResponse.json({ ok: true }, { status: 200 })
        
        // Clear the auth cache cookie with multiple methods to ensure it's removed
        res.cookies.delete(AUTH_CACHE_COOKIE)
        res.cookies.set(AUTH_CACHE_COOKIE, '', {
            httpOnly: true,
            sameSite: 'lax',
            path: '/',
            maxAge: 0,
        })
        
        // Log the error for debugging, but don't fail the logout
        console.error('Backend logout failed, but clearing frontend session:', error?.response?.status || error?.message)
        
        return res
    }
}
