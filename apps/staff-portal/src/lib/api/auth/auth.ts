import axios from 'axios'
import {
    LoginInputSchema,
    LoginResponseSchema,
    MeResponseSchema,
    type User,
    type LoginInput,
} from './auth.schemas'

export async function login(payload: LoginInput): Promise<User> {
    LoginInputSchema.parse(payload)

    const { data } = await axios.post('/api/auth/login', payload)
    return LoginResponseSchema.parse(data).user
}

export async function getMe(): Promise<User | null> {
    const { data } = await axios.get('/api/auth/me')
    return MeResponseSchema.parse(data).user
}

export async function logout(): Promise<void> {
    await axios.post('/api/auth/logout')
}
