import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

import { laravelApi } from '@/lib/api/axios'
import { rejectOnboardingSchema } from '@/lib/api/onboarding/onboarding.schemas'

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const body = await req.json()

        const validatedData = rejectOnboardingSchema.parse(body)

        const cookieStore = await cookies()
        const cookieString = cookieStore
            .getAll()
            .map((c) => `${c.name}=${c.value}`)
            .join('; ')

        const laravelRes = await laravelApi.post(
            `/onboarding/${id}/rejection`,
            validatedData,
            {
                headers: cookieString ? { cookie: cookieString } : undefined,
            }
        )

        // Log the backend response for debugging
        console.log('[DEBUG] Backend rejection response:', JSON.stringify({
            status: laravelRes.status,
            hasData: !!laravelRes.data,
            dataKeys: laravelRes.data ? Object.keys(laravelRes.data) : [],
            dataStructure: JSON.stringify(laravelRes.data).substring(0, 500)
        }))

        const res = NextResponse.json(laravelRes.data)

        const setCookies = laravelRes.headers['set-cookie']
        if (setCookies) {
            const cookiesArray = Array.isArray(setCookies) ? setCookies : [setCookies]
            for (const cookie of cookiesArray) {
                res.headers.append('Set-Cookie', cookie)
            }
        }

        return res
    } catch (error: any) {
        if (error?.name === 'ZodError') {
            return NextResponse.json(
                { error: 'Validation failed', message: error.errors },
                { status: 400 }
            )
        }

        const status = error?.response?.status || 500
        const message =
            error?.response?.data?.message || 'Failed to reject onboarding'

        return NextResponse.json({ error: message }, { status })
    }
}

