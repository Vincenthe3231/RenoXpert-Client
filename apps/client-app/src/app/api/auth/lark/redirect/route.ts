import { NextRequest, NextResponse } from 'next/server';
import BackendConfig from '@/config/backend';

/**
 * GET /api/auth/lark/redirect
 * Server-side route handler to redirect to Laravel backend's LarkSuite OAuth URL
 * This acts as a proxy to the backend OAuth endpoint
 */
export async function GET(request: NextRequest) {
  try {
    // Use server-side base URL for security
    const backendAuthUrl = `${BackendConfig.baseUrl}${BackendConfig.endpoints.larkSuiteAuth}`;
    
    // Redirect to the Laravel backend's LarkSuite OAuth endpoint
    return NextResponse.redirect(backendAuthUrl);
  } catch (error) {
    console.error('Error redirecting to LarkSuite OAuth:', error);

    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Failed to redirect to LarkSuite OAuth'
      },
      { status: 500 }
    );
  }
}

