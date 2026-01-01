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

        // Get cookies for authentication
        const cookieStore = await cookies()
        const cookie = cookieStore.toString()

        // Make request to Laravel backend
        const laravelRes = await laravelApi.post(
            `/onboarding/${id}/approval`,
            validatedData,
            {
                headers: { cookie },
            }
        )

        // Create response
        const res = NextResponse.json(laravelRes.data)

        // Forward all cookies from Laravel response
        const setCookies = laravelRes.headers['set-cookie']
        if (setCookies) {
            for (const cookie of setCookies) {
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
        const message = error?.response?.data?.message || 'Failed to approve onboarding'
        return NextResponse.json(
            { error: message },
            { status }
        )
    }
}