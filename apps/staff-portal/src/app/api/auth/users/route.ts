import { cookies } from 'next/headers'
import { laravelApi } from '@/lib/api/axios'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
    const cookieStore = await cookies()
    const cookie = cookieStore.toString()

    const { searchParams } = new URL(request.url)

    const params: Record<string, any> = {}
    const filterParams: Record<string, string> = {}
    
    // Filter parameters that go under filter[...]
    const filterFields = ['status', 'type', 'role', 'search']
    
    for (const key of filterFields) {
        const value = searchParams.get(key)
        if (value) {
            // Map 'type' to 'user_type' for backend
            const backendKey = key === 'type' ? 'user_type' : key
            filterParams[backendKey] = value
        }
    }
    
    // Add filter object if there are any filter params
    if (Object.keys(filterParams).length > 0) {
        params.filter = filterParams
    }
    
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
        const { data } = await laravelApi.get('/users', {
            headers: { cookie },
            params,
        })

        return NextResponse.json(data)
    } catch (error: any) {
        const status = error?.response?.status || 500
        const message = error?.response?.data?.message || 'Failed to fetch users'
        return NextResponse.json({ error: message }, { status })
    }
}