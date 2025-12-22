import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

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

    // ✅ Allow Next.js internals
    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/static')
    ) {
        return NextResponse.next()
    }

    // ✅ Allow public assets
    if (PUBLIC_ASSETS.some(path => pathname.startsWith(path))) {
        return NextResponse.next()
    }

    // ✅ Allow public routes
    if (PUBLIC_PATHS.some(path => pathname.startsWith(path))) {
        return NextResponse.next()
    }

    // 🔐 Auth check
    const cookie = req.headers.get('cookie') ?? ''

    const res = await fetch(`${req.nextUrl.origin}/api/auth/me`, {
        headers: { cookie },
        cache: 'no-store',
    })

    const { user } = await res.json()

    if (!user) {
        return NextResponse.redirect(new URL('/login', req.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image).*)',
    ],
}
