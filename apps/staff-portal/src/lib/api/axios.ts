import axios from 'axios'

const BASE_URL = process.env.LARAVEL_API_URL

// 🔹 Versioned API (v1, v2, etc.)
export const laravelApi = axios.create({
    baseURL: `${BASE_URL}/api/v1`,
    withCredentials: true,
    headers: {
        Accept: 'application/json',
    },
})

// 🔹 Root API (Sanctum, health checks, etc.)
export const laravelRootApi = axios.create({
    baseURL: BASE_URL,
    withCredentials: true,
    headers: {
        Accept: 'application/json',
    },
})
