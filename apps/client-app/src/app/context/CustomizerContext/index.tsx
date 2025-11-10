"use client"
import React, { createContext, useState, ReactNode, useEffect, useRef } from 'react';
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
  const [activeDir, setActiveDir] = useState<string>(config.activeDir);
  const [activeMode, setActiveMode] = useState<string>(config.activeMode);
  const [activeTheme, setActiveTheme] = useState<string>(config.activeTheme);
  const [activeLayout, setActiveLayout] = useState<string>(config.activeLayout);
  const [isCardShadow, setIsCardShadow] = useState<boolean>(config.isCardShadow);
  const [isLayout, setIsLayout] = useState<string>(config.isLayout);
  const [isBorderRadius, setIsBorderRadius] = useState<number>(config.isBorderRadius);
  const [isCollapse, setIsCollapse] = useState<string>(config.isCollapse);
  const [isLanguage, setIsLanguage] = useState<string>(config.isLanguage);
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const isInitialLoad = useRef(true);

  // Load from localStorage after mount to prevent hydration mismatch
  useEffect(() => {
    setIsMounted(true);
    const savedActiveDir = getItem<string>('activeDir');
    const savedActiveMode = getItem<string>('activeMode');
    const savedActiveTheme = getItem<string>('activeTheme');
    const savedActiveLayout = getItem<string>('activeLayout');
    const savedIsCardShadow = getItem<boolean>('isCardShadow');
    const savedIsLayout = getItem<string>('isLayout');
    const savedIsBorderRadius = getItem<number>('isBorderRadius');
    const savedIsCollapse = getItem<string>('isCollapse');
    const savedIsLanguage = getItem<string>('isLanguage');

    if (savedActiveDir) setActiveDir(savedActiveDir);
    if (savedActiveMode) setActiveMode(savedActiveMode);
    if (savedActiveTheme) setActiveTheme(savedActiveTheme);
    if (savedActiveLayout) setActiveLayout(savedActiveLayout);
    if (savedIsCardShadow !== null) setIsCardShadow(savedIsCardShadow);
    if (savedIsLayout) setIsLayout(savedIsLayout);
    if (savedIsBorderRadius !== null) setIsBorderRadius(savedIsBorderRadius);
    if (savedIsCollapse) setIsCollapse(savedIsCollapse);
    if (savedIsLanguage) setIsLanguage(savedIsLanguage);
    
    isInitialLoad.current = false;
  }, []);

  // Set attributes immediately
  useEffect(() => {
    if (!isMounted) return;
    document.documentElement.setAttribute("class", activeMode);
    document.documentElement.setAttribute("dir", activeDir);
    document.documentElement.setAttribute('data-color-theme', activeTheme);
    document.documentElement.setAttribute("data-layout", activeLayout);
    document.documentElement.setAttribute("data-boxed-layout", isLayout);
    document.documentElement.setAttribute("data-sidebar-type", isCollapse);

  }, [activeMode, activeDir, activeTheme, activeLayout, isLayout, isCollapse, isMounted]);

  // Persist state changes to localStorage
  useEffect(() => {
    if (isInitialLoad.current) return;
    setItem('activeDir', activeDir);
  }, [activeDir]);

  useEffect(() => {
    if (isInitialLoad.current) return;
    setItem('activeMode', activeMode);
  }, [activeMode]);

  useEffect(() => {
    if (isInitialLoad.current) return;
    setItem('activeTheme', activeTheme);
  }, [activeTheme]);

  useEffect(() => {
    if (isInitialLoad.current) return;
    setItem('activeLayout', activeLayout);
  }, [activeLayout]);

  useEffect(() => {
    if (isInitialLoad.current) return;
    setItem('isCardShadow', isCardShadow);
  }, [isCardShadow]);

  useEffect(() => {
    if (isInitialLoad.current) return;
    setItem('isLayout', isLayout);
  }, [isLayout]);

  useEffect(() => {
    if (isInitialLoad.current) return;
    setItem('isBorderRadius', isBorderRadius);
  }, [isBorderRadius]);

  useEffect(() => {
    if (isInitialLoad.current) return;
    setItem('isCollapse', isCollapse);
  }, [isCollapse]);

  useEffect(() => {
    if (isInitialLoad.current) return;
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


