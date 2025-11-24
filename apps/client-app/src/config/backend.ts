/**
 * Laravel Backend Configuration
 * Centralized configuration for Laravel API endpoints and settings
 */

export const BackendConfig = {
  // Backend URL - Client-side (exposed to browser)
  baseUrl:
    process.env.LARAVEL_BACKEND_URL ??
    process.env.NEXT_PUBLIC_LARAVEL_BACKEND_URL ??
    '',

  // // Backend URL - Server-side only (Next.js server can access)
  // serverBaseUrl: process.env.LARAVEL_BACKEND_URL,

  // Frontend URL - for OAuth redirects
  frontendUrl: process.env.NEXT_PUBLIC_FRONTEND_URL,

  // API endpoints
  endpoints: {
    users: '/api/v1/users',
    staff: '/api/v1/staff',
    owners: '/api/v1/owners',
    onboarding: '/api/v1/onboarding',
    // Authentication endpoints
    login: '/api/v1/login',
    register: '/api/v1/register',
    logout: '/api/v1/logout',
    refresh: '/api/v1/refresh',
    user: '/api/v1/user',
    forgotPassword: '/api/v1/forgot-password',
    resetPassword: '/api/v1/reset-password',

    // OAuth endpoints
    larkSuiteAuth: '/api/v1/auth/lark/redirect',
    larkSuiteCallback: '/api/v1/auth/lark/callback',

    // Profile endpoints
    updateProfile: '/api/v1/profile',
    changePassword: '/api/v1/change-password',
    uploadAvatar: '/api/v1/upload-avatar',
  },

  // Request configuration
  defaultHeaders: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },

  // Token configuration
  tokenKey: 'auth-token',
  userKey: 'user',

  // OAuth configuration
  oauth: {
    larkSuite: {
      appId: process.env.NEXT_PUBLIC_LARK_APP_ID,
      redirectUri: `${process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000'}/auth/larksuite/callback`,
    },
  },

  // Application settings
  app: {
    name: process.env.NEXT_PUBLIC_APP_NAME || 'RenoXpert',
    environment: process.env.NEXT_PUBLIC_APP_ENV || 'local',
  },
} as const;

export default BackendConfig;
