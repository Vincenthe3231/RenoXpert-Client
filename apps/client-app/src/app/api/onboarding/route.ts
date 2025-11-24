import { OnboardingService } from "@/lib/api/services/onboarding.service";
import { NextRequest, NextResponse } from "next/server";

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
            params[key] = value;
        });

        const data = await OnboardingService.getAll(Object.keys(params).length > 0 ? params : undefined, token);

        return NextResponse.json(data,
            { status: 200 }
        );

    } catch (error: any) {
        console.error('Error fetching onboarding:', error);

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
                message: error instanceof Error ? error.message : 'Failed to fetch onboarding'
            },
            { status: 500 }
        );
    }
}