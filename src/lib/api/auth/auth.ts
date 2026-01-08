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
    return result.data.user
}

export async function getMe(): Promise<StaffUser | null> {
    const { data } = await axios.get(API_ROUTES.AUTH.ME)
    const result = MeResponseSchema.safeParse(data)
    if (!result.success) {
        console.error('Me response validation failed:', result.error.issues)
        console.error('Received data:', JSON.stringify(data, null, 2))
        throw new Error(`Invalid me response: ${result.error.message}`)
    }
    return result.data.user
}

export async function logout(): Promise<void> {
    await axios.post(API_ROUTES.AUTH.LOGOUT)
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

export async function getUser(uuid: string): Promise<User> {
    const { data } = await axios.get(API_ROUTES.AUTH.USER(uuid))
    // Handle both response formats: { user: {...} } or directly the user object
    const userData = data.user || data
    const result = userSchema.safeParse(userData)
    if (!result.success) {
        console.error('User data validation failed:', result.error.issues)
        console.error('Received data:', JSON.stringify(userData, null, 2))
        throw new Error(`Invalid user data: ${result.error.message}`)
    }
    return result.data
}
