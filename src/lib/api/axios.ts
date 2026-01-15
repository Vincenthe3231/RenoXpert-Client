import axios, { type InternalAxiosRequestConfig, type AxiosResponse } from 'axios'
import { keysToCamel, keysToSnake } from '../transform'

const BASE_URL = process.env.LARAVEL_API_URL

// Helper to transform request data
const transformRequest = (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    if (config.data && typeof config.data === 'object' && !(config.data instanceof FormData)) {
        config.data = keysToSnake(config.data)
    }
    return config
}

// Helper to transform response data
const transformResponse = (response: AxiosResponse): AxiosResponse => {
    if (response.data && typeof response.data === 'object') {
        response.data = keysToCamel(response.data)
    }
    return response
}

// 🔹 Versioned API (v1, v2, etc.)
export const laravelApi = axios.create({
    baseURL: `${BASE_URL}/api/v1`,
    withCredentials: true,
    headers: {
        Accept: 'application/json',
    },
})

// Add interceptors for versioned API
laravelApi.interceptors.request.use(transformRequest)
laravelApi.interceptors.response.use(
    transformResponse,
    (error) => {
        return Promise.reject(error)
    }
)

// 🔹 Root API (Sanctum, health checks, etc.)
export const laravelRootApi = axios.create({
    baseURL: BASE_URL,
    withCredentials: true,
    headers: {
        Accept: 'application/json',
    },
})

// Add interceptors for root API
laravelRootApi.interceptors.request.use(transformRequest)
laravelRootApi.interceptors.response.use(transformResponse)
