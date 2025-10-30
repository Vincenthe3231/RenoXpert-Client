"use client"
import { useContext } from 'react';
import { CustomizerContext } from '../app/context/CustomizerContext';

export const useTheme = () => {
  const context = useContext(CustomizerContext);
  
  if (!context) {
    throw new Error('useTheme must be used within a CustomizerContextProvider');
  }

  const {
    activeMode,
    setActiveMode,
    activeTheme,
    setActiveTheme,
    activeDir,
    setActiveDir,
    activeLayout,
    setActiveLayout,
    isCardShadow,
    setIsCardShadow,
    isLayout,
    setIsLayout,
    isBorderRadius,
    setIsBorderRadius,
    isCollapse,
    setIsCollapse,
    isLanguage,
    setIsLanguage
  } = context;

  // Theme mode toggle function
  const toggleTheme = () => {
    setActiveMode(activeMode === 'light' ? 'dark' : 'light');
  };

  // Set specific theme mode
  const setTheme = (mode: 'light' | 'dark') => {
    setActiveMode(mode);
  };

  // Set specific color theme
  const setColorTheme = (theme: string) => {
    setActiveTheme(theme);
  };

  // Set direction
  const setDirection = (dir: 'ltr' | 'rtl') => {
    setActiveDir(dir);
  };

  // Toggle direction
  const toggleDirection = () => {
    setActiveDir(activeDir === 'ltr' ? 'rtl' : 'ltr');
  };

  // Set layout
  const setLayout = (layout: 'vertical' | 'horizontal') => {
    setActiveLayout(layout);
  };

  // Toggle layout
  const toggleLayout = () => {
    setActiveLayout(activeLayout === 'vertical' ? 'horizontal' : 'vertical');
  };

  // Set card shadow
  const setCardShadow = (shadow: boolean) => {
    setIsCardShadow(shadow);
  };

  // Toggle card shadow
  const toggleCardShadow = () => {
    setIsCardShadow(!isCardShadow);
  };

  // Set boxed layout
  const setBoxedLayout = (layout: 'full' | 'boxed') => {
    setIsLayout(layout);
  };

  // Toggle boxed layout
  const toggleBoxedLayout = () => {
    setIsLayout(isLayout === 'full' ? 'boxed' : 'full');
  };

  // Set border radius
  const setBorderRadius = (radius: number) => {
    setIsBorderRadius(radius);
  };

  // Set sidebar collapse
  const setSidebarCollapse = (collapse: string) => {
    setIsCollapse(collapse);
  };

  // Set language
  const setLanguage = (language: string) => {
    setIsLanguage(language);
  };

  return {
    // Current values
    activeMode,
    activeTheme,
    activeDir,
    activeLayout,
    isCardShadow,
    isLayout,
    isBorderRadius,
    isCollapse,
    isLanguage,
    
    // Theme mode functions
    toggleTheme,
    setTheme,
    
    // Color theme functions
    setColorTheme,
    
    // Direction functions
    setDirection,
    toggleDirection,
    
    // Layout functions
    setLayout,
    toggleLayout,
    
    // Card shadow functions
    setCardShadow,
    toggleCardShadow,
    
    // Boxed layout functions
    setBoxedLayout,
    toggleBoxedLayout,
    
    // Border radius functions
    setBorderRadius,
    
    // Sidebar functions
    setSidebarCollapse,
    
    // Language functions
    setLanguage,
    
    // Direct setters (for advanced usage)
    setActiveMode,
    setActiveTheme,
    setActiveDir,
    setActiveLayout,
    setIsCardShadow,
    setIsLayout,
    setIsBorderRadius,
    setIsCollapse,
    setIsLanguage
  };
};
