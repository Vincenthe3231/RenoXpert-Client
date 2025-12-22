import { NextResponse } from 'next/server'
import { laravelApi, laravelRootApi } from '@/lib/api/axios'

export async function POST(req: Request) {
    const body = await req.json()

    // 1️⃣ Get CSRF cookie (required for Sanctum, harmless even if CSRF disabled)
    await laravelRootApi.get('/sanctum/csrf-cookie')

    // 2️⃣ Login
    const laravelRes = await laravelApi.post('/login', body)

    // 3️⃣ Create response
    const res = NextResponse.json(laravelRes.data)

    // 4️⃣ FORWARD ALL COOKIES (THIS WAS MISSING / BROKEN)
    const setCookies = laravelRes.headers['set-cookie']

    if (setCookies) {
        for (const cookie of setCookies) {
            res.headers.append('Set-Cookie', cookie)
        }
    }

    return res
}
