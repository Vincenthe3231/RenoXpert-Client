"use client"
import React, { createContext, useState, ReactNode, useEffect } from 'react';
import config from '../config';
import { getItem, setItem } from '@/lib/localStorage';


// Define the shape of the context state
interface CustomizerContextState {
  selectedIconId: number;
  setSelectedIconId: (id: number) => void;
  activeDir: string;
  setActiveDir: (dir: string) => void;
  activeMode: string;
  setActiveMode: (mode: string) => void;
  activeTheme: string;
  setActiveTheme: (theme: string) => void;
  activeLayout: string;
  setActiveLayout: (layout: string) => void;
  isCardShadow: boolean;
  setIsCardShadow: (shadow: boolean) => void;
  isLayout: string;
  setIsLayout: (layout: string) => void;
  isBorderRadius: number;
  setIsBorderRadius: (radius: number) => void;
  isCollapse: string;
  setIsCollapse: (collapse: string) => void;
}

// Create the context with an initial value
export const CustomizerContext = createContext<CustomizerContextState | any>(undefined);

// Define the type for the children prop
interface CustomizerContextProps {
  children: ReactNode;
}
// Create the provider component
export const CustomizerContextProvider: React.FC<CustomizerContextProps> = ({ children }) => {
  const [selectedIconId, setSelectedIconId] = useState<number>(1);
  const [activeDir, setActiveDir] = useState<string>(() => getItem<string>('activeDir') || config.activeDir);
  const [activeMode, setActiveMode] = useState<string>(() => getItem<string>('activeMode') || config.activeMode);
  const [activeTheme, setActiveTheme] = useState<string>(() => getItem<string>('activeTheme') || config.activeTheme);
  const [activeLayout, setActiveLayout] = useState<string>(() => getItem<string>('activeLayout') || config.activeLayout);
  const [isCardShadow, setIsCardShadow] = useState<boolean>(() => getItem<boolean>('isCardShadow') ?? config.isCardShadow);
  const [isLayout, setIsLayout] = useState<string>(() => getItem<string>('isLayout') || config.isLayout);
  const [isBorderRadius, setIsBorderRadius] = useState<number>(() => getItem<number>('isBorderRadius') ?? config.isBorderRadius);
  const [isCollapse, setIsCollapse] = useState<string>(() => getItem<string>('isCollapse') || config.isCollapse);
  const [isLanguage, setIsLanguage] = useState<string>(() => getItem<string>('isLanguage') || config.isLanguage);

  // Set attributes immediately
  useEffect(() => {
    document.documentElement.setAttribute("class", activeMode);
    document.documentElement.setAttribute("dir", activeDir);
    document.documentElement.setAttribute('data-color-theme', activeTheme);
    document.documentElement.setAttribute("data-layout", activeLayout);
    document.documentElement.setAttribute("data-boxed-layout", isLayout);
    document.documentElement.setAttribute("data-sidebar-type", isCollapse);

  }, [activeMode, activeDir, activeTheme, activeLayout, isLayout, isCollapse]);

  // Persist state changes to localStorage
  useEffect(() => {
    setItem('activeDir', activeDir);
  }, [activeDir]);

  useEffect(() => {
    setItem('activeMode', activeMode);
  }, [activeMode]);

  useEffect(() => {
    setItem('activeTheme', activeTheme);
  }, [activeTheme]);

  useEffect(() => {
    setItem('activeLayout', activeLayout);
  }, [activeLayout]);

  useEffect(() => {
    setItem('isCardShadow', isCardShadow);
  }, [isCardShadow]);

  useEffect(() => {
    setItem('isLayout', isLayout);
  }, [isLayout]);

  useEffect(() => {
    setItem('isBorderRadius', isBorderRadius);
  }, [isBorderRadius]);

  useEffect(() => {
    setItem('isCollapse', isCollapse);
  }, [isCollapse]);

  useEffect(() => {
    setItem('isLanguage', isLanguage);
  }, [isLanguage]);

  return (
    <CustomizerContext.Provider
      value={{
        selectedIconId,
        setSelectedIconId,
        activeDir,
        setActiveDir,
        activeMode,
        setActiveMode,
        activeTheme,
        setActiveTheme,
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
      }}
    >
      {children}
    </CustomizerContext.Provider>
  );
};


