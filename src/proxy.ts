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

// Routes that require super-admin (Group D)
const SUPER_ADMIN_ROUTES = ['/onboarding', '/audit']
// Routes that require user module access (Group C: super_admin OR admin)
const USER_MODULE_ROUTES = ['/users']

// Helper function to check if user is super admin (uses profile.type from backend)
function isSuperAdmin(user: any): boolean {
    if (!user || user.userType !== 'staff') return false;
    return user.profile?.type === 'super_admin';
}

// Helper function to check if user can access user module (uses profile.type from backend)
function canAccessUserModule(user: any): boolean {
    if (!user || user.userType !== 'staff') return false;
    const staffType = user.profile?.type;
    return staffType === 'super_admin' || staffType === 'admin';
}

export async function proxy(req: NextRequest) {
    const { pathname } = req.nextUrl

    // If we recently validated auth, avoid hitting `/api/auth/me` again.
    // This dramatically reduces `/api/v1/me` traffic, especially with Next.js App Router (RSC/prefetch).
    if (req.cookies.get(AUTH_CACHE_COOKIE)?.value === '1') {
        // For protected routes, we still need to check authorization even with cached auth
        const isSuperAdminRoute = SUPER_ADMIN_ROUTES.some(route => pathname.startsWith(route))
        const isUserModuleRoute = USER_MODULE_ROUTES.some(route => pathname.startsWith(route))
        const isProtectedRoute = isSuperAdminRoute || isUserModuleRoute
        
        if (isProtectedRoute) {
            const cookie = req.headers.get('cookie') ?? ''
            try {
                const res = await fetch(`${req.nextUrl.origin}/api/auth/me`, {
                    headers: { cookie },
                    cache: 'no-store',
                })
                const responseData = await res.json().catch(() => null)
                // Backend returns { message, data: { user, ... } } or { user: null }
                const user = responseData?.data?.user || responseData?.user || null

                if (user) {
                    // Check route access based on route type
                    if (isSuperAdminRoute && !isSuperAdmin(user)) {
                        return NextResponse.redirect(new URL('/dashboard', req.url))
                    }
                    if (isUserModuleRoute && !canAccessUserModule(user)) {
                        return NextResponse.redirect(new URL('/dashboard', req.url))
                    }
                } else {
                    // User not found, redirect to login
                    const redirect = NextResponse.redirect(new URL('/login', req.url))
                    redirect.cookies.delete(AUTH_CACHE_COOKIE)
                    return redirect
                }
            } catch {
                // If auth check fails for protected route, redirect to dashboard
                // We can't verify user authorization, so deny access
                return NextResponse.redirect(new URL('/dashboard', req.url))
            }
        }
        // If not a protected route or authorization check passed, allow access
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

        const responseData = await res.json().catch(() => null)
        // Backend returns { message, data: { user, ... } } or { user: null }
        const user = responseData?.data?.user || responseData?.user || null

        if (!user) {
            const redirect = NextResponse.redirect(new URL('/login', req.url))
            redirect.cookies.delete(AUTH_CACHE_COOKIE)
            return redirect
        }

        // Authorization-based route protection (using profile.type from backend)
        const isSuperAdminRoute = SUPER_ADMIN_ROUTES.some(route => pathname.startsWith(route))
        const isUserModuleRoute = USER_MODULE_ROUTES.some(route => pathname.startsWith(route))
        
        if (isSuperAdminRoute && !isSuperAdmin(user)) {
            // Redirect non-super-admin users to dashboard
            const redirect = NextResponse.redirect(new URL('/dashboard', req.url))
            redirect.cookies.set(AUTH_CACHE_COOKIE, '1', {
                httpOnly: true,
                sameSite: 'lax',
                path: '/',
                maxAge: AUTH_CACHE_TTL_SECONDS,
            })
            return redirect
        }
        
        if (isUserModuleRoute && !canAccessUserModule(user)) {
            // Redirect users without user module access to dashboard
            const redirect = NextResponse.redirect(new URL('/dashboard', req.url))
            redirect.cookies.set(AUTH_CACHE_COOKIE, '1', {
                httpOnly: true,
                sameSite: 'lax',
                path: '/',
                maxAge: AUTH_CACHE_TTL_SECONDS,
            })
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

