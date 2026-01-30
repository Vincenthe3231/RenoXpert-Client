import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { laravelApi } from '@/lib/api/axios'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    // Get cookies for authentication
    const cookieStore = await cookies()
    const cookieString = cookieStore.getAll()
      .map(c => `${c.name}=${c.value}`)
      .join('; ')

    // Make request to Laravel backend
    const laravelRes = await laravelApi.put(
      `/users/${id}`,
      body,
      {
        headers: cookieString ? { cookie: cookieString } : undefined,
      }
    )

    // Create response
    const res = NextResponse.json(laravelRes.data)

    // Forward all cookies from Laravel response
    const setCookies = laravelRes.headers['set-cookie']
    if (setCookies) {
      const cookiesArray = Array.isArray(setCookies) ? setCookies : [setCookies]
      for (const cookie of cookiesArray) {
        res.headers.append('Set-Cookie', cookie)
      }
    }

    return res
  } catch (error: any) {
    console.error('Error updating user:', error)

    // Handle Laravel API errors
    const status = error?.response?.status || 500
    const laravelData = error?.response?.data
    
    // Laravel validation errors are typically in errors object
    const validationErrors = laravelData?.errors
    const message = laravelData?.message || 'Failed to update user'
    
    return NextResponse.json(
      { 
        error: message,
        ...(validationErrors && { errors: validationErrors })
      },
      { status }
    )
  }
}

