# Environment Variables Setup for LarkSuite OAuth

## The Issue
You're seeing different environment variable status in server vs client because Next.js handles environment variables differently:

- **Server-side** (API routes, server components): Can access all environment variables
- **Client-side** (React components): Can only access variables prefixed with `NEXT_PUBLIC_`

## Solution: Update Your .env.local File

Add these variables to your `.env.local` file:

```env
# Server-side variables (for API routes)
LARK_APP_ID=your_actual_lark_app_id
LARK_APP_SECRET=your_actual_lark_app_secret
LARK_REDIRECT_URI=http://localhost:3000/api/auth/larksuite/callback

# Client-side variables (for React components)
NEXT_PUBLIC_LARK_APP_ID=your_actual_lark_app_id
NEXT_PUBLIC_LARK_REDIRECT_URI=http://localhost:3000/api/auth/larksuite/callback

# Optional
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_here
```

## Why Both Are Needed

1. **Server-side variables** (`LARK_APP_ID`, `LARK_APP_SECRET`):
   - Used in API routes (`/api/auth/larksuite/callback/route.ts`)
   - Used for token exchange (requires app secret)
   - Never exposed to browser

2. **Client-side variables** (`NEXT_PUBLIC_LARK_APP_ID`):
   - Used in React components
   - Used to build OAuth authorization URL
   - Safe to expose to browser (app ID is public)

## Security Notes

- ✅ **LARK_APP_ID** can be public (it's meant to be public)
- ❌ **LARK_APP_SECRET** must never be exposed to client-side
- ✅ **NEXT_PUBLIC_*** variables are safe for client-side use

## Testing the Setup

1. **Add the variables** to your `.env.local` file
2. **Restart your development server**: `npm run dev`
3. **Check the login page** - you should see:
   - Server console: All variables ✓ Set
   - Browser console: NEXT_PUBLIC_ variables ✓ Set
4. **Click LarkSuite button** - should redirect to LarkSuite OAuth

## Troubleshooting

### If you still see "Missing" in browser:
1. Make sure variables start with `NEXT_PUBLIC_`
2. Restart the development server
3. Check for typos in variable names
4. Ensure `.env.local` is in project root (same level as `package.json`)

### If OAuth redirect fails:
1. Verify `NEXT_PUBLIC_LARK_APP_ID` matches your LarkSuite app
2. Check that redirect URI in LarkSuite app matches `NEXT_PUBLIC_LARK_REDIRECT_URI`
3. Ensure LarkSuite app has required permissions

## Example .env.local File

```env
# LarkSuite OAuth Configuration
LARK_APP_ID=cli_1234567890abcdef
LARK_APP_SECRET=your_secret_here_never_share
LARK_REDIRECT_URI=http://localhost:3000/api/auth/larksuite/callback

# Client-side variables (same app ID, safe to expose)
NEXT_PUBLIC_LARK_APP_ID=cli_1234567890abcdef
NEXT_PUBLIC_LARK_REDIRECT_URI=http://localhost:3000/api/auth/larksuite/callback

# Optional NextAuth configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_random_secret_here
```

After updating your `.env.local` file, restart your server and the LarkSuite login should work!
