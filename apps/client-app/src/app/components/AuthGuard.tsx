"use client"
import React from 'react';
import { useUser } from '../context/UserContext';
import { UserLoadingState } from './UserLoadingState';
import { UserErrorState } from './UserErrorState';

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  requireAuth?: boolean;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ 
  children, 
  fallback,
  requireAuth = true 
}) => {
  const { user, isLoading, error, refreshUser, clearError } = useUser();

  if (isLoading) {
    return <UserLoadingState message="Checking authentication..." />;
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

  if (requireAuth && !user) {
    if (fallback) {
      return <>{fallback}</>;
    }
    
    return (
      <div className="p-6">
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                Authentication Required
              </h3>
            </div>
          </div>
          <div className="text-sm text-yellow-700 dark:text-yellow-300 mb-4">
            You need to be logged in to access this page.
          </div>
          <div className="flex space-x-3">
            <a 
              href="/login" 
              className="bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700 transition-colors text-sm"
            >
              Go to Login
            </a>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
