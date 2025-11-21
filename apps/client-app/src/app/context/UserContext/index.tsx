"use client"
import React, { createContext, useContext, ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AuthService } from '@/lib/auth/login.auth';
import { staffSchema } from '@/lib/schemas';
import z from 'zod';

// Define the shape of the user context state
interface UserContextState {
  user: z.infer<typeof staffSchema> | null;
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
  const queryClient = useQueryClient();

  // Fetch user data with React Query
  const {
    data: user = null,
    isLoading,
    error: queryError,
    refetch: refreshUser,
  } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      // Sync token to cookie first
      AuthService.syncTokenToCookie();

      // Check if authenticated
      if (!AuthService.isAuthenticated()) {
        return null;
      }

      // Try to get user from localStorage first (fast)
      const storedUser = AuthService.getUser();
      if (storedUser) {
        return storedUser;
      }

      // If no stored user, fetch from API
      try {
        const currentUser = await AuthService.getCurrentUser();
        AuthService.setUser(currentUser);
        return currentUser;
      } catch (error) {
        console.error('Failed to get current user:', error);
        AuthService.clearAuth();
        return null;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: { email: string; password: string; remember?: boolean }) => {
      const response = await AuthService.login(credentials);
      return response;
    },
    onSuccess: (response) => {
      AuthService.setToken(response.token);
      AuthService.setUser(response.user);
      // Update the user query cache
      queryClient.setQueryData(['currentUser'], response.user);
    },
    onError: (error) => {
      console.error('Login error:', error);
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      await AuthService.logout();
    },
    onSettled: () => {
      // Clear auth regardless of success/failure
      AuthService.clearAuth();
      // Clear the user query cache
      queryClient.setQueryData(['currentUser'], null);
      // Invalidate all queries to reset app state
      queryClient.invalidateQueries();
    },
  });

  // Wrapper functions to match original API
  const login = async (credentials: { email: string; password: string; remember?: boolean }) => {
    await loginMutation.mutateAsync(credentials);
  };

  const logout = async () => {
    await logoutMutation.mutateAsync();
  };

  const refreshUserWrapper = async () => {
    await refreshUser();
  };

  const clearError = () => {
    loginMutation.reset();
    logoutMutation.reset();
  };

  // Computed values
  const isAuthenticated = !!user;

  // Combine errors from query and mutations
  const error =
    queryError?.message ||
    loginMutation.error?.message ||
    logoutMutation.error?.message ||
    null;

  // Combined loading state
  const combinedIsLoading =
    isLoading ||
    loginMutation.isPending ||
    logoutMutation.isPending;

  const value: UserContextState = {
    user,
    isLoading: combinedIsLoading,
    isAuthenticated,
    error,
    login,
    logout,
    refreshUser: refreshUserWrapper,
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