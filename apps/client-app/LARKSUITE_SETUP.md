# LarkSuite OAuth Integration Setup

This guide will help you set up LarkSuite OAuth authentication in your Next.js application.

## Prerequisites

1. A LarkSuite developer account
2. A LarkSuite application created on the Lark Open Platform

## Setup Steps

### 1. Create a LarkSuite Application

1. Visit the [Lark Open Platform](https://open.larksuite.com/app)
2. Create a new application
3. Note down your **App ID** and **App Secret**

### 2. Configure Environment Variables

Create a `.env.local` file in your project root with the following variables:

```env
# LarkSuite OAuth Configuration
LARK_APP_ID=your_lark_app_id_here
LARK_APP_SECRET=your_lark_app_secret_here
LARK_REDIRECT_URI=http://localhost:3000/api/auth/larksuite/callback
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_here
```

### 3. Configure LarkSuite Application Settings

1. In your LarkSuite application settings, set the **Redirect URI** to:
   ```
   http://localhost:3000/api/auth/larksuite/callback
   ```
2. For production, update the redirect URI to your production domain:
   ```
   https://yourdomain.com/api/auth/larksuite/callback
   ```

### 4. Required Permissions

Make sure your LarkSuite application has the following permissions:
- `authen:user_info` - To get user information
- `authen:user_id` - To get user ID

## How It Works

1. **User clicks "LarkSuite" button** on the login page
2. **Redirect to LarkSuite OAuth** - User is redirected to LarkSuite's authorization page
3. **User authorizes the application** - User grants permissions to your app
4. **OAuth callback** - LarkSuite redirects back to your app with an authorization code
5. **Token exchange** - Your app exchanges the code for an access token
6. **User info retrieval** - Your app fetches user information using the access token
7. **Dashboard redirect** - User is redirected to the dashboard with their information

## File Structure

```
src/
├── lib/
│   └── larksuite-auth.ts          # LarkSuite OAuth service
├── app/
│   ├── api/auth/larksuite/callback/
│   │   └── route.ts               # OAuth callback handler
│   ├── login/authforms/
│   │   └── SocialButtons.tsx      # Updated login button
│   └── (DashboardLayout)/
│       └── page.tsx               # Dashboard with user info
└── public/images/svgs/
    └── larksuite-icon.svg         # LarkSuite icon
```

## Security Considerations

⚠️ **Important Security Notes:**

1. **Never expose your App Secret** in client-side code
2. **Use HTTPS in production** for OAuth redirects
3. **Implement proper session management** (consider using NextAuth.js)
4. **Store access tokens securely** (database, encrypted cookies)
5. **Implement token refresh logic** for long-lived sessions
6. **Validate state parameters** to prevent CSRF attacks

## Production Deployment

1. Update environment variables for production
2. Update redirect URI in LarkSuite application settings
3. Use a proper session management solution
4. Implement proper error handling and logging
5. Add rate limiting and security headers

## Testing

1. Start your development server: `npm run dev`
2. Navigate to `/login`
3. Click the "LarkSuite" button
4. Complete the OAuth flow
5. Verify user information is displayed on the dashboard

## Troubleshooting

### Common Issues:

1. **"Invalid redirect URI"** - Check that the redirect URI in your LarkSuite app matches exactly
2. **"Invalid app_id"** - Verify your App ID is correct in environment variables
3. **"Invalid app_secret"** - Verify your App Secret is correct in environment variables
4. **CORS errors** - Ensure your domain is whitelisted in LarkSuite app settings

### Debug Steps:

1. Check browser console for errors
2. Verify environment variables are loaded
3. Check LarkSuite application settings
4. Test OAuth flow step by step

## Next Steps

For a production-ready implementation, consider:

1. **Session Management**: Implement proper user sessions
2. **Database Integration**: Store user data and tokens
3. **Error Handling**: Add comprehensive error handling
4. **Logging**: Implement proper logging for debugging
5. **Security**: Add CSRF protection and rate limiting
6. **Testing**: Add unit and integration tests
