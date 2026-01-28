import { cookies } from 'next/headers'
import { laravelApi } from '@/lib/api/axios'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
    const cookieStore = await cookies()
    
    // Properly format cookies: convert cookie store to HTTP Cookie header format
    const cookieString = cookieStore.getAll()
        .map(c => `${c.name}=${c.value}`)
        .join('; ')

    const { searchParams } = new URL(request.url)

    const params: Record<string, any> = {}

    // Pagination parameters
    const page = searchParams.get('page')
    if (page) {
        params.page = page
    }

    const perPage = searchParams.get('per_page') || searchParams.get('perPage')
    if (perPage) {
        params.per_page = perPage
    }

    // Filter parameters
    const filterParams: Record<string, string> = {}
    const filterFields = ['status', 'search']
    
    for (const key of filterFields) {
        const value = searchParams.get(`filter[${key}]`) || searchParams.get(key)
        if (value) {
            filterParams[key] = value
        }
    }
    
    if (Object.keys(filterParams).length > 0) {
        params.filter = filterParams
    }

    try {
        const laravelRes = await laravelApi.get('/vendors', {
            headers: cookieString ? { cookie: cookieString } : undefined,
            params,
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
        const status = error?.response?.status || 500
        const message = error?.response?.data?.message || 'Failed to fetch vendors'
        return NextResponse.json({ error: message }, { status })
    }
}

export async function POST(request: NextRequest) {
    const cookieStore = await cookies()
    const cookieString = cookieStore.getAll()
        .map(c => `${c.name}=${c.value}`)
        .join('; ')

    try {
        const body = await request.json()

        const laravelRes = await laravelApi.post('/vendors', body, {
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
        const status = error?.response?.status || 500
        const message = error?.response?.data?.message || 'Failed to create vendor'
        return NextResponse.json({ error: message }, { status })
    }
}


