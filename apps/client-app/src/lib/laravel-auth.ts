/**
 * Laravel Backend Authentication Service
 * Handles authentication with Laravel backend API
 */

import LaravelConfig from '../config/laravel';

export interface LaravelUser {
  id: number;
  name: string;
  email: string;
  email_verified_at?: string;
  larksuite_open_id?: string;
  larksuite_union_id?: string;
  created_at: string;
  updated_at: string;
}

export interface LaravelAuthResponse {
  token: string;
  user: LaravelUser;
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

export class LaravelAuth {
  private readonly baseUrl: string;
  private readonly frontendUrl: string;

  constructor() {
    this.baseUrl = LaravelConfig.baseUrl;
    this.frontendUrl = LaravelConfig.frontendUrl;
  }

  /**
   * Login with email and password
   */
  async login(credentials: LoginCredentials): Promise<LaravelAuthResponse> {
    const response = await fetch(`${this.baseUrl}${LaravelConfig.endpoints.login}`, {
      method: 'POST',
      headers: LaravelConfig.defaultHeaders,
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
  async register(data: RegisterData): Promise<LaravelAuthResponse> {
    const response = await fetch(`${this.baseUrl}${LaravelConfig.endpoints.register}`, {
      method: 'POST',
      headers: LaravelConfig.defaultHeaders,
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
      await fetch(`${this.baseUrl}${LaravelConfig.endpoints.logout}`, {
        method: 'POST',
        headers: {
          ...LaravelConfig.defaultHeaders,
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
  async getCurrentUser(): Promise<LaravelUser> {
    const token = this.getToken();
    
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${this.baseUrl}${LaravelConfig.endpoints.user}`, {
      method: 'GET',
      headers: {
        ...LaravelConfig.defaultHeaders,
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
  async refreshToken(): Promise<LaravelAuthResponse> {
    const token = this.getToken();
    
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${this.baseUrl}${LaravelConfig.endpoints.refresh}`, {
      method: 'POST',
      headers: {
        ...LaravelConfig.defaultHeaders,
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
    return `${this.baseUrl}${LaravelConfig.endpoints.larkSuiteAuth}`;
  }

  /**
   * Handle OAuth callback
   */
  async handleOAuthCallback(provider: string, code: string, state?: string): Promise<LaravelAuthResponse> {
    const endpoint = LaravelConfig.endpoints.larkSuiteCallback;
      
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: LaravelConfig.defaultHeaders,
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
    return localStorage.getItem(LaravelConfig.tokenKey);
  }

  /**
   * Set authentication token
   */
  setToken(token: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(LaravelConfig.tokenKey, token);
  }

  /**
   * Get stored user data
   */
  getUser(): LaravelUser | null {
    if (typeof window === 'undefined') return null;
    const userStr = localStorage.getItem(LaravelConfig.userKey);
    return userStr ? JSON.parse(userStr) : null;
  }

  /**
   * Set user data
   */
  setUser(user: LaravelUser): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(LaravelConfig.userKey, JSON.stringify(user));
  }

  /**
   * Clear all authentication data
   */
  clearAuth(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(LaravelConfig.tokenKey);
    localStorage.removeItem(LaravelConfig.userKey);
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
export const laravelAuth = new LaravelAuth();
