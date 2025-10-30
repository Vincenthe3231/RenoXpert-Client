"use client"
import React from 'react';
import { useTheme } from '../../hooks/use-theme';
import ThemeToggle from './ThemeToggle';
import ThemeSelector from './ThemeSelector';
import ThemeSettings from './ThemeSettings';

const ThemeDemo: React.FC = () => {
  const { activeMode, activeTheme, activeDir, activeLayout, isCardShadow, isLayout } = useTheme();

  return (
    <div className="min-h-screen bg-white dark:bg-dark p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-dark dark:text-white mb-4">
            Theme Toggle Demo
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            This demo shows how the theme toggle functionality works with localStorage persistence.
          </p>
        </div>

        {/* Current Theme Status */}
        <div className="bg-white dark:bg-darkmuted rounded-lg p-6 border border-ld">
          <h2 className="text-xl font-semibold text-dark dark:text-white mb-4">
            Current Theme Status
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <span className="text-sm text-gray-600 dark:text-gray-400">Mode:</span>
              <div className="font-medium text-dark dark:text-white capitalize">
                {activeMode}
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-sm text-gray-600 dark:text-gray-400">Color Theme:</span>
              <div className="font-medium text-dark dark:text-white">
                {activeTheme}
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-sm text-gray-600 dark:text-gray-400">Direction:</span>
              <div className="font-medium text-dark dark:text-white uppercase">
                {activeDir}
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-sm text-gray-600 dark:text-gray-400">Layout:</span>
              <div className="font-medium text-dark dark:text-white capitalize">
                {activeLayout}
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-sm text-gray-600 dark:text-gray-400">Card Shadow:</span>
              <div className="font-medium text-dark dark:text-white">
                {isCardShadow ? 'Enabled' : 'Disabled'}
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-sm text-gray-600 dark:text-gray-400">Layout Type:</span>
              <div className="font-medium text-dark dark:text-white capitalize">
                {isLayout}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Theme Toggle */}
        <div className="bg-white dark:bg-darkmuted rounded-lg p-6 border border-ld">
          <h2 className="text-xl font-semibold text-dark dark:text-white mb-4">
            Quick Theme Toggle
          </h2>
          <div className="flex items-center space-x-4">
            <ThemeToggle size="lg" />
            <span className="text-dark dark:text-white">
              Click to toggle between light and dark mode
            </span>
          </div>
        </div>

        {/* Color Theme Selector */}
        <div className="bg-white dark:bg-darkmuted rounded-lg p-6 border border-ld">
          <h2 className="text-xl font-semibold text-dark dark:text-white mb-4">
            Color Theme Selector
          </h2>
          <ThemeSelector />
        </div>

        {/* Full Theme Settings */}
        <div className="bg-white dark:bg-darkmuted rounded-lg p-6 border border-ld">
          <h2 className="text-xl font-semibold text-dark dark:text-white mb-4">
            Complete Theme Settings
          </h2>
          <ThemeSettings showTitle={false} />
        </div>

        {/* Sample Content to Show Theme Changes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-darkmuted rounded-lg p-6 border border-ld">
            <h3 className="text-lg font-semibold text-dark dark:text-white mb-3">
              Sample Card
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              This is a sample card to demonstrate how the theme affects the appearance.
            </p>
            <button className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primaryemphasis transition-colors">
              Primary Button
            </button>
          </div>
          
          <div className="bg-lightprimary dark:bg-darkprimary rounded-lg p-6 border border-ld">
            <h3 className="text-lg font-semibold text-primary mb-3">
              Accent Card
            </h3>
            <p className="text-primary mb-4">
              This card uses accent colors to show theme variations.
            </p>
            <button className="bg-secondary text-white px-4 py-2 rounded-md hover:bg-secondaryemphasis transition-colors">
              Secondary Button
            </button>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-lightgray dark:bg-darkmuted rounded-lg p-6 border border-ld">
          <h3 className="text-lg font-semibold text-dark dark:text-white mb-3">
            How to Use
          </h3>
          <ul className="space-y-2 text-gray-600 dark:text-gray-400">
            <li>• All theme changes are automatically saved to localStorage</li>
            <li>• Refresh the page to see that your settings persist</li>
            <li>• Use the <code className="bg-white dark:bg-dark px-1 rounded">useTheme</code> hook in your components</li>
            <li>• Import and use the provided theme components anywhere in your app</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ThemeDemo;
