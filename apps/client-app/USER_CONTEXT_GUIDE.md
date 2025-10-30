# User Context Management Guide

This guide explains how to use the new centralized user context system for authentication and user management.

## Overview

The new user context system provides:
- **Global state management** for user authentication
- **Automatic token management** with localStorage persistence
- **Loading and error states** handled centrally
- **Easy-to-use hooks** for accessing user data
- **Authentication guards** for protected routes

## Components

### 1. UserContext (`/app/context/UserContext/index.tsx`)

The main context provider that manages:
- User authentication state
- Loading states
- Error handling
- Login/logout functionality
- Token management

### 2. useUser Hook

A custom hook that provides access to user context:

```tsx
import { useUser } from '../context/UserContext';

const MyComponent = () => {
  const { 
    user,           // Current user data
    isLoading,      // Loading state
    isAuthenticated, // Boolean auth status
    error,          // Error message
    login,          // Login function
    logout,         // Logout function
    refreshUser,    // Refresh user data
    clearError      // Clear error state
  } = useUser();

  // Your component logic
};
```

### 3. UserLoadingState Component

A reusable loading component for user-related operations:

```tsx
import { UserLoadingState } from '../components/UserLoadingState';

// Usage
<UserLoadingState message="Loading user data..." />
```

### 4. UserErrorState Component

A reusable error component with retry functionality:

```tsx
import { UserErrorState } from '../components/UserErrorState';

// Usage
<UserErrorState 
  error={error} 
  onRetry={refreshUser}
  onClearError={clearError}
/>
```

### 5. AuthGuard Component

A component that protects routes and shows appropriate messages:

```tsx
import { AuthGuard } from '../components/AuthGuard';

// Usage
<AuthGuard requireAuth={true}>
  <ProtectedContent />
</AuthGuard>
```

### 6. UserProfile Component

A ready-to-use user profile display component:

```tsx
import { UserProfile } from '../components/UserProfile';

// Usage
<UserProfile />
```

## Usage Examples

### Basic Dashboard Component

```tsx
"use client"
import React from "react";
import { useUser } from "../context/UserContext";
import { UserLoadingState } from "../components/UserLoadingState";
import { UserErrorState } from "../components/UserErrorState";

const Dashboard = () => {
  const { user, isLoading, error, logout, refreshUser, clearError } = useUser();

  if (isLoading) {
    return <UserLoadingState message="Loading dashboard..." />;
  }

  if (error) {
    return (
      <UserErrorState 
        error={error} 
        onRetry={refreshUser}
        onClearError={clearError}
      />
    );
  }

  return (
    <div>
      <h1>Welcome, {user?.name}!</h1>
      <button onClick={logout}>Logout</button>
    </div>
  );
};
```

### Protected Route Component

```tsx
"use client"
import React from "react";
import { AuthGuard } from "../components/AuthGuard";

const ProtectedPage = () => {
  return (
    <AuthGuard requireAuth={true}>
      <div>
        <h1>This is a protected page</h1>
        <p>Only authenticated users can see this content.</p>
      </div>
    </AuthGuard>
  );
};
```

### Login Component

```tsx
"use client"
import React, { useState } from "react";
import { useUser } from "../context/UserContext";

const LoginForm = () => {
  const { login, isLoading, error } = useUser();
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(credentials);
      // Redirect or update UI
    } catch (error) {
      // Error is handled by the context
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="error">{error}</div>}
      <input
        type="email"
        value={credentials.email}
        onChange={(e) => setCredentials({...credentials, email: e.target.value})}
        placeholder="Email"
      />
      <input
        type="password"
        value={credentials.password}
        onChange={(e) => setCredentials({...credentials, password: e.target.value})}
        placeholder="Password"
      />
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
};
```

## Benefits of the New System

### 1. **Centralized State Management**
- Single source of truth for user data
- No more duplicate authentication logic
- Consistent state across all components

### 2. **Automatic Persistence**
- User data and tokens are automatically stored in localStorage
- Authentication state persists across browser sessions
- Automatic token refresh handling

### 3. **Better Error Handling**
- Centralized error management
- Consistent error UI across the app
- Retry mechanisms for failed operations

### 4. **Loading States**
- Consistent loading indicators
- No more manual loading state management
- Better user experience

### 5. **Type Safety**
- Full TypeScript support
- IntelliSense for all context properties
- Compile-time error checking

### 6. **Reusable Components**
- Pre-built components for common patterns
- Consistent UI across the application
- Easy to customize and extend

## Migration from Old System

### Before (Old System)
```tsx
const DashboardContent = () => {
  const [user, setUser] = useState<LaravelUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      // Manual authentication logic
      // Manual loading state management
      // Manual error handling
    };
    checkAuth();
  }, []);

  // Manual loading UI
  // Manual error handling
  // Manual logout logic
};
```

### After (New System)
```tsx
const DashboardContent = () => {
  const { user, isLoading, error, logout } = useUser();

  if (isLoading) return <UserLoadingState />;
  if (error) return <UserErrorState error={error} />;

  // Clean, simple component logic
};
```

## Best Practices

1. **Always use the useUser hook** instead of direct LaravelAuth calls
2. **Use AuthGuard for protected routes** instead of manual checks
3. **Use provided loading and error components** for consistency
4. **Handle errors gracefully** with the provided error components
5. **Don't manage user state locally** - use the global context

## Troubleshooting

### Common Issues

1. **"useUser must be used within a UserProvider"**
   - Make sure UserProvider is wrapped around your app in layout.tsx

2. **User data not persisting**
   - Check if localStorage is available in your environment
   - Verify LaravelAuth configuration

3. **Authentication not working**
   - Check Laravel backend configuration
   - Verify API endpoints are correct
   - Check network requests in browser dev tools

### Debug Tips

1. Check the browser console for error messages
2. Use React DevTools to inspect context state
3. Check localStorage for stored tokens and user data
4. Verify network requests in the Network tab
