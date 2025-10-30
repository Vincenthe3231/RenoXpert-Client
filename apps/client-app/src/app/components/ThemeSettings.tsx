"use client"
import React from 'react';
import { useTheme } from '../../hooks/use-theme';
import ThemeToggle from './ThemeToggle';
import ThemeSelector from './ThemeSelector';

interface ThemeSettingsProps {
  className?: string;
  showTitle?: boolean;
}

const ThemeSettings: React.FC<ThemeSettingsProps> = ({ 
  className = '', 
  showTitle = true 
}) => {
  const { 
    activeMode, 
    activeTheme, 
    activeDir, 
    activeLayout, 
    isCardShadow, 
    isLayout,
    toggleDirection,
    toggleLayout,
    toggleCardShadow,
    toggleBoxedLayout
  } = useTheme();

  return (
    <div className={`space-y-6 p-4 ${className}`}>
      {showTitle && (
        <h2 className="text-lg font-semibold text-dark dark:text-white">
          Theme Settings
        </h2>
      )}
      
      {/* Theme Mode Toggle */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-dark dark:text-white">
          Theme Mode
        </h3>
        <div className="flex items-center space-x-3">
          <ThemeToggle size="md" />
          <span className="text-sm text-dark dark:text-white">
            {activeMode === 'light' ? 'Light Mode' : 'Dark Mode'}
          </span>
        </div>
      </div>

      {/* Color Theme Selector */}
      <ThemeSelector />

      {/* Direction Toggle */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-dark dark:text-white">
          Text Direction
        </h3>
        <button
          onClick={toggleDirection}
          className="flex items-center space-x-2 px-3 py-2 rounded-md border border-ld bg-white dark:bg-dark hover:bg-lightprimary dark:hover:bg-lightprimary text-dark dark:text-white transition-colors"
        >
          <span className="text-sm">
            {activeDir === 'ltr' ? 'LTR' : 'RTL'}
          </span>
        </button>
      </div>

      {/* Layout Toggle */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-dark dark:text-white">
          Layout
        </h3>
        <button
          onClick={toggleLayout}
          className="flex items-center space-x-2 px-3 py-2 rounded-md border border-ld bg-white dark:bg-dark hover:bg-lightprimary dark:hover:bg-lightprimary text-dark dark:text-white transition-colors"
        >
          <span className="text-sm">
            {activeLayout === 'vertical' ? 'Vertical' : 'Horizontal'}
          </span>
        </button>
      </div>

      {/* Card Shadow Toggle */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-dark dark:text-white">
          Card Shadow
        </h3>
        <button
          onClick={toggleCardShadow}
          className="flex items-center space-x-2 px-3 py-2 rounded-md border border-ld bg-white dark:bg-dark hover:bg-lightprimary dark:hover:bg-lightprimary text-dark dark:text-white transition-colors"
        >
          <span className="text-sm">
            {isCardShadow ? 'Enabled' : 'Disabled'}
          </span>
        </button>
      </div>

      {/* Boxed Layout Toggle */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-dark dark:text-white">
          Layout Type
        </h3>
        <button
          onClick={toggleBoxedLayout}
          className="flex items-center space-x-2 px-3 py-2 rounded-md border border-ld bg-white dark:bg-dark hover:bg-lightprimary dark:hover:bg-lightprimary text-dark dark:text-white transition-colors"
        >
          <span className="text-sm">
            {isLayout === 'full' ? 'Full Width' : 'Boxed'}
          </span>
        </button>
      </div>
    </div>
  );
};

export default ThemeSettings;
