import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const AUTH_CACHE_COOKIE = 'rx_staff_auth'
// Keep this short: it only exists to avoid hammering `/api/v1/me` during navigation/RSC/prefetch.
const AUTH_CACHE_TTL_SECONDS = 30

const PUBLIC_PATHS = [
    '/login',
    '/register',
    '/api',
]

const PUBLIC_ASSETS = [
    '/favicon.ico',
    '/robots.txt',
    '/sitemap.xml',
    '/images',
    '/icons',
    '/fonts',
]

export async function proxy(req: NextRequest) {
    const { pathname } = req.nextUrl

    // If we recently validated auth, avoid hitting `/api/auth/me` again.
    // This dramatically reduces `/api/v1/me` traffic, especially with Next.js App Router (RSC/prefetch).
    if (req.cookies.get(AUTH_CACHE_COOKIE)?.value === '1') {
        return NextResponse.next()
    }

    // Allow Next.js internals
    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/static')
    ) {
        return NextResponse.next()
    }

    // Allow public assets
    if (PUBLIC_ASSETS.some(path => pathname.startsWith(path))) {
        return NextResponse.next()
    }

    // Allow public routes
    if (PUBLIC_PATHS.some(path => pathname.startsWith(path))) {
        return NextResponse.next()
    }

    // Auth check
    const cookie = req.headers.get('cookie') ?? ''

    try {
        const res = await fetch(`${req.nextUrl.origin}/api/auth/me`, {
            headers: { cookie },
            // We purposely don't rely on fetch caching in middleware; use a short-lived cookie cache instead.
            cache: 'no-store',
        })

        const data = await res.json().catch(() => null)
        const user = data?.user ?? null

        if (!user) {
            const redirect = NextResponse.redirect(new URL('/login', req.url))
            redirect.cookies.delete(AUTH_CACHE_COOKIE)
            return redirect
        }

        const next = NextResponse.next()
        next.cookies.set(AUTH_CACHE_COOKIE, '1', {
            httpOnly: true,
            sameSite: 'lax',
            path: '/',
            maxAge: AUTH_CACHE_TTL_SECONDS,
        })
        return next
    } catch {
        const redirect = NextResponse.redirect(new URL('/login', req.url))
        redirect.cookies.delete(AUTH_CACHE_COOKIE)
        return redirect
    }
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image).*)',
    ],
}
