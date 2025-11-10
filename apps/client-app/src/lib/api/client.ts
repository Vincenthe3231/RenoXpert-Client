import BackendConfig from "@/config/backend";
import { keysToCamel, keysToSnake } from "../transform";

const BASE_URL = process.env.BACKEND_API_URL || 'http://localhost:8000';

export class ApiClient {
    private static baseUrl = BASE_URL;
    private static token = getToken();

    static async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<T> {
        const url = `${this.baseUrl}${endpoint}`;

        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.token}`,
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

        const response = await fetch(url, {
            ...options,
            headers,
            body,
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Transform response to camelCase
        return keysToCamel<T>(data);

    }

    static get<T>(endpoint: string): Promise<T> {
        return this.request<T>(endpoint, { method: 'GET' });
    }

    static post<T>(endpoint: string, data: any): Promise<T> {
        return this.request<T>(endpoint, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    static put<T>(endpoint: string, data: any): Promise<T> {
        return this.request<T>(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    static delete<T>(endpoint: string): Promise<T> {
        return this.request<T>(endpoint, { method: 'DELETE' });
    }

}

function getToken() {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(BackendConfig.tokenKey);
}