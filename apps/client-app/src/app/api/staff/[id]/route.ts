import { StaffApiService } from '@/lib/api/services/staff.services';
import { NextRequest, NextResponse } from 'next/server';

type RouteContext = {
    params: Promise<{ id: string }>;
};

// GET /api/staff/[id] - Get staff by ID
export async function GET(
    request: NextRequest,
    context: RouteContext
) {
    try {
        // Get the authentication token from cookies
        const token = request.cookies.get('auth-token')?.value;

        if (!token) {
            return NextResponse.json(
                { error: 'Unauthorized', message: 'No authentication token found' },
                { status: 401 }
            );
        }

        const { id } = await context.params;

        const data = await StaffApiService.getById(id);

        return NextResponse.json(data,
            { status: 200 }
        );
    } catch (error: any) {
        console.error('Error fetching staff:', error);

        return NextResponse.json(
            { error: 'Failed to fetch staff' },
            { status: 500 }
        );
    }
}