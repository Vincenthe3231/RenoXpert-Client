import { NextRequest, NextResponse } from 'next/server';
import { larkSuiteAuth } from '@/lib/larksuite-auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    // Handle OAuth errors
    if (error) {
      console.error('LarkSuite OAuth error:', error);
      return NextResponse.redirect(
        new URL(`/login?error=${encodeURIComponent(error)}`, request.url)
      );
    }

    // Validate required parameters
    if (!code) {
      return NextResponse.redirect(
        new URL('/login?error=missing_authorization_code', request.url)
      );
    }

    // Note: State validation would require server-side session storage
    // For now, we'll skip state validation but log it
    console.log('OAuth state received:', state);

    // Exchange authorization code for access token
    const tokenResponse = await larkSuiteAuth.exchangeCodeForToken(code);

    console.log('tokenResponse', tokenResponse);
    
    
    // Get user information
    const userInfo = await larkSuiteAuth.getUserInfo(tokenResponse.access_token);

    // Store user session (you might want to use a session management library like NextAuth.js)
    // For now, we'll redirect with user info in URL params (not recommended for production)
    const userData = {
      id: userInfo.user_id,
      name: userInfo.name,
      email: userInfo.email,
      avatar: userInfo.avatar_url,
      tenant: userInfo.tenant_key,
    };

    // In a real application, you would:
    // 1. Store the access token securely (database, encrypted cookies, etc.)
    // 2. Create a user session
    // 3. Set secure HTTP-only cookies
    // 4. Redirect to dashboard

    // For demo purposes, redirecting to dashboard with user data
    const redirectUrl = new URL('/dashboard', request.url);
    redirectUrl.searchParams.set('lark_user', JSON.stringify(userData));
    
    return NextResponse.redirect(redirectUrl);

  } catch (error) {
    console.error('LarkSuite OAuth callback error:', error);
    return NextResponse.redirect(
      new URL('/login?error=authentication_failed', request.url)
    );
  }
}
