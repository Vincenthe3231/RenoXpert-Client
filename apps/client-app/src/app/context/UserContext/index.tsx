"use client"
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthService, User } from '@/lib/auth/login.auth';

// Define the shape of the user context state
interface UserContextState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  login: (credentials: { email: string; password: string; remember?: boolean }) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  clearError: () => void;
}

// Create the context
export const UserContext = createContext<UserContextState | undefined>(undefined);

// Define the type for the children prop
interface UserProviderProps {
  children: ReactNode;
}

// Create the provider component
export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Computed values
  const isAuthenticated = !!user;

  // Initialize user state on mount
  useEffect(() => {
    const initializeUser = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Sync existing token from localStorage to cookie (for middleware access)
        AuthService.syncTokenToCookie();

        // Check if user is authenticated
        if (AuthService.isAuthenticated()) {
          // Get user from localStorage first (fast)
          const storedUser = AuthService.getUser();
          if (storedUser) {
            setUser(storedUser);
          } else {
            // If no stored user, try to get from API
            try {
              const currentUser = await AuthService.getCurrentUser();
              setUser(currentUser);
              // Store the user data for future use
              AuthService.setUser(currentUser);
            } catch (error) {
              console.error('Failed to get current user:', error);
              // Clear invalid auth data
              AuthService.clearAuth();
              setUser(null);
            }
          }
        }
      } catch (error) {
        console.error('Authentication initialization failed:', error);
        setError('Failed to initialize authentication');
        AuthService.clearAuth();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeUser();
  }, []);

  // Login function
  const login = async (credentials: { email: string; password: string; remember?: boolean }) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await AuthService.login(credentials);
      setUser(response.user);
      AuthService.setToken(response.token);
      AuthService.setUser(response.user);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      setIsLoading(true);
      setError(null);

      await AuthService.logout();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      // Clear local state even if server logout fails
      setUser(null);
    } finally {
      // Clear local state and remove localstorage/cookies
      AuthService.clearAuth();
      setIsLoading(false);
    }
  };

  // Refresh user data
  const refreshUser = async () => {
    try {
      setError(null);

      if (AuthService.isAuthenticated()) {
        const currentUser = await AuthService.getCurrentUser();
        setUser(currentUser);
        AuthService.setUser(currentUser);
      }
    } catch (error) {
      console.error('Failed to refresh user:', error);
      setError('Failed to refresh user data');
      // If refresh fails, clear auth and user
      AuthService.clearAuth();
      setUser(null);
    }
  };

  // Clear error function
  const clearError = () => {
    setError(null);
  };

  const value: UserContextState = {
    user,
    isLoading,
    isAuthenticated,
    error,
    login,
    logout,
    refreshUser,
    clearError,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

// Custom hook to use the user context
export const useUser = (): UserContextState => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};