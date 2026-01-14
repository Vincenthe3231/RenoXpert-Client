import { cookies } from 'next/headers'
import { laravelApi } from '@/lib/api/axios'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
    const cookieStore = await cookies()
    
    // Properly format cookies: convert cookie store to HTTP Cookie header format
    // Format: "name1=value1; name2=value2"
    const cookieString = cookieStore.getAll()
        .map(c => `${c.name}=${c.value}`)
        .join('; ')

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

    // Filter parameters
    const filterParams: Record<string, string> = {}
    const filterFields = ['log_name', 'event', 'causer_id', 'subject_id', 'subject_type']
    
    for (const key of filterFields) {
        const value = searchParams.get(`filter[${key}]`) || searchParams.get(key)
        if (value) {
            filterParams[key] = value
        }
    }
    
    // Add filter object if there are any filter params
    if (Object.keys(filterParams).length > 0) {
        params.filter = filterParams
    }

    // Sorting
    const sort = searchParams.get('sort')
    if (sort) {
        params.sort = sort
    }

    try {
        const laravelRes = await laravelApi.get('/activity-logs', {
            headers: cookieString ? { cookie: cookieString } : undefined,
            params,
        })

        const res = NextResponse.json(laravelRes.data)

        // Forward any Set-Cookie headers from Laravel (session regeneration, etc.)
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
        const message = error?.response?.data?.message || 'Failed to fetch activity logs'
        return NextResponse.json({ error: message }, { status })
    }
}


