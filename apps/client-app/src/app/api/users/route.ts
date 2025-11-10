import { NextRequest, NextResponse } from 'next/server';
import BackendConfig from '@/config/backend';

/**
 * GET /api/users
 * Server-side route handler to fetch users from the backend API
 * 
 * Query parameters:
 * - page: Page number for pagination
 * - per_page: Items per page
 * - filter: Filter parameters (can be nested)
 * - Any other query parameters will be forwarded to the backend
 */
export async function GET(request: NextRequest) {
  try {
    // Get the authentication token from cookies
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'No authentication token found' },
        { status: 401 }
      );
    }

    // Get query parameters from the request
    const searchParams = request.nextUrl.searchParams;

    // Build the backend URL with query parameters
    const backendUrl = new URL(
      `${BackendConfig.baseUrl}${BackendConfig.endpoints.users}`
    );

    // Forward all query parameters to the backend
    searchParams.forEach((value, key) => {
      backendUrl.searchParams.append(key, value);
    });

    // Make the request to the backend API
    const response = await fetch(backendUrl.toString(), {
      method: 'GET',
      headers: {
        ...BackendConfig.defaultHeaders,
        'Authorization': `Bearer ${token}`,
      },
      // Add cache control if needed
      cache: 'no-store', // Prevent caching for dynamic data
    });

    // Check if the response is ok
    if (!response.ok) {
      // Handle different error statuses
      if (response.status === 401) {
        return NextResponse.json(
          { error: 'Unauthorized', message: 'Authentication token expired or invalid' },
          { status: 401 }
        );
      }

      if (response.status === 403) {
        return NextResponse.json(
          { error: 'Forbidden', message: 'You do not have permission to access this resource' },
          { status: 403 }
        );
      }

      // Try to get error message from response
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        {
          error: 'Backend Error',
          message: errorData.message || 'Failed to fetch users',
          details: errorData
        },
        { status: response.status }
      );
    }

    // Parse and return the response data
    const data = await response.json();

    return NextResponse.json(data, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error fetching users:', error);

    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'An unexpected error occurred'
      },
      { status: 500 }
    );
  }
}

