/**
 * Laravel Backend Authentication Service
 * Handles authentication with Laravel backend API
 */

import BackendConfig from '../../config/backend';
import { staffSchema } from '../schemas';
import z from 'zod';

export interface User {
  id: number;
  uuid: string;
  name: string;
  email: string;
  email_verified_at?: string;
  profile?: StaffProfile;
  avatar_url?: string;
  avatar_big?: string;
  larksuite_open_id?: string;
  larksuite_union_id?: string;
  user_type?: string;
  user_status?: string;
  created_at: string;
  updated_at: string;
}

export interface StaffProfile {
  id: number;
  user_id: number;
  type: string;
  roles: string[];
  avatar_url: string;
  avatar_big: string;
  larksuite_open_id: string;
  larksuite_union_id: string;
  user_type: string;
}

export interface AuthResponse {
  token: string;
  user: z.infer<typeof staffSchema>;
  token_type: string;
  expires_in: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
  remember?: boolean;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export class Auth {
  private readonly baseUrl: string;
  private readonly frontendUrl: string;

  constructor() {
    if (!BackendConfig.baseUrl) {
      throw new Error('Laravel backend URL is not configured');
    }
    if (!BackendConfig.frontendUrl) {
      throw new Error('Frontend URL is not configured');
    }

    this.baseUrl = BackendConfig.baseUrl;
    this.frontendUrl = BackendConfig.frontendUrl;
  }

  /**
   * Login with email and password
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await fetch(`${this.baseUrl}${BackendConfig.endpoints.login}`, {
      method: 'POST',
      headers: BackendConfig.defaultHeaders,
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    }

    return response.json();
  }

  /**
   * Register a new user
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await fetch(`${this.baseUrl}${BackendConfig.endpoints.register}`, {
      method: 'POST',
      headers: BackendConfig.defaultHeaders,
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Registration failed');
    }

    return response.json();
  }

  /**
   * Logout the current user
   */
  async logout(): Promise<void> {
    const token = this.getToken();

    if (!token) {
      return;
    }

    try {
      await fetch(`${this.baseUrl}${BackendConfig.endpoints.logout}`, {
        method: 'POST',
        headers: {
          ...BackendConfig.defaultHeaders,
          'Authorization': `Bearer ${token}`,
        },
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.clearAuth();
    }
  }

  /**
   * Get current user information
   */
  async getCurrentUser(): Promise<z.infer<typeof staffSchema>> {
    const token = this.getToken();

    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${this.baseUrl}${BackendConfig.endpoints.user}`, {
      method: 'GET',
      headers: {
        ...BackendConfig.defaultHeaders,
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        this.clearAuth();
        throw new Error('Authentication expired');
      }
      throw new Error('Failed to get user information');
    }

    return response.json();
  }

  /**
   * Refresh the authentication token
   */
  async refreshToken(): Promise<AuthResponse> {
    const token = this.getToken();

    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${this.baseUrl}${BackendConfig.endpoints.refresh}`, {
      method: 'POST',
      headers: {
        ...BackendConfig.defaultHeaders,
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      this.clearAuth();
      throw new Error('Token refresh failed');
    }

    const data = await response.json();
    this.setToken(data.token);
    return data;
  }

  /**
   * Get LarkSuite OAuth URL
   */
  getLarkSuiteAuthUrl(): string {
    return `${this.baseUrl}${BackendConfig.endpoints.larkSuiteAuth}`;
  }

  /**
   * Handle OAuth callback
   */
  async handleOAuthCallback(provider: string, code: string, state?: string): Promise<AuthResponse> {
    const endpoint = BackendConfig.endpoints.larkSuiteCallback;

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: BackendConfig.defaultHeaders,
      body: JSON.stringify({ code, state }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'OAuth callback failed');
    }

    return response.json();
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  /**
   * Get stored authentication token
   */
  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(BackendConfig.tokenKey);
  }

  /**
   * Set authentication token
   * Stores token in both localStorage (for client-side access) and cookies (for middleware)
   */
  setToken(token: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(BackendConfig.tokenKey, token);
    // Also set cookie for middleware access (matches middleware.ts expectation)
    this.setTokenCookie(token);
  }

  /**
   * Set token cookie (internal helper)
   */
  private setTokenCookie(token: string): void {
    if (typeof document === 'undefined') return;
    // Set cookie with 7 days expiration (adjust as needed)
    const expires = new Date();
    expires.setTime(expires.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days
    document.cookie = `auth-token=${token}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
  }

  /**
   * Sync existing token from localStorage to cookie (useful on page load)
   */
  syncTokenToCookie(): void {
    if (typeof window === 'undefined') return;
    const token = this.getToken();
    if (token) {
      this.setTokenCookie(token);
    }
  }

  /**
   * Get stored user data
   */
  getUser(): z.infer<typeof staffSchema> | null {
    if (typeof window === 'undefined') return null;
    const userStr = localStorage.getItem(BackendConfig.userKey);
    return userStr ? JSON.parse(userStr) : null;
  }

  /**
   * Set user data
   */
  setUser(user: z.infer<typeof staffSchema>): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(BackendConfig.userKey, JSON.stringify(user));
  }

  /**
   * Clear all authentication data
   */
  clearAuth(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(BackendConfig.tokenKey);
    localStorage.removeItem(BackendConfig.userKey);
    // Also clear the cookie
    if (typeof document !== 'undefined') {
      document.cookie = 'auth-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    }
  }

  /**
   * Get authorization header for API requests
   */
  getAuthHeader(): { Authorization: string } | {} {
    const token = this.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }
}

// Export a singleton instance
export const AuthService = new Auth();

