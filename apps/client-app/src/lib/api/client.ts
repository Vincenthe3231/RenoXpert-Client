import BackendConfig from "@/config/backend";
import { keysToCamel, keysToSnake } from "../transform";

const BASE_URL = process.env.BACKEND_API_URL || 'http://localhost:8000';

export class ApiClient {
    private static baseUrl = BASE_URL;
    private static token = getToken();

    static async request<T>(
        endpoint: string,
        options: RequestInit = {},
        token?: string | null
    ): Promise<T> {
        const url = `${this.baseUrl}${endpoint}`;

        // Use provided token, fallback to instance token, or null
        const authToken = token !== undefined ? token : this.token;

        const headers = {
            'Content-Type': 'application/json',
            ...(authToken && { 'Authorization': `Bearer ${authToken}` }),
            ...options.headers,
        };

        // Transform body to snake_case before sending
        let body = options.body;
        if (body && typeof body === 'string') {
            try {
                const parsed = JSON.parse(body);
                body = JSON.stringify(keysToSnake(parsed));
            } catch (e) {
                // If not JSON, leave as is
            }
        }


        console.log('headers', headers);
        console.log('body', body);
        console.log('url', url);
        console.log('options', options);

        const response = await fetch(url, {
            ...options,
            headers,
            body,
        });

        if (!response.ok) {
            // Try to get error message from response
            let errorMessage = `HTTP error! status: ${response.status}`;
            let errorData: any = null;

            try {
                errorData = await response.json();
                errorMessage = errorData.message || errorData.error || errorMessage;
            } catch (e) {
                // Response might not be JSON
            }

            const error: any = new Error(errorMessage);
            error.status = response.status;
            error.response = { status: response.status, data: errorData };
            throw error;
        }

        const data = await response.json();

        // Transform response to camelCase
        return keysToCamel<T>(data);

    }

    static get<T>(endpoint: string, params?: Record<string, any>, token?: string | null): Promise<T> {
        let url = endpoint;
        if (params && Object.keys(params).length > 0) {
            const searchParams = new URLSearchParams();
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    if (Array.isArray(value)) {
                        value.forEach(v => searchParams.append(key, String(v)));
                    } else if (typeof value === 'object') {
                        // For nested objects, stringify them
                        searchParams.append(key, JSON.stringify(value));
                    } else {
                        searchParams.append(key, String(value));
                    }
                }
            });
            const queryString = searchParams.toString();
            url = queryString ? `${endpoint}?${queryString}` : endpoint;
        }
        return this.request<T>(url, { method: 'GET' }, token);
    }

    static post<T>(endpoint: string, data: any, token?: string | null): Promise<T> {
        return this.request<T>(endpoint, {
            method: 'POST',
            body: JSON.stringify(data),
        }, token);
    }

    static put<T>(endpoint: string, data: any, token?: string | null): Promise<T> {
        return this.request<T>(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data),
        }, token);
    }

    static delete<T>(endpoint: string, token?: string | null): Promise<T> {
        return this.request<T>(endpoint, { method: 'DELETE' }, token);
    }

}

function getToken() {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(BackendConfig.tokenKey);
}