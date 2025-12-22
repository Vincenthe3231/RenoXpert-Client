import { cookies } from 'next/headers'
import { laravelApi } from '@/lib/api/axios'
import { NextResponse } from 'next/server'

export async function GET() {
    try {
        // ✅ MUST await cookies()
        const cookieStore = await cookies()
        const cookie = cookieStore.toString()

        const { data } = await laravelApi.get('/me', {
            headers: { cookie },
        })

        return NextResponse.json(data)
    } catch {
        return NextResponse.json({ user: null })
    }
}
