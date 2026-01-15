import { cookies } from 'next/headers'
import { laravelApi } from '@/lib/api/axios'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const cookieStore = await cookies()
        
        // Properly format cookies: convert cookie store to HTTP Cookie header format
        // Format: "name1=value1; name2=value2"
        const cookieString = cookieStore.getAll()
            .map(c => `${c.name}=${c.value}`)
            .join('; ')

        // Check if id is a UUID - test if backend now accepts UUIDs directly
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
        
        let laravelRes
        if (isUuid) {
            // Backend may now accept UUIDs directly in GET /users/{id}
            // Try direct call first, fallback to workaround if it fails
            try {
                // Try direct call with UUID
                laravelRes = await laravelApi.get(`/users/${id}`, {
                    headers: cookieString ? { cookie: cookieString } : undefined,
                })
            } catch (directError: any) {
                // Fallback: Fetch all users and find by UUID
                const usersRes = await laravelApi.get('/users', {
                    headers: cookieString ? { cookie: cookieString } : undefined,
                    params: {
                        per_page: 1000
                    }
                })
                const users = usersRes.data?.data || usersRes.data || []
                const user = Array.isArray(users) ? users.find((u: any) => u.uuid === id) : null
                if (!user) {
                    throw { response: { status: 404, data: { message: `User with UUID ${id} not found` } } }
                }
                laravelRes = { 
                    data: { data: { user }, user },
                    status: 200, 
                    headers: usersRes.headers 
                }
            }
        } else {
            // Numeric ID: Use direct endpoint
            laravelRes = await laravelApi.get(`/users/${id}`, {
                headers: cookieString ? { cookie: cookieString } : undefined,
            })
        }

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
        const message = error?.response?.data?.message || 'Failed to fetch user'
        return NextResponse.json({ error: message }, { status })
    }
}

