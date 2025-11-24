import { OnboardingService } from "@/lib/api/services/onboarding.service";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { rejectionReason } = await request.json();
        const id = (await params).id;
        const token = request.cookies.get('auth-token')?.value;

        if (!token) {
            return NextResponse.json(
                { error: 'Unauthorized', message: 'No authentication token found' },
                { status: 401 }
            );
        }

        if (!rejectionReason || rejectionReason.trim() === '') {
            return NextResponse.json(
                { error: 'Bad Request', message: 'Rejection reason is required' },
                { status: 400 }
            );
        }

        const data = await OnboardingService.reject(id, { rejectionReason }, token);
        return NextResponse.json(data, { status: 200 });

    } catch (error: any) {
        console.error('Error rejecting onboarding:', error);

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
            { error: 'Internal Server Error', message: error instanceof Error ? error.message : 'Failed to reject onboarding' },
            { status: 500 }
        );
    }
}

