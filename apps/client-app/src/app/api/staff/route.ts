import { StaffApiService } from '@/lib/api/services/staff.services';
import { staffSchema } from '@/lib/schemas';
import { paginatedResponseSchema } from '@/lib/schemas/pagination.schemas';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/staff
 * Server-side route handler to fetch staff from the backend API
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

        // Extract query parameters from the request
        const { searchParams } = new URL(request.url);
        const params: Record<string, any> = {};
        
        // Convert URLSearchParams to object, handling arrays and nested objects
        searchParams.forEach((value, key) => {
            // Check if this is a JSON string (for nested objects)
            if (value.startsWith('{') || value.startsWith('[')) {
                try {
                    params[key] = JSON.parse(value);
                } catch {
                    params[key] = value;
                }
            } else {
                // Handle array parameters (e.g., ?filter[]=value1&filter[]=value2)
                if (key.endsWith('[]')) {
                    const arrayKey = key.slice(0, -2);
                    if (!params[arrayKey]) {
                        params[arrayKey] = [];
                    }
                    params[arrayKey].push(value);
                } else if (params[key]) {
                    // If key already exists, convert to array
                    if (!Array.isArray(params[key])) {
                        params[key] = [params[key]];
                    }
                    params[key].push(value);
                } else {
                    params[key] = value;
                }
            }
        });

        const data = await StaffApiService.getAll(Object.keys(params).length > 0 ? params : undefined, token);

        return NextResponse.json(data,
            { status: 200 }
        );
    } catch (error: any) {
        console.error('Error fetching staff:', error);

        // Handle different error statuses
        if (error?.message?.includes('401') || error?.response?.status === 401) {
            return NextResponse.json(
                { error: 'Unauthorized', message: 'Authentication token expired or invalid' },
                { status: 401 }
            );
        }

        if (error?.response?.status === 403) {
            return NextResponse.json(
                { error: 'Forbidden', message: 'You do not have permission to access this resource' },
                { status: 403 }
            );
        }

        return NextResponse.json(
            {
                error: 'Internal Server Error',
                message: error instanceof Error ? error.message : 'Failed to fetch staff'
            },
            { status: 500 }
        );
    }
}

