import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { laravelApi } from '@/lib/api/axios'

export async function POST() {
    const cookieStore = await cookies()
    const cookie = cookieStore.toString()

    const laravelRes = await laravelApi.post(
        '/logout',
        {},
        { headers: { cookie } }
    )

    const res = NextResponse.json({ ok: true })

    const setCookies = laravelRes.headers['set-cookie']
    if (setCookies) {
        for (const cookie of setCookies) {
            res.headers.append('Set-Cookie', cookie)
        }
    }


    return res
}
