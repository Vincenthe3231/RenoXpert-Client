import { cookies } from 'next/headers'
import { laravelApi } from '@/lib/api/axios'
import { NextResponse } from 'next/server'

const AUTH_CACHE_COOKIE = 'rx_staff_auth'
const AUTH_CACHE_TTL_SECONDS = 30

export async function GET() {
    try {
        // ✅ MUST await cookies()
        const cookieStore = await cookies()
        const cookie = cookieStore.toString()

        const { data } = await laravelApi.get('/me', {
            headers: { cookie },
        })

        const res = NextResponse.json(data)

        // Short-lived cache cookie to reduce middleware `/me` calls during navigation/RSC/prefetch.
        if (data?.user) {
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
    } catch {
        const res = NextResponse.json({ user: null })
        res.cookies.delete(AUTH_CACHE_COOKIE)
        return res
    }
}
