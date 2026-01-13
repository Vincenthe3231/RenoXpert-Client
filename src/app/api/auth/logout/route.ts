import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { laravelApi } from '@/lib/api/axios'

const AUTH_CACHE_COOKIE = 'rx_staff_auth'

export async function POST() {
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
    res.cookies.delete(AUTH_CACHE_COOKIE)

    const setCookies = laravelRes.headers['set-cookie']
    if (setCookies) {
        const cookiesArray = Array.isArray(setCookies) ? setCookies : [setCookies]
        for (const cookie of cookiesArray) {
            res.headers.append('Set-Cookie', cookie)
        }
    }


    return res
}
