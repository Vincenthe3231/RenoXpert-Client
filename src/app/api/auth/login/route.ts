import { NextResponse } from 'next/server'
import { laravelApi, laravelRootApi } from '@/lib/api/axios'

export async function POST(req: Request) {
    const body = await req.json()

    // Get CSRF cookie (required for Sanctum, harmless even if CSRF disabled)
    const csrfRes = await laravelRootApi.get('/sanctum/csrf-cookie')

    // Login
    const laravelRes = await laravelApi.post('/login', body)

    // Create response
    const res = NextResponse.json(laravelRes.data)

    // FORWARD ALL COOKIES from both CSRF and login responses
    const csrfCookies = csrfRes.headers['set-cookie']
    const setCookies = laravelRes.headers['set-cookie']
    
    // Forward CSRF cookies first (if any)
    if (csrfCookies) {
        const csrfCookiesArray = Array.isArray(csrfCookies) ? csrfCookies : [csrfCookies]
        for (const cookie of csrfCookiesArray) {
            res.headers.append('Set-Cookie', cookie)
        }
    }
    
    // Forward login response cookies
    if (setCookies) {
        const loginCookiesArray = Array.isArray(setCookies) ? setCookies : [setCookies]
        for (const cookie of loginCookiesArray) {
            res.headers.append('Set-Cookie', cookie)
        }
    }

    return res
}
