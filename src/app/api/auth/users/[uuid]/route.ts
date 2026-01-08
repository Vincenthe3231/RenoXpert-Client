import { cookies } from 'next/headers'
import { laravelApi } from '@/lib/api/axios'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ uuid: string }> }
) {
    try {
        const { uuid } = await params
        const cookieStore = await cookies()
        const cookie = cookieStore.toString()

        const { data } = await laravelApi.get(`/users/${uuid}`, {
            headers: { cookie },
        })

        return NextResponse.json(data)
    } catch (error: any) {
        const status = error?.response?.status || 500
        const message = error?.response?.data?.message || 'Failed to fetch user'
        return NextResponse.json({ error: message }, { status })
    }
}

