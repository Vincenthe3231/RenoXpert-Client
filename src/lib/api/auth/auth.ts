import axios from 'axios'
import {
    LoginInputSchema,
    LoginResponseSchema,
    MeResponseSchema,
    userListSchema,
    LoginInput,
    StaffUser,
    GetUsersParams,
    UserListResponse,
} from './auth.schemas'

export async function login(payload: LoginInput): Promise<StaffUser> {
    LoginInputSchema.parse(payload)

    const { data } = await axios.post('/api/auth/login', payload)
    const result = LoginResponseSchema.safeParse(data)
    if (!result.success) {
        console.error('Login response validation failed:', result.error.issues)
        console.error('Received data:', JSON.stringify(data, null, 2))
        throw new Error(`Invalid login response: ${result.error.message}`)
    }
    return result.data.user
}

export async function getMe(): Promise<StaffUser | null> {
    const { data } = await axios.get('/api/auth/me')
    const result = MeResponseSchema.safeParse(data)
    if (!result.success) {
        console.error('Me response validation failed:', result.error.issues)
        console.error('Received data:', JSON.stringify(data, null, 2))
        throw new Error(`Invalid me response: ${result.error.message}`)
    }
    return result.data.user
}

export async function logout(): Promise<void> {
    await axios.post('/api/auth/logout')
}

export async function getUsers(params?: GetUsersParams): Promise<UserListResponse> {
    const { data } = await axios.get('/api/auth/users', { params })
    const result = userListSchema.safeParse(data)
    if (!result.success) {
        console.error('User list data validation failed:', result.error.issues)
        console.error('Received data:', JSON.stringify(data, null, 2))
        throw new Error(`Invalid user list data: ${result.error.message}`)
    }
    return result.data
}
