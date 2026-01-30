import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { laravelApi } from '@/lib/api/axios'
import { approveOnboardingSchema } from '@/lib/api/onboarding/onboarding.schemas'

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const body = await req.json()

        // Validate request body
        const validatedData = approveOnboardingSchema.parse(body)

        // Transform camelCase to snake_case for backend
        const backendPayload: Record<string, any> = {}
        if (validatedData.staffType !== undefined) {
            backendPayload.staff_type = validatedData.staffType
        }
        if (validatedData.department !== undefined) {
            backendPayload.department = validatedData.department
        }

        // Get cookies for authentication
        const cookieStore = await cookies()
        
        // Properly format cookies: convert cookie store to HTTP Cookie header format
        // Format: "name1=value1; name2=value2"
        const cookieString = cookieStore.getAll()
            .map(c => `${c.name}=${c.value}`)
            .join('; ')

        // Make request to Laravel backend
        const laravelRes = await laravelApi.post(
            `/onboarding/${id}/approval`,
            backendPayload,
            {
                headers: cookieString ? { cookie: cookieString } : undefined,
            }
        )

        // Create response
        const res = NextResponse.json(laravelRes.data)

        // Forward all cookies from Laravel response
        const setCookies = laravelRes.headers['set-cookie']
        if (setCookies) {
            const cookiesArray = Array.isArray(setCookies) ? setCookies : [setCookies]
            for (const cookie of cookiesArray) {
                res.headers.append('Set-Cookie', cookie)
            }
        }

        return res
    } catch (error: any) {
        console.error('Error approving onboarding:', error)

        // Handle validation errors
        if (error?.name === 'ZodError') {
            return NextResponse.json(
                { error: 'Validation failed', message: error.errors },
                { status: 400 }
            )
        }

        // Handle Laravel API errors
        const status = error?.response?.status || 500
        const laravelData = error?.response?.data
        
        // Laravel validation errors are typically in errors object
        const validationErrors = laravelData?.errors
        const message = laravelData?.message || 'Failed to approve onboarding'
        
        return NextResponse.json(
            { 
                error: message,
                ...(validationErrors && { errors: validationErrors })
            },
            { status }
        )
    }
}