import { cookies } from 'next/headers'
import { laravelApi } from '@/lib/api/axios'
import { NextResponse } from 'next/server'

const AUTH_CACHE_COOKIE = 'rx_staff_auth'
const AUTH_CACHE_TTL_SECONDS = 30

export async function GET() {
    try {
        // ✅ MUST await cookies()
        const cookieStore = await cookies()
        
        // Properly format cookies: convert cookie store to HTTP Cookie header format
        // Format: "name1=value1; name2=value2"
        const cookieString = cookieStore.getAll()
            .map(c => `${c.name}=${c.value}`)
            .join('; ')

        const laravelRes = await laravelApi.get('/me', {
            headers: cookieString ? { cookie: cookieString } : undefined,
        })

        const res = NextResponse.json(laravelRes.data)

        // Forward any Set-Cookie headers from Laravel (session regeneration, etc.)
        // This is critical when Laravel regenerates sessions (e.g., after Telescope refresh)
        const setCookies = laravelRes.headers['set-cookie']
        if (setCookies) {
            const cookiesArray = Array.isArray(setCookies) ? setCookies : [setCookies]
            for (const cookie of cookiesArray) {
                res.headers.append('Set-Cookie', cookie)
            }
        }

        // Short-lived cache cookie to reduce middleware `/me` calls during navigation/RSC/prefetch.
        // Backend returns { message, data: { user, accessStatus, rejectionReason } } or { user: null }
        const user = laravelRes.data?.data?.user || laravelRes.data?.user || null
        if (user) {
            res.cookies.set(AUTH_CACHE_COOKIE, '1', {
                httpOnly: true,
                sameSite: 'lax',
                path: '/',
                maxAge: AUTH_CACHE_TTL_SECONDS,
            })
        } else {
            res.cookies.delete(AUTH_CACHE_COOKIE)
        }

        return res
    } catch (error: any) {
        // Properly handle 401 errors - don't swallow them
        if (error?.response?.status === 401) {
            const res = NextResponse.json({ user: null }, { status: 401 })
            res.cookies.delete(AUTH_CACHE_COOKIE)
            return res
        }

        // Handle other errors
        const res = NextResponse.json({ user: null })
        res.cookies.delete(AUTH_CACHE_COOKIE)
        return res
    }
}
