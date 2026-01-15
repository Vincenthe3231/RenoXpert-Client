import { cookies } from 'next/headers'
import { laravelApi } from '@/lib/api/axios'
import { NextResponse } from 'next/server'
import { getBearerToken } from '@/lib/api/utils/getBearerToken'

export async function GET() {
    try {
        const cookieStore = await cookies()
        const cookieString = cookieStore.getAll()
            .map(c => `${c.name}=${c.value}`)
            .join('; ')

        const token = await getBearerToken()

        // Build headers: prefer Bearer token, but also include session cookies as fallback
        const headers: Record<string, string> = {}
        if (token) {
            headers.Authorization = `Bearer ${token}`
        }
        if (cookieString) {
            headers.cookie = cookieString
        }
        
        // Try with Bearer token if available, otherwise try with session cookies only
        const laravelRes = await laravelApi.get('/roles', {
            headers: Object.keys(headers).length > 0 ? headers : undefined,
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

