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
    
    // Store Bearer token in httpOnly cookie if present in login response
    // Token is needed for endpoints that require Bearer authentication (e.g., /api/v1/roles)
    const token = laravelRes.data?.data?.token || laravelRes.data?.token
    if (token) {
        res.cookies.set('rx_staff_bearer_token', token, {
            httpOnly: true,
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 24 * 7, // 7 days
            secure: process.env.NODE_ENV === 'production',
        })
    }

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
