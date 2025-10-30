"use client"
import React, { useState, useEffect } from 'react';
import { useTheme } from '../../hooks/use-theme';

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ 
  className = '', 
  showLabel = true, 
  size = 'md' 
}) => {
  const { activeMode, toggleTheme } = useTheme();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  return (
    <button
      onClick={toggleTheme}
      className={`
        flex items-center justify-center rounded-md border border-ld 
        bg-white dark:bg-dark hover:bg-lightprimary dark:hover:bg-lightprimary 
        text-dark dark:text-white hover:text-primary dark:hover:text-primary
        transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary
        ${sizeClasses[size]} ${className}
      `}
      aria-label={`Switch to ${isMounted && activeMode === 'light' ? 'dark' : 'light'} mode`}
      title={`Switch to ${isMounted && activeMode === 'light' ? 'dark' : 'light'} mode`}
    >
      {isMounted && activeMode === 'light' ? (
        // Moon icon for dark mode
        <svg 
          className={iconSizes[size]} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" 
          />
        </svg>
      ) : isMounted && activeMode === 'dark' ? (
        // Sun icon for light mode
        <svg 
          className={iconSizes[size]} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" 
          />
        </svg>
      ) : (
        // Fallback during hydration - show moon icon
        <svg 
          className={iconSizes[size]} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" 
          />
        </svg>
      )}
    </button>
  );
};

export default ThemeToggle;
