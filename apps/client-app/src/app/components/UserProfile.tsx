"use client"
import React from 'react';
import { useUser } from '../context/UserContext';

export const UserProfile: React.FC = () => {
  const { user, isAuthenticated, isLoading, error } = useUser();

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-2"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-600 dark:text-red-400 text-sm">
        Authentication error
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="text-gray-600 dark:text-gray-400 text-sm">
        Not authenticated
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-3">
      <div className="flex-shrink-0">
        <div className="h-8 w-8 bg-blue-500 rounded-full flex items-center justify-center">
          <span className="text-white text-sm font-medium">
            {user.name.charAt(0).toUpperCase()}
          </span>
        </div>
      </div>
      <div className="min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
          {user.name}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
          {user.email}
        </p>
      </div>
    </div>
  );
};
