import { NextRequest, NextResponse } from 'next/server';
import BackendConfig from '@/config/backend';

/**
 * POST /api/auth/login
 * Server-side route handler to login a user
 * 
 * Request body:
 * - email: User's email
 * - password: User's password
 */
export async function POST(request: NextRequest) {
    const { email, password } = await request.json();

    const response = await fetch(`${BackendConfig.baseUrl}${BackendConfig.endpoints.login}`, {
        method: 'POST',
        headers: BackendConfig.defaultHeaders,
        body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
        return NextResponse.json({ error: 'Login failed' }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
}