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
                laravelRes = await laravelApi.get(`/vendors/${id}`, {
                    headers: cookieString ? { cookie: cookieString } : undefined,
                })
            } catch (directError: any) {
                const vendorsRes = await laravelApi.get('/vendors', {
                    headers: cookieString ? { cookie: cookieString } : undefined,
                    params: {
                        per_page: 1000
                    }
                })
                const vendors = vendorsRes.data?.data || vendorsRes.data || []
                const vendor = Array.isArray(vendors) ? vendors.find((v: any) => v.uuid === id) : null
                if (!vendor) {
                    throw { response: { status: 404, data: { message: `Vendor with UUID ${id} not found` } } }
                }
                laravelRes = { 
                    data: { data: { vendor } },
                    status: 200, 
                    headers: vendorsRes.headers 
                }
            }
        } else {
            laravelRes = await laravelApi.get(`/vendors/${id}`, {
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
        console.error('Error fetching vendor:', {
            id,
            status: error?.response?.status,
            message: error?.response?.data?.message,
            data: error?.response?.data,
        })
        const status = error?.response?.status || 500
        const message = error?.response?.data?.message || 'Failed to fetch vendor'
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
                laravelRes = await laravelApi.put(`/vendors/${id}`, body, {
                    headers: cookieString ? { cookie: cookieString } : undefined,
                })
            } catch (directError: any) {
                // If UUID direct call fails, try to find vendor by UUID and use their ID
                const vendorsRes = await laravelApi.get('/vendors', {
                    headers: cookieString ? { cookie: cookieString } : undefined,
                    params: {
                        per_page: 1000
                    }
                })
                const vendors = vendorsRes.data?.data || vendorsRes.data || []
                const vendor = Array.isArray(vendors) ? vendors.find((v: any) => v.uuid === id) : null
                if (!vendor) {
                    throw { response: { status: 404, data: { message: `Vendor with UUID ${id} not found` } } }
                }
                // Use the vendor's ID (integer) for the update
                const vendorId = vendor.id || vendor.uuid
                laravelRes = await laravelApi.put(`/vendors/${vendorId}`, body, {
                    headers: cookieString ? { cookie: cookieString } : undefined,
                })
            }
        } else {
            // Numeric ID: Use direct endpoint
            laravelRes = await laravelApi.put(`/vendors/${id}`, body, {
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
        console.error('Error updating vendor:', {
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
                message: backendError.message || 'Failed to update vendor',
                status: backendError.status || status,
                fields: backendError.fields,
            }, { status })
        } else {
            // Legacy error format or network error
            return NextResponse.json({
                error: 'INTERNAL_ERROR',
                message: backendError?.message || error?.message || 'Failed to update vendor',
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

        const laravelRes = await laravelApi.delete(`/vendors/${id}`, {
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
                message: backendError.message || 'Failed to delete vendor',
                status: backendError.status || status,
            }, { status })
        } else {
            // Legacy error format or network error
            return NextResponse.json({
                error: 'INTERNAL_ERROR',
                message: backendError?.message || error?.message || 'Failed to delete vendor',
                status,
            }, { status })
        }
    }
}


