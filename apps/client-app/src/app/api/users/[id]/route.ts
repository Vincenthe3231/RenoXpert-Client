import { UserApiService } from "@/lib/api/services/user.services";
import { NextRequest, NextResponse } from "next/server";
import { editStaffSchema, editOwnerSchema, EditStaffInput, EditOwnerInput } from "@/lib/schemas";


// GET /api/users/[id] - Get user by ID
// For example: http://localhost:3000/api/users/1
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
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

        const { id } = await params;
        const data = await UserApiService.getById(id, token);

        return NextResponse.json(data,
            { status: 200 }
        );

    } catch (error: any) {
        console.error('Error fetching user:', error);

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
                message: error instanceof Error ? error.message : 'Failed to fetch user'
            },
            { status: 500 }
        );
    }
}

// PUT /api/users/[id] - Update user by ID
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
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

        const { id } = await params;
        
        // Parse request body
        const body = await request.json();

        // Validate the request body based on userType
        let validatedData: EditStaffInput | EditOwnerInput;
        
        if (body.userType === 'staff') {
            validatedData = editStaffSchema.parse(body) as EditStaffInput;
        } else if (body.userType === 'owner') {
            validatedData = editOwnerSchema.parse(body) as EditOwnerInput;
        } else {
            return NextResponse.json(
                { error: 'Bad Request', message: 'Invalid userType. Must be "staff" or "owner"' },
                { status: 400 }
            );
        }

        // Update the user
        // Type assertion is safe here since we're only sending editable fields to the backend
        const updatedUser = await UserApiService.update(id, validatedData, token);

        return NextResponse.json(
            updatedUser,
            { status: 200 }
        );

    } catch (error: any) {
        console.error('Error updating user:', error);

        // Handle Zod validation errors
        if (error.name === 'ZodError') {
            return NextResponse.json(
                {
                    error: 'Validation Error',
                    message: 'Invalid input data',
                    details: error.errors
                },
                { status: 400 }
            );
        }

        // Handle different error statuses
        if (error?.message?.includes('401') || error?.response?.status === 401) {
            return NextResponse.json(
                { error: 'Unauthorized', message: 'Authentication token expired or invalid' },
                { status: 401 }
            );
        }

        if (error?.response?.status === 403) {
            return NextResponse.json(
                { error: 'Forbidden', message: 'You do not have permission to update this resource' },
                { status: 403 }
            );
        }

        if (error?.response?.status === 404) {
            return NextResponse.json(
                { error: 'Not Found', message: 'User not found' },
                { status: 404 }
            );
        }

        if (error?.response?.status === 422) {
            // Unprocessable Entity - validation errors from backend
            return NextResponse.json(
                {
                    error: 'Validation Error',
                    message: error.response?.data?.message || 'Validation failed',
                    details: error.response?.data?.errors || {}
                },
                { status: 422 }
            );
        }

        return NextResponse.json(
            {
                error: 'Internal Server Error',
                message: error instanceof Error ? error.message : 'Failed to update user'
            },
            { status: 500 }
        );
    }
}