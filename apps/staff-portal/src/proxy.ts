import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const AUTH_CACHE_COOKIE = 'rx_staff_auth'
// Keep this short: it only exists to avoid hammering `/api/v1/me` during navigation/RSC/prefetch.
const AUTH_CACHE_TTL_SECONDS = 30

const PUBLIC_PATHS = [
    '/login',
    '/register',
    '/api/auth/login',
    '/api/auth/lark',
    '/auth/larksuite',
]

const PUBLIC_ASSETS = [
    '/favicon.ico',
    '/robots.txt',
    '/sitemap.xml',
    '/images',
    '/icons',
    '/fonts',
]

// Routes that unauthorized users (non-active status) can access
const UNAUTHORIZED_ALLOWED_PATHS = [
    '/dashboard',
    '/users',
]

export async function proxy(req: NextRequest) {
    const { pathname } = req.nextUrl

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

    // Allow public routes (exact match or starts with)
    if (PUBLIC_PATHS.some(path => pathname === path || pathname.startsWith(path))) {
        return NextResponse.next()
    }

    // Allow all API routes (they handle their own auth via cookies)
    if (pathname.startsWith('/api/')) {
        return NextResponse.next()
    }

    // Auth check - always perform to verify authorization status for route protection
    const cookie = req.headers.get('cookie') ?? ''

    try {
        const res = await fetch(`${req.nextUrl.origin}/api/auth/me`, {
            headers: { cookie },
            // We purposely don't rely on fetch caching in middleware; use a short-lived cookie cache instead.
            cache: 'no-store',
        })

        const responseData = await res.json().catch(() => null)
        // Backend returns { message, data: { user, ... } } or { user: null }
        const user = responseData?.data?.user || responseData?.user || null

        if (!user) {
            const redirect = NextResponse.redirect(new URL('/login', req.url))
            redirect.cookies.delete(AUTH_CACHE_COOKIE)
            return redirect
        }

        // Check if user is authorized (status === 'active')
        const isAuthorized = user.status === 'active'
        
        // If user is unauthorized (not active), restrict access to allowed paths only
        if (!isAuthorized) {
            const isAllowedPath = UNAUTHORIZED_ALLOWED_PATHS.some(
                path => pathname === path || pathname.startsWith(path + '/')
            )
            
            if (!isAllowedPath) {
                // Redirect unauthorized users trying to access restricted routes to dashboard
                const redirect = NextResponse.redirect(new URL('/dashboard', req.url))
                redirect.cookies.set(AUTH_CACHE_COOKIE, '1', {
                    httpOnly: true,
                    sameSite: 'lax',
                    path: '/',
                    maxAge: AUTH_CACHE_TTL_SECONDS,
                })
                return redirect
            }
        }

        // Role-based route protection for authorized users
        if (isAuthorized && user.profile) {
            const profile = user.profile as any
            const userRoles = Array.isArray(profile?.roles) ? profile.roles : []
            const userPermissions = Array.isArray(profile?.permissions) ? profile.permissions : []
            
            // Normalize roles for comparison
            const normalizedUserRoles = userRoles.map((role: unknown) => {
                if (typeof role !== 'string') return ''
                return role.toLowerCase().trim().replace(/\s+/g, '-').replace(/_/g, '-')
            }).filter((role: string) => role.length > 0)
            
            const isSuperAdmin = normalizedUserRoles.some((role: string) => 
                role === 'super-admin' || role === 'superadmin' || role === 'super_admin'
            )
            
            // Protect /onboarding route - only super-admin can access
            if (pathname === '/onboarding' || pathname.startsWith('/onboarding/')) {
                if (!isSuperAdmin) {
                    // Redirect non-super-admin users trying to access onboarding
                    const redirect = NextResponse.redirect(new URL('/dashboard', req.url))
                    redirect.cookies.set(AUTH_CACHE_COOKIE, '1', {
                        httpOnly: true,
                        sameSite: 'lax',
                        path: '/',
                        maxAge: AUTH_CACHE_TTL_SECONDS,
                    })
                    return redirect
                }
            }
            
            // Protect /audit route - super-admin or admin with "view activity logs" permission
            if (pathname === '/audit' || pathname.startsWith('/audit/')) {
                const hasViewActivityLogsPermission = userPermissions.some((permission: unknown) => 
                    typeof permission === 'string' && 
                    permission.toLowerCase().trim() === 'view activity logs'
                )
                
                if (!isSuperAdmin && !hasViewActivityLogsPermission) {
                    // Redirect users without permission trying to access audit trail
                    const redirect = NextResponse.redirect(new URL('/dashboard', req.url))
                    redirect.cookies.set(AUTH_CACHE_COOKIE, '1', {
                        httpOnly: true,
                        sameSite: 'lax',
                        path: '/',
                        maxAge: AUTH_CACHE_TTL_SECONDS,
                    })
                    return redirect
                }
            }
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

