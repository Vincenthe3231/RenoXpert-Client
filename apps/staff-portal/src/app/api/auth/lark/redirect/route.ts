import { NextResponse } from 'next/server'
import { laravelApi, laravelRootApi } from '@/lib/api/axios'

export async function GET(req: Request) {
    try {
        // Get CSRF cookie (required for Sanctum, harmless even if CSRF disabled)
        const csrfRes = await laravelRootApi.get('/sanctum/csrf-cookie')

        // Call backend redirect endpoint, but DON'T follow redirects.
        // We need the Location header and we must forward Set-Cookie back to the browser.
        const laravelRes = await laravelApi.get('/auth/lark/redirect', {
            maxRedirects: 0,
            // axios throws on 3xx by default; allow it so we can read Location + cookies
            validateStatus: (status) => status >= 200 && status < 400,
        })

        const location = laravelRes.headers?.location

        if (!location) {
            return NextResponse.json(
                { error: 'Bad Gateway', message: 'Backend did not return a redirect Location header.' },
                { status: 502 },
            )
        }

        const res = NextResponse.redirect(location)

        // Forward cookies from both responses (CSRF + session/state)
        const allSetCookies: string[] = []
        const csrfCookies = csrfRes.headers['set-cookie']
        const redirectCookies = laravelRes.headers['set-cookie']

        if (csrfCookies) allSetCookies.push(...(Array.isArray(csrfCookies) ? csrfCookies : [csrfCookies]))
        if (redirectCookies) allSetCookies.push(...(Array.isArray(redirectCookies) ? redirectCookies : [redirectCookies]))

        for (const cookie of allSetCookies) {
            res.headers.append('Set-Cookie', cookie)
        }

        return res
    } catch (error) {
        console.error('Error redirecting to LarkSuite OAuth:', error)
        return NextResponse.json(
            {
                error: 'Internal Server Error',
                message: error instanceof Error ? error.message : 'Failed to redirect to LarkSuite OAuth',
            },
            { status: 500 },
        )
    }
}