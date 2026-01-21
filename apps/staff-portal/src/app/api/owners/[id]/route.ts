import { cookies } from 'next/headers'
import { laravelApi } from '@/lib/api/axios'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params
    try {
        const cookieStore = await cookies()
        const cookieString = cookieStore.getAll()
            .map(c => `${c.name}=${c.value}`)
            .join('; ')

        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
        
        let laravelRes
        if (isUuid) {
            try {
                laravelRes = await laravelApi.get(`/owners/${id}`, {
                    headers: cookieString ? { cookie: cookieString } : undefined,
                })
            } catch (directError: any) {
                const ownersRes = await laravelApi.get('/owners', {
                    headers: cookieString ? { cookie: cookieString } : undefined,
                    params: {
                        per_page: 1000
                    }
                })
                const owners = ownersRes.data?.data || ownersRes.data || []
                const owner = Array.isArray(owners) ? owners.find((o: any) => o.uuid === id) : null
                if (!owner) {
                    throw { response: { status: 404, data: { message: `Owner with UUID ${id} not found` } } }
                }
                laravelRes = { 
                    data: { data: { owner } },
                    status: 200, 
                    headers: ownersRes.headers 
                }
            }
        } else {
            laravelRes = await laravelApi.get(`/owners/${id}`, {
                headers: cookieString ? { cookie: cookieString } : undefined,
            })
        }

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
        console.error('Error fetching owner:', {
            id,
            status: error?.response?.status,
            message: error?.response?.data?.message,
            data: error?.response?.data,
        })
        const status = error?.response?.status || 500
        const message = error?.response?.data?.message || 'Failed to fetch owner'
        return NextResponse.json({ error: message }, { status })
    }
}

export async function PUT(
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

        // Detect if ID is UUID format
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
        
        let laravelRes
        if (isUuid) {
            // Try direct call with UUID first
            try {
                laravelRes = await laravelApi.put(`/owners/${id}`, body, {
                    headers: cookieString ? { cookie: cookieString } : undefined,
                })
            } catch (directError: any) {
                // If UUID direct call fails, try to find owner by UUID and use their ID
                const ownersRes = await laravelApi.get('/owners', {
                    headers: cookieString ? { cookie: cookieString } : undefined,
                    params: {
                        per_page: 1000
                    }
                })
                const owners = ownersRes.data?.data || ownersRes.data || []
                const owner = Array.isArray(owners) ? owners.find((o: any) => o.uuid === id) : null
                if (!owner) {
                    throw { response: { status: 404, data: { message: `Owner with UUID ${id} not found` } } }
                }
                // Use the owner's ID (integer) for the update
                const ownerId = owner.id || owner.uuid
                laravelRes = await laravelApi.put(`/owners/${ownerId}`, body, {
                    headers: cookieString ? { cookie: cookieString } : undefined,
                })
            }
        } else {
            // Numeric ID: Use direct endpoint
            laravelRes = await laravelApi.put(`/owners/${id}`, body, {
                headers: cookieString ? { cookie: cookieString } : undefined,
            })
        }

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
        console.error('Error updating owner:', {
            id,
            status: error?.response?.status,
            message: error?.response?.data?.message,
            data: error?.response?.data,
        })
        
        // Forward backend error format: { error: "ERROR_CODE", message: "...", status: 400, fields?: {...} }
        const status = error?.response?.status || 500
        const backendError = error?.response?.data
        
        if (backendError?.error) {
            // Backend error format - forward it as-is
            return NextResponse.json({
                error: backendError.error,
                message: backendError.message || 'Failed to update owner',
                status: backendError.status || status,
                fields: backendError.fields,
            }, { status })
        } else {
            // Legacy error format or network error
            return NextResponse.json({
                error: 'INTERNAL_ERROR',
                message: backendError?.message || error?.message || 'Failed to update owner',
                status,
            }, { status })
        }
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const cookieStore = await cookies()
        const cookieString = cookieStore.getAll()
            .map(c => `${c.name}=${c.value}`)
            .join('; ')

        const laravelRes = await laravelApi.delete(`/owners/${id}`, {
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
        // Forward backend error format: { error: "ERROR_CODE", message: "...", status: 400 }
        const status = error?.response?.status || 500
        const backendError = error?.response?.data
        
        if (backendError?.error) {
            // Backend error format - forward it as-is
            return NextResponse.json({
                error: backendError.error,
                message: backendError.message || 'Failed to delete owner',
                status: backendError.status || status,
            }, { status })
        } else {
            // Legacy error format or network error
            return NextResponse.json({
                error: 'INTERNAL_ERROR',
                message: backendError?.message || error?.message || 'Failed to delete owner',
                status,
            }, { status })
        }
    }
}



