import { cookies } from 'next/headers'
import { laravelApi } from '@/lib/api/axios'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const cookieStore = await cookies()
        const cookieString = cookieStore.getAll()
            .map(c => `${c.name}=${c.value}`)
            .join('; ')

        const body = await request.json()

        const laravelRes = await laravelApi.post(`/users/${id}/change-staff-type`, body, {
            headers: cookieString ? { cookie: cookieString } : undefined,
        })

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
        const status = error?.response?.status || 500
        const message = error?.response?.data?.message || 'Failed to change staff type'
        return NextResponse.json({ error: message }, { status })
    }
}



