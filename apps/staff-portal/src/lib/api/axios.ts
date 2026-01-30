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

// Helper to get CSRF token from cookies (client-side only)
function getCsrfToken(): string | null {
    if (typeof document === 'undefined') return null
    const cookies = document.cookie.split(';')
    for (let cookie of cookies) {
        const [key, value] = cookie.trim().split('=')
        if (key === 'XSRF-TOKEN') {
            return decodeURIComponent(value)
        }
    }
    return null
}

// Request interceptor to add CSRF token
const addCsrfToken = (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    const csrfToken = getCsrfToken()
    if (csrfToken) {
        config.headers['X-XSRF-TOKEN'] = csrfToken
    }
    return config
}

// Response interceptor to handle 419 errors (CSRF token mismatch)
// Note: laravelRootApi is defined below, so we need to reference it after it's created
let laravelRootApiRef: typeof laravelRootApi | null = null

const handleCsrfError = async (error: any) => {
    if (error?.response?.status === 419) {
        // CSRF token expired or missing - refresh it
        try {
            // Use laravelRootApi to get CSRF cookie (reference set after creation)
            const rootApi = laravelRootApiRef || laravelRootApi
            await rootApi.get('/sanctum/csrf-cookie')
            // Retry the original request
            const csrfToken = getCsrfToken()
            if (csrfToken && error.config) {
                error.config.headers['X-XSRF-TOKEN'] = csrfToken
                return laravelApi.request(error.config)
            }
        } catch (refreshError) {
            // If CSRF refresh fails, reject with original error
            return Promise.reject(error)
        }
    }
    return Promise.reject(error)
}

// Add interceptors for versioned API
laravelApi.interceptors.request.use(transformRequest)
laravelApi.interceptors.request.use(addCsrfToken)
laravelApi.interceptors.response.use(
    transformResponse,
    handleCsrfError
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

// Set reference for CSRF error handler
laravelRootApiRef = laravelRootApi
