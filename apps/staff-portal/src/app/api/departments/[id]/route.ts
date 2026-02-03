import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { laravelApi } from '@/lib/api/axios'

/**
 * PATCH /api/departments/:id - Update department
 * 
 * Transforms camelCase frontend data to snake_case for Laravel backend
 */
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json()
    const { id } = await context.params
    
    // Transform camelCase to snake_case for Laravel backend
    const payload: any = {}
    if (body.name !== undefined) payload.name = body.name
    if (body.shortCode !== undefined) payload.short_code = body.shortCode
    if (body.description !== undefined) payload.description = body.description
    if (body.colorScheme !== undefined) payload.color_scheme = body.colorScheme
    if (body.status !== undefined) payload.status = body.status

    // Get authentication cookies
    const cookieStore = await cookies()
    const cookieString = cookieStore.getAll()
      .map(c => `${c.name}=${c.value}`)
      .join('; ')

    // Forward request to Laravel backend
    const laravelRes = await laravelApi.patch(
      `/departments/${id}`,
      payload,
      {
        headers: cookieString ? { cookie: cookieString } : undefined,
      }
    )
    
    // Build Next.js response
    const res = NextResponse.json(laravelRes.data)
    
    // Forward Set-Cookie headers from Laravel to client
    const setCookies = laravelRes.headers['set-cookie']
    if (setCookies) {
      const cookiesArray = Array.isArray(setCookies) ? setCookies : [setCookies]
      for (const cookie of cookiesArray) {
        res.headers.append('Set-Cookie', cookie)
      }
    }
    
    return res
  } catch (error: any) {
    console.error('Error updating department:', error)
    
    const status = error?.response?.status || 500
    const laravelData = error?.response?.data
    const validationErrors = laravelData?.errors
    const message = laravelData?.message || 'Failed to update department'
    
    return NextResponse.json(
      { 
        error: message,
        ...(validationErrors && { errors: validationErrors })
      },
      { status }
    )
  }
}

/**
 * DELETE /api/departments/:id - Delete (deactivate) department
 * 
 * Note: Backend performs soft deletion by setting status=false
 */
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    
    // Get authentication cookies
    const cookieStore = await cookies()
    const cookieString = cookieStore.getAll()
      .map(c => `${c.name}=${c.value}`)
      .join('; ')

    // Forward delete request to Laravel backend
    const laravelRes = await laravelApi.delete(
      `/departments/${id}`,
      {
        headers: cookieString ? { cookie: cookieString } : undefined,
      }
    )
    
    // Build Next.js response
    const res = NextResponse.json(laravelRes.data)
    
    // Forward Set-Cookie headers from Laravel to client
    const setCookies = laravelRes.headers['set-cookie']
    if (setCookies) {
      const cookiesArray = Array.isArray(setCookies) ? setCookies : [setCookies]
      for (const cookie of cookiesArray) {
        res.headers.append('Set-Cookie', cookie)
      }
    }
    
    return res
  } catch (error: any) {
    console.error('Error deleting department:', error)
    
    const status = error?.response?.status || 500
    const laravelData = error?.response?.data
    const message = laravelData?.message || 'Failed to delete department'
    
    return NextResponse.json(
      { 
        error: message,
        // Backend returns specific error for departments in use:
        // error_code: 'DEPARTMENT_IN_USE' (status 409)
      },
      { status }
    )
  }
}

