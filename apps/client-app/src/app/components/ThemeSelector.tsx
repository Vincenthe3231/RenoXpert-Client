"use client"
import React from 'react';
import { useTheme } from '../../hooks/use-theme';

interface ThemeSelectorProps {
  className?: string;
  showLabel?: boolean;
}

const colorThemes = [
  { name: 'Blue', value: 'BLUE_THEME', color: 'bg-blue-500' },
  { name: 'Green', value: 'GREEN_THEME', color: 'bg-green-500' },
  { name: 'Aqua', value: 'AQUA_THEME', color: 'bg-cyan-500' },
  { name: 'Purple', value: 'PURPLE_THEME', color: 'bg-purple-500' },
  { name: 'Orange', value: 'ORANGE_THEME', color: 'bg-orange-500' },
];

const ThemeSelector: React.FC<ThemeSelectorProps> = ({ 
  className = '', 
  showLabel = true 
}) => {
  const { activeTheme, setColorTheme } = useTheme();

  return (
    <div className={`space-y-3 ${className}`}>
      {showLabel && (
        <h3 className="text-sm font-semibold text-dark dark:text-white">
          Color Theme
        </h3>
      )}
      <div className="grid grid-cols-5 gap-2">
        {colorThemes.map((theme) => (
          <button
            key={theme.value}
            onClick={() => setColorTheme(theme.value)}
            className={`
              relative flex items-center justify-center w-10 h-10 rounded-md border-2
              transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary
              ${theme.color}
              ${activeTheme === theme.value 
                ? 'border-primary ring-2 ring-primary' 
                : 'border-ld hover:border-primary'
              }
            `}
            aria-label={`Select ${theme.name} theme`}
            title={theme.name}
          >
            {activeTheme === theme.value && (
              <svg 
                className="w-5 h-5 text-white" 
                fill="currentColor" 
                viewBox="0 0 20 20"
              >
                <path 
                  fillRule="evenodd" 
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
                  clipRule="evenodd" 
                />
              </svg>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ThemeSelector;
