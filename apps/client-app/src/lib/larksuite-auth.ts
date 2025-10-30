/**
 * LarkSuite OAuth Authentication Service
 * Handles OAuth 2.0 flow for LarkSuite integration
 */

export interface LarkSuiteUser {
  user_id: string;
  name: string;
  email: string;
  avatar_url?: string;
  tenant_key: string;
}

export interface LarkSuiteTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
}

export class LarkSuiteAuth {
  private readonly appId: string;
  private readonly appSecret: string;
  private readonly redirectUri: string;
  private readonly baseUrl = 'https://open.larksuite.com/open-apis';

  constructor() {
    // Server-side: Use regular env vars, Client-side: Use NEXT_PUBLIC_ prefixed vars
    const isServer = typeof window === 'undefined';
    
    if (isServer) {
      // Server-side environment variables
      this.appId = process.env.LARK_APP_ID || '';
      this.appSecret = process.env.LARK_APP_SECRET || '';
      this.redirectUri = process.env.LARK_REDIRECT_URI || 'http://localhost:3000/api/auth/larksuite/callback';
    } else {
      // Client-side environment variables (only NEXT_PUBLIC_ vars are available)
      this.appId = process.env.NEXT_PUBLIC_LARK_APP_ID || '';
      this.appSecret = ''; // Never expose secrets on client-side
      this.redirectUri = process.env.NEXT_PUBLIC_LARK_REDIRECT_URI || 'http://localhost:3000/api/auth/larksuite/callback';
    }
    
    // Debug information
    console.log('Environment variables check (isServer:', isServer, '):');
    console.log('LARK_APP_ID:', this.appId ? '✓ Set' : '✗ Missing');
    console.log('LARK_APP_SECRET:', this.appSecret ? '✓ Set' : '✗ Missing');
    console.log('LARK_REDIRECT_URI:', this.redirectUri ? '✓ Set' : '✗ Missing');
    console.log('NODE_ENV:', process.env.NODE_ENV);
    
    if (!this.appId) {
      throw new Error(`LarkSuite OAuth configuration is missing. LARK_APP_ID is required. Please check your .env.local file.`);
    }
    
    // Only check for secret on server-side
    if (isServer && !this.appSecret) {
      throw new Error(`LarkSuite OAuth configuration is missing. LARK_APP_SECRET is required on server-side. Please check your .env.local file.`);
    }
  }

  /**
   * Generate the authorization URL for LarkSuite OAuth
   */
  getAuthorizationUrl(state?: string): string {
    const params = new URLSearchParams({
      app_id: this.appId,
      redirect_uri: this.redirectUri,
      state: state || this.generateState(),
    });

    return `${this.baseUrl}/authen/v1/index?${params.toString()}`;
  }

  /**
   * Exchange authorization code for access token
   */
  async exchangeCodeForToken(code: string): Promise<LarkSuiteTokenResponse> {
    const response = await fetch(`${this.baseUrl}/authen/v1/access_token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        app_id: this.appId,
        app_secret: this.appSecret,
        grant_type: 'authorization_code',
        code: code,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to exchange code for token: ${error}`);
    }

    return response.json();
  }

  /**
   * Get user information using access token
   */
  async getUserInfo(accessToken: string): Promise<LarkSuiteUser> {
    const response = await fetch(`${this.baseUrl}/authen/v1/user_info`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to get user info: ${error}`);
    }

    const data = await response.json();
    return data.data;
  }

  /**
   * Generate a random state parameter for CSRF protection
   */
  private generateState(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }

  /**
   * Validate the state parameter
   */
  validateState(receivedState: string, expectedState: string): boolean {
    return receivedState === expectedState;
  }
}

// Export a singleton instance
export const larkSuiteAuth = new LarkSuiteAuth();
