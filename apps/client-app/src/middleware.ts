// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const token = request.cookies.get('auth-token')?.value;

    // Define route categories
    const protectedPaths = ['/dashboard', '/users'];
    const authPaths = ['/login', '/signup'];
    const statusPaths = ['/status/verifying', '/status/rejected'];

    const isProtected = protectedPaths.some(path => pathname.startsWith(path));
    const isAuthPath = authPaths.includes(pathname);
    const isStatusPath = statusPaths.some(path => pathname.startsWith(path));
    const isRoot = pathname === '/';

    // 1. Unauthenticated + protected route → login
    if (isProtected && !token) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
    }

    // 2. Authenticated + auth page → dashboard (but status check happens in layout)
    if (token && isAuthPath) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // 3. Optional: Redirect root '/' based on auth
    if (isRoot) {
        if (token) {
            return NextResponse.redirect(new URL('/dashboard', request.url));
        } else {
            return NextResponse.redirect(new URL('/login', request.url));
        }
    }

    // 4. Allow status pages and all other requests
    // Note: Status-based redirects are handled in the DashboardLayout component
    // because we need to fetch user data from the API to check status
    return NextResponse.next();
}

// Run only on relevant routes
export const config = {
    matcher: [
        '/',
        '/dashboard/:path*',
        '/users/:path*',
        '/status/:path*',
        '/login',
        '/signup',
    ],
};