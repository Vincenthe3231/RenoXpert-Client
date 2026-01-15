import { cookies } from 'next/headers'
import { laravelApi } from '@/lib/api/axios'
import { getBearerToken } from '@/lib/api/utils/getBearerToken'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params
    try {
        const cookieStore = await cookies()
        const cookieString = cookieStore.getAll()
            .map(c => `${c.name}=${c.value}`)
            .join('; ')

        // Get Bearer token for authentication
        const bearerToken = await getBearerToken()
        
        // Build headers with Bearer token and session cookies
        const headers: Record<string, string> = {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        }
        if (bearerToken) {
            headers['Authorization'] = `Bearer ${bearerToken}`
        }
        if (cookieString) {
            headers['cookie'] = cookieString
        }
        
        // Backend now accepts both integer ID and UUID string
        const laravelRes = await laravelApi.post(`/users/${id}/deactivate`, {}, {
            headers,
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
        console.error('Error deactivating user:', error)
        
        // If it's an axios error with response, forward the backend error
        if (error?.response) {
            const status = error.response.status || 500
            const errorData = error.response.data || { message: 'Failed to deactivate user' }
            return NextResponse.json(errorData, { status })
        }
        
        // Otherwise, return a generic error
        return NextResponse.json(
            { error: 'Failed to deactivate user', message: error?.message || 'Unknown error' },
            { status: 500 }
        )
    }
}

