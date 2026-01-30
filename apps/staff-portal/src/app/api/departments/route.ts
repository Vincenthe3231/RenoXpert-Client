import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { laravelApi } from '@/lib/api/axios'

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const cookieString = cookieStore.getAll()
      .map(c => `${c.name}=${c.value}`)
      .join('; ')

    const laravelRes = await laravelApi.get(
      '/departments',
      {
        headers: cookieString ? { cookie: cookieString } : undefined,
      }
    )
    
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
    console.error('Error fetching departments:', error)
    const status = error?.response?.status || 500
    const laravelData = error?.response?.data
    const message = laravelData?.message || 'Failed to fetch departments'
    return NextResponse.json(
      { 
        error: message,
      },
      { status }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const cookieStore = await cookies()
    const cookieString = cookieStore.getAll()
      .map(c => `${c.name}=${c.value}`)
      .join('; ')

    const laravelRes = await laravelApi.post(
      '/departments',
      body,
      {
        headers: cookieString ? { cookie: cookieString } : undefined,
      }
    )
    
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
    console.error('Error creating department:', error)
    const status = error?.response?.status || 500
    const laravelData = error?.response?.data
    const validationErrors = laravelData?.errors
    const message = laravelData?.message || 'Failed to create department'
    return NextResponse.json(
      { 
        error: message,
        ...(validationErrors && { errors: validationErrors })
      },
      { status }
    )
  }
}

