import { NextRequest, NextResponse } from 'next/server'
import { laravelApi } from '@/lib/api/axios'

export async function GET(req: NextRequest) {
    try {
        // Forward query params from Lark (code/state/error/...)
        const params = Object.fromEntries(req.nextUrl.searchParams.entries())

        // Forward browser cookies to Laravel so it can read session('lark_oauth_state')
        const cookie = req.headers.get('cookie') ?? ''

        // Call backend callback endpoint, but DON'T follow redirects.
        // We need the Location header and must forward Set-Cookie back to the browser.
        const laravelRes = await laravelApi.get('/auth/lark/callback', {
            params,
            headers: cookie ? { cookie } : undefined,
            maxRedirects: 0,
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

        // Forward any cookies Laravel sets (session regeneration, etc.)
        const setCookies = laravelRes.headers['set-cookie']
        if (setCookies) {
            const cookiesArray = Array.isArray(setCookies) ? setCookies : [setCookies]
            for (const cookie of cookiesArray) {
                res.headers.append('Set-Cookie', cookie)
            }
        }

        return res
    } catch (error) {
        console.error('Error handling LarkSuite OAuth callback:', error)
        return NextResponse.json(
            {
                error: 'Internal Server Error',
                message: error instanceof Error ? error.message : 'Failed to handle LarkSuite OAuth callback',
            },
            { status: 500 },
        )
    }
}


