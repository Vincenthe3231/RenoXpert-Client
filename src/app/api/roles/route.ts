import { cookies } from 'next/headers'
import { laravelApi } from '@/lib/api/axios'
import { NextResponse } from 'next/server'
import { getBearerToken } from '@/lib/api/utils/getBearerToken'

export async function GET() {
    try {
        const token = await getBearerToken()
        if (!token) {
            return NextResponse.json(
                { error: 'UNAUTHORIZED', message: 'Authentication required.', status: 401 },
                { status: 401 }
            )
        }

        const cookieStore = await cookies()
        const cookieString = cookieStore.getAll()
            .map(c => `${c.name}=${c.value}`)
            .join('; ')

        const laravelRes = await laravelApi.get('/roles', {
            headers: {
                Authorization: `Bearer ${token}`,
                ...(cookieString ? { cookie: cookieString } : {}),
            },
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
        console.error('Error fetching roles:', error)

        const status = error?.response?.status || 500
        const errorData = error?.response?.data || {
            error: 'INTERNAL_ERROR',
            message: 'Failed to fetch roles',
            status,
        }

        return NextResponse.json(errorData, { status })
    }
}

