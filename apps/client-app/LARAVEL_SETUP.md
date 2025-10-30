# Laravel Backend Setup for RenoXpert Client

This document provides instructions for setting up the Laravel backend to work with the Next.js frontend using LarkSuite OAuth.

## Prerequisites

- PHP 8.1 or higher
- Composer
- Laravel 10.x or higher
- MySQL/PostgreSQL database
- Node.js and npm (for frontend)
- LarkSuite Developer Account

## Laravel Backend Setup

### 1. Create Laravel Project

```bash
composer create-project laravel/laravel renoxpert-backend
cd renoxpert-backend
```

### 2. Install Required Packages

```bash
# Laravel Sanctum for API authentication
composer require laravel/sanctum

# CORS support
composer require fruitcake/laravel-cors

# HTTP Client for LarkSuite API calls
composer require guzzlehttp/guzzle
```

### 3. Configure Environment Variables

Create `.env` file and configure:

```env
APP_NAME=RenoXpert
APP_ENV=local
APP_KEY=base64:your-app-key
APP_DEBUG=true
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=renoxpert
DB_USERNAME=root
DB_PASSWORD=

# Sanctum Configuration
SANCTUM_STATEFUL_DOMAINS=localhost:3000
SESSION_DRIVER=database
SESSION_LIFETIME=120

# LarkSuite OAuth Configuration
LARK_APP_ID=your-larksuite-app-id
LARK_APP_SECRET=your-larksuite-app-secret
LARK_REDIRECT_URI=http://localhost:8000/auth/larksuite/callback

# Frontend URL for OAuth redirects
FRONTEND_URL=http://localhost:3000
```

### 4. Create Migration for User Model

First, create a migration to add the LarkSuite open_id field to the users table:

```bash
php artisan make:migration add_larksuite_fields_to_users_table --table=users
```

Then update the migration file:

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('larksuite_open_id')->nullable()->unique();
            $table->string('larksuite_union_id')->nullable();
            $table->string('larksuite_tenant_key')->nullable();
        });
    }

    public function down()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['larksuite_open_id', 'larksuite_union_id', 'larksuite_tenant_key']);
        });
    }
};
```

### 5. Run Migrations

```bash
php artisan migrate
```

### 6. Update User Model

Update your `app/Models/User.php` to include the LarkSuite fields:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'larksuite_open_id',
        'larksuite_union_id',
        'larksuite_tenant_key',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];
}
```

### 7. Publish Sanctum Configuration

```bash
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"
```

## Database Schema

The users table will now include the following LarkSuite fields:

- `larksuite_open_id` (string, nullable, unique) - LarkSuite user's unique identifier
- `larksuite_union_id` (string, nullable) - LarkSuite union ID for cross-tenant users
- `larksuite_tenant_key` (string, nullable) - LarkSuite tenant identifier

These fields allow you to:
- Link Laravel users with LarkSuite users
- Support multi-tenant LarkSuite environments
- Track user relationships across different LarkSuite tenants

## API Routes Setup

### 1. Authentication Routes

Add to `routes/api.php`:

```php
<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\LarkSuiteAuthController;

// Public routes
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/reset-password', [AuthController::class, 'resetPassword']);

// OAuth routes
Route::get('/auth/larksuite', [LarkSuiteAuthController::class, 'redirectToLarkSuite']);
Route::get('/auth/larksuite/callback', [LarkSuiteAuthController::class, 'handleLarkSuiteCallback']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/refresh', [AuthController::class, 'refresh']);
    Route::put('/profile', [AuthController::class, 'updateProfile']);
    Route::post('/change-password', [AuthController::class, 'changePassword']);
});
```

### 2. Create Controllers

#### AuthController

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use App\Models\User;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required|string|min:6',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => $validator->errors()->first()], 422);
        }

        if (!Auth::attempt($request->only('email', 'password'))) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        $user = Auth::user();
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => $user,
            'token_type' => 'Bearer',
            'expires_in' => 3600
        ]);
    }

    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => $validator->errors()->first()], 422);
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => $user,
            'token_type' => 'Bearer',
            'expires_in' => 3600
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logged out successfully']);
    }

    public function user(Request $request)
    {
        return $request->user();
    }

    public function refresh(Request $request)
    {
        $user = $request->user();
        $user->tokens()->delete();
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => $user,
            'token_type' => 'Bearer',
            'expires_in' => 3600
        ]);
    }
}
```

#### LarkSuiteAuthController

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Auth;

class LarkSuiteAuthController extends Controller
{
    public function redirectToLarkSuite()
    {
        $appId = env('LARK_APP_ID');
        $redirectUri = env('LARK_REDIRECT_URI');
        $state = bin2hex(random_bytes(16));

        // Store state in session for validation
        session(['lark_oauth_state' => $state]);

        $authUrl = "https://open.larksuite.com/open-apis/authen/v1/index?" . http_build_query([
            'app_id' => $appId,
            'redirect_uri' => $redirectUri,
            'state' => $state
        ]);

        return redirect($authUrl);
    }

    public function handleLarkSuiteCallback(Request $request)
    {
        try {
            $code = $request->get('code');
            $error = $request->get('error');

            if ($error) {
                // Redirect to frontend with error
                $frontendUrl = env('FRONTEND_URL', 'http://localhost:3000');
                return redirect($frontendUrl . '/auth/larksuite/callback?error=' . urlencode($error));
            }

            if (!$code) {
                // Redirect to frontend with error
                $frontendUrl = env('FRONTEND_URL', 'http://localhost:3000');
                return redirect($frontendUrl . '/auth/larksuite/callback?error=no_code');
            }

            // Handle state validation - LarkSuite may not return state parameter
            $receivedState = $request->get('state');
            $sessionState = session('lark_oauth_state');
            
            // Log for debugging
            \Log::info('LarkSuite OAuth State Check', [
                'received_state' => $receivedState,
                'session_state' => $sessionState,
                'session_id' => session()->getId()
            ]);
            
            // For development, skip state validation if missing
            if (env('LARK_SKIP_STATE_VALIDATION', false) === true) {
                \Log::info('LarkSuite OAuth: Skipping state validation (development mode)');
            } else {
                // Check if we have state to validate
                if (!$receivedState && !$sessionState) {
                    $frontendUrl = env('FRONTEND_URL', 'http://localhost:3000');
                    return redirect($frontendUrl . '/auth/larksuite/callback?error=missing_state');
                }
                
                // If we have both states, validate them
                if ($receivedState && $sessionState && $receivedState !== $sessionState) {
                    $frontendUrl = env('FRONTEND_URL', 'http://localhost:3000');
                    return redirect($frontendUrl . '/auth/larksuite/callback?error=invalid_state');
                }
            }

            // Exchange code for access token
            $tokenResponse = Http::post('https://open.larksuite.com/open-apis/authen/v1/access_token', [
                'app_id' => env('LARK_APP_ID'),
                'app_secret' => env('LARK_APP_SECRET'),
                'grant_type' => 'authorization_code',
                'code' => $code
            ]);

            if (!$tokenResponse->successful()) {
                $frontendUrl = env('FRONTEND_URL', 'http://localhost:3000');
                return redirect($frontendUrl . '/auth/larksuite/callback?error=token_exchange_failed');
            }

            $tokenData = $tokenResponse->json();
            $accessToken = $tokenData['data']['access_token'];

            // Get user info from LarkSuite
            $userResponse = Http::withHeaders([
                'Authorization' => 'Bearer ' . $accessToken
            ])->get('https://open.larksuite.com/open-apis/authen/v1/user_info');

            if (!$userResponse->successful()) {
                $frontendUrl = env('FRONTEND_URL', 'http://localhost:3000');
                return redirect($frontendUrl . '/auth/larksuite/callback?error=user_info_failed');
            }

            $larkUser = $userResponse->json()['data'];

            // Find user by LarkSuite open_id first, then by email
            $user = User::where('larksuite_open_id', $larkUser['open_id'])->first();

            if (!$user) {
                $user = User::where('email', $larkUser['email'])->first();
            }

            if (!$user) {
                // Create new user with LarkSuite data
                $user = User::create([
                    'name' => $larkUser['name'],
                    'email' => $larkUser['email'],
                    'type' => 'staff',
                    'password' => bcrypt('larksuite_oauth_user'),
                    'larksuite_open_id' => $larkUser['open_id'],
                    'larksuite_union_id' => $larkUser['union_id'] ?? null,
                ]);
            } else {
                // Update existing user with LarkSuite data
                $user->update([
                    'larksuite_open_id' => $larkUser['open_id'],
                    'larksuite_union_id' => $larkUser['union_id'] ?? $user->larksuite_union_id,
                ]);
            }

            $token = $user->createToken('auth_token')->plainTextToken;

            // Redirect to frontend with success parameters
            $frontendUrl = env('FRONTEND_URL', 'http://localhost:3000');
            $redirectUrl = $frontendUrl . '/auth/larksuite/callback?' . http_build_query([
                'success' => 'true',
                'token' => $token,
                'user' => json_encode($user),
                'state' => $receivedState ?: $sessionState
            ]);

            return redirect($redirectUrl);
        } catch (\Exception $e) {
            $frontendUrl = env('FRONTEND_URL', 'http://localhost:3000');
            return redirect($frontendUrl . '/auth/larksuite/callback?error=' . urlencode($e->getMessage()));
        }
    }
}
```

## Frontend Configuration

### 1. Environment Variables

Create `.env.local` in your Next.js project:

```env
NEXT_PUBLIC_LARAVEL_BACKEND_URL=http://localhost:8000
NEXT_PUBLIC_FRONTEND_URL=http://localhost:3000
NEXT_PUBLIC_LARK_APP_ID=your-larksuite-app-id
```

### 2. Update CORS Configuration

In Laravel, update `config/cors.php`:

```php
'allowed_origins' => ['http://localhost:3000'],
'allowed_origins_patterns' => [],
'allowed_headers' => ['*'],
'allowed_methods' => ['*'],
'exposed_headers' => [],
'max_age' => 0,
'supports_credentials' => true,
```

## Running the Application

### 1. Start Laravel Backend

```bash
cd renoxpert-backend
php artisan serve
```

### 2. Start Next.js Frontend

```bash
cd apps/client-app
npm run dev
```

## Testing the Integration

1. Visit `http://localhost:3000/login`
2. Try logging in with email/password
3. Try OAuth login with LarkSuite
4. Check that authentication tokens are stored correctly
5. Verify that protected routes work with the token

## Troubleshooting

### Common Issues

1. **CORS Errors**: Make sure CORS is properly configured in Laravel
2. **Token Issues**: Check that Sanctum is properly configured
3. **LarkSuite OAuth Errors**: Verify LarkSuite credentials in Laravel `.env`
4. **Database Issues**: Run migrations and check database connection
5. **LarkSuite API Issues**: Check LarkSuite app configuration and permissions

### Debug Steps

1. Check Laravel logs: `storage/logs/laravel.log`
2. Check browser console for JavaScript errors
3. Verify API endpoints are accessible
4. Test LarkSuite OAuth redirects manually
5. Verify LarkSuite app configuration in developer console

## Fixing "Missing State" Error

The "missing_state" error occurs when LarkSuite doesn't return the state parameter. This is common with LarkSuite OAuth. Here are the solutions:

### Quick Fix: Skip State Validation (Recommended for Development)

Add this to your Laravel `.env` file:

```env
LARK_SKIP_STATE_VALIDATION=true
```

This will skip state validation entirely for development. The updated controller code above will handle this automatically.

### Alternative: Check LarkSuite App Configuration

1. **Verify Redirect URI** in LarkSuite Developer Console:
   - Make sure it's exactly: `http://localhost:8000/auth/larksuite/callback`
   - No trailing slashes or extra parameters

2. **Check App Permissions**:
   - Ensure your LarkSuite app has the correct permissions
   - User information access should be enabled

3. **Test with Different Browser**:
   - Try incognito/private browsing mode
   - Clear browser cookies and cache

## Fixing "Invalid State" Error

The "invalid_state" error is the most common OAuth issue. Here are several solutions:

### Solution 1: Enable State Validation Skip (Development Only)

Add this to your Laravel `.env` file:

```env
LARK_SKIP_STATE_VALIDATION=true
```

Then update the LarkSuiteAuthController to skip state validation in development:

```php
// In handleLarkSuiteCallback method, replace the state validation with:
if (env('LARK_SKIP_STATE_VALIDATION', false) !== true) {
    if ($state !== session('lark_oauth_state')) {
        $frontendUrl = env('FRONTEND_URL', 'http://localhost:3000');
        return redirect($frontendUrl . '/auth/larksuite/callback?error=invalid_state');
    }
}
```

### Solution 2: Fix Session Configuration

Make sure your Laravel session is properly configured in `config/session.php`:

```php
'driver' => env('SESSION_DRIVER', 'database'),
'lifetime' => env('SESSION_LIFETIME', 120),
'secure' => env('SESSION_SECURE_COOKIE', false),
'http_only' => true,
'same_site' => 'lax',
```

### Solution 3: Use Database Sessions

Ensure you're using database sessions. Run these commands:

```bash
# Create sessions table
php artisan session:table

# Run migration
php artisan migrate

# Update .env
SESSION_DRIVER=database
```

### Solution 4: Debug State Values

Add debugging to your LarkSuiteAuthController:

```php
public function handleLarkSuiteCallback(Request $request)
{
    try {
        $code = $request->get('code');
        $state = $request->get('state');
        $error = $request->get('error');
        
        // Debug logging
        \Log::info('LarkSuite OAuth Callback', [
            'received_state' => $state,
            'session_state' => session('lark_oauth_state'),
            'session_id' => session()->getId(),
            'all_session' => session()->all()
        ]);
        
        // Rest of your code...
    } catch (\Exception $e) {
        \Log::error('LarkSuite OAuth Error', ['error' => $e->getMessage()]);
        // Handle error...
    }
}
```

### Solution 5: Alternative State Storage

If sessions aren't working, use a temporary database table:

```bash
php artisan make:migration create_oauth_states_table
```

Migration:

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('oauth_states', function (Blueprint $table) {
            $table->id();
            $table->string('state')->unique();
            $table->timestamp('expires_at');
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('oauth_states');
    }
};
```

Then update your controller to use the database for state storage:

```php
// In redirectToLarkSuite method:
$state = bin2hex(random_bytes(16));
DB::table('oauth_states')->insert([
    'state' => $state,
    'expires_at' => now()->addMinutes(10)
]);

// In handleLarkSuiteCallback method:
$stateRecord = DB::table('oauth_states')
    ->where('state', $state)
    ->where('expires_at', '>', now())
    ->first();

if (!$stateRecord) {
    $frontendUrl = env('FRONTEND_URL', 'http://localhost:3000');
    return redirect($frontendUrl . '/auth/larksuite/callback?error=invalid_state');
}

// Clean up used state
DB::table('oauth_states')->where('state', $state)->delete();
```
