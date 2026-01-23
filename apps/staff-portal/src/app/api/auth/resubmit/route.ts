import { cookies } from 'next/headers'
import { laravelApi } from '@/lib/api/axios'
import { NextResponse } from 'next/server'

export async function POST() {
    try {
        const cookieStore = await cookies()
        const cookieString = cookieStore.getAll()
            .map(c => `${c.name}=${c.value}`)
            .join('; ')

        const laravelRes = await laravelApi.post('/auth/resubmit', {}, {
            headers: cookieString ? { cookie: cookieString } : undefined,
        })

        const res = NextResponse.json(laravelRes.data)

        // Forward any Set-Cookie headers from Laravel
        const setCookies = laravelRes.headers['set-cookie']
        if (setCookies) {
            const cookiesArray = Array.isArray(setCookies) ? setCookies : [setCookies]
            for (const cookie of cookiesArray) {
                res.headers.append('Set-Cookie', cookie)
            }
        }

        return res
    } catch (error: any) {
        console.error('Error resubmitting user:', error)

        const status = error?.response?.status || 500
        const errorData = error?.response?.data || {
            error: 'INTERNAL_ERROR',
            message: 'Failed to resubmit user',
            status,
        }

        return NextResponse.json(errorData, { status })
    }
}

