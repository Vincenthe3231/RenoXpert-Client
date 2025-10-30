/**
 * Laravel Backend Configuration
 * Centralized configuration for Laravel API endpoints and settings
 */

export const LaravelConfig = {
  // Backend URL - should be set in environment variables
  baseUrl: process.env.NEXT_PUBLIC_LARAVEL_BACKEND_URL || 'http://local-api.renoxpert.test',

  // Frontend URL - for OAuth redirects
  frontendUrl: process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://local-api.renoxpert.test',

  // API endpoints
  endpoints: {
    // Authentication endpoints
    login: '/api/login',
    register: '/api/register',
    logout: '/api/logout',
    refresh: '/api/refresh',
    user: '/api/user',
    forgotPassword: '/api/forgot-password',
    resetPassword: '/api/reset-password',

    // OAuth endpoints
    larkSuiteAuth: '/auth/larksuite',
    larkSuiteCallback: '/api/auth/larksuite/callback',

    // Profile endpoints
    updateProfile: '/api/profile',
    changePassword: '/api/change-password',
    uploadAvatar: '/api/upload-avatar',
  },

  // Request configuration
  defaultHeaders: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },

  // Token configuration
  tokenKey: 'auth_token',
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

export default LaravelConfig;
