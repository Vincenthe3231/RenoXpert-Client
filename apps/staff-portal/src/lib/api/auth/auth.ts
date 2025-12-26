import axios from 'axios'
import {
    LoginInputSchema,
    LoginResponseSchema,
    MeResponseSchema,
    userListSchema,
    type LoginInput,
    type StaffUser,
    type GetUsersParams,
    type UserListResponse,
} from './auth.schemas'

export async function login(payload: LoginInput): Promise<StaffUser> {
    LoginInputSchema.parse(payload)

    const { data } = await axios.post('/api/auth/login', payload)
    return LoginResponseSchema.parse(data).user
}

export async function getMe(): Promise<StaffUser | null> {
    const { data } = await axios.get('/api/auth/me')
    return MeResponseSchema.parse(data).user
}

export async function logout(): Promise<void> {
    await axios.post('/api/auth/logout')
}

export async function getUsers(params?: GetUsersParams): Promise<UserListResponse> {
    const { data } = await axios.get('/api/auth/users', { params })
    return userListSchema.parse(data)
}
