import { cookies } from 'next/headers'
import { laravelApi } from '@/lib/api/axios'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
    const cookieStore = await cookies()
    const cookie = cookieStore.toString()

    const { searchParams } = new URL(request.url)

    const params: Record<string, any> = {}

    // Pagination parameters at top level
    const page = searchParams.get('page')
    if (page) {
        params.page = page
    }

    const perPage = searchParams.get('per_page') || searchParams.get('perPage')
    if (perPage) {
        params.per_page = perPage
    }

    try {
        const { data } = await laravelApi.get('/onboarding', {
            headers: { cookie },
            params,
        })

        return NextResponse.json(data)
    } catch (error: any) {
        const status = error?.response?.status || 500
        const message = error?.response?.data?.message || 'Failed to fetch onboardings'
        return NextResponse.json({ error: message }, { status })
    }
}