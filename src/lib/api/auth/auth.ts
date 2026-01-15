import axios from 'axios'
import {
    LoginInputSchema,
    LoginResponseSchema,
    MeResponseSchema,
    userListSchema,
    userSchema,
    LoginInput,
    StaffUser,
    GetUsersParams,
    UserListResponse,
    User,
} from './auth.schemas'
import { API_ROUTES } from '../constants'

export async function login(payload: LoginInput): Promise<StaffUser> {
    LoginInputSchema.parse(payload)

    const { data } = await axios.post(API_ROUTES.AUTH.LOGIN, payload)
    const result = LoginResponseSchema.safeParse(data)
    if (!result.success) {
        console.error('Login response validation failed:', result.error.issues)
        console.error('Received data:', JSON.stringify(data, null, 2))
        throw new Error(`Invalid login response: ${result.error.message}`)
    }
    return result.data.data.user
}

export async function getMe(): Promise<StaffUser | null> {
    const { data } = await axios.get(API_ROUTES.AUTH.ME)
    
    const result = MeResponseSchema.safeParse(data)
    if (!result.success) {
        console.error('Me response validation failed:', result.error.issues)
        console.error('Received data:', JSON.stringify(data, null, 2))
        throw new Error(`Invalid me response: ${result.error.message}`)
    }
    // Handle both response formats: nested data.user or null
    if ('data' in result.data && result.data.data) {
        const user = result.data.data.user
        // Attach rejectionReason to user if available (for rejected users)
        if (result.data.data.rejectionReason) {
            (user as any).rejectionReason = result.data.data.rejectionReason
        }
        return user
    }
    return null
}

export async function logout(): Promise<void> {
    await axios.post(API_ROUTES.AUTH.LOGOUT)
}

export async function resubmit(): Promise<void> {
    await axios.post(API_ROUTES.AUTH.RESUBMIT)
}

export async function deactivateUser(identifier: string): Promise<User> {
    // Backend now accepts both integer ID and UUID string directly
    try {
        const { data } = await axios.post(API_ROUTES.AUTH.DEACTIVATE_USER(identifier))
        // Handle response format: { success: true, message: "...", data: { user: {...} } }
        // Also support legacy formats: { message: "...", data: { user: {...} } } or { user: {...} }
        const userData = data?.data?.user || data?.user || data
        const result = userSchema.safeParse(userData)
        if (!result.success) {
            console.error('Deactivate user response validation failed:', result.error.issues)
            console.error('Received data:', JSON.stringify(userData, null, 2))
            throw new Error(`Invalid deactivate user response: ${result.error.message}`)
        }
        return result.data
    } catch (error: any) {
        throw error
    }
}

export async function getUsers(params?: GetUsersParams): Promise<UserListResponse> {
    const { data } = await axios.get(API_ROUTES.AUTH.USERS, { params })
    const result = userListSchema.safeParse(data)
    if (!result.success) {
        console.error('User list data validation failed:', result.error.issues)
        console.error('Received data:', JSON.stringify(data, null, 2))
        throw new Error(`Invalid user list data: ${result.error.message}`)
    }
    return result.data
}

export async function getUser(id: string): Promise<User> {
    try {
        const { data } = await axios.get(API_ROUTES.AUTH.USER(id))
        // Handle multiple response formats:
        // 1. { message: "...", data: { user: {...} } } - new backend format
        // 2. { user: {...} } - old format
        // 3. Direct user object
        const userData = data?.data?.user || data?.user || data
        const result = userSchema.safeParse(userData)
        if (!result.success) {
            console.error('User data validation failed:', result.error.issues)
            console.error('Received data:', JSON.stringify(userData, null, 2))
            throw new Error(`Invalid user data: ${result.error.message}`)
        }
        return result.data
    } catch (error: any) {
        throw error
    }
}
