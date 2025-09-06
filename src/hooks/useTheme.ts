import { useState, useEffect } from 'react';

export type ThemeMode = 'light' | 'dark';

export interface ThemeColors {
  // Background colors
  primaryBackground: string;
  secondaryBackground: string;
  cardBackground: string;
  
  // Text colors
  primaryText: string;
  secondaryText: string;
  
  // Border colors
  borderColor: string;
  borderColorSubtle: string;
  
  // Effects
  shadowColor: string;
  glowColor: string;
  
  // Gradients
  backgroundGradient: string;
}

const lightTheme: ThemeColors = {
  primaryBackground: '#ffffff',
  secondaryBackground: '#f9f9f9',
  cardBackground: 'rgba(255, 255, 255, 0.9)',
  primaryText: '#333333',
  secondaryText: '#666666',
  borderColor: 'rgba(200, 200, 200, 0.3)',
  borderColorSubtle: 'rgba(200, 200, 200, 0.1)',
  shadowColor: 'rgba(0, 0, 0, 0.1)',
  glowColor: 'rgba(0, 0, 0, 0.2)',
  backgroundGradient: 'linear-gradient(135deg, #667eea08 0%, #764ba208 100%)',
};

const darkTheme: ThemeColors = {
  primaryBackground: '#1a1a1a',
  secondaryBackground: '#2a2a2a',
  cardBackground: 'rgba(30, 30, 30, 0.9)',
  primaryText: '#ffffff',
  secondaryText: '#cccccc',
  borderColor: 'rgba(255, 255, 255, 0.2)',
  borderColorSubtle: 'rgba(255, 255, 255, 0.1)',
  shadowColor: 'rgba(0, 0, 0, 0.3)',
  glowColor: 'rgba(255, 255, 255, 0.1)',
  backgroundGradient: 'linear-gradient(135deg, #667eea15 0%, #764ba215 100%)',
};

export const useTheme = () => {
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    // Initialize from localStorage or default to light
    const savedTheme = localStorage.getItem('inventree-card-theme');
    return (savedTheme as ThemeMode) || 'light';
  });

  const theme = themeMode === 'dark' ? darkTheme : lightTheme;

  const toggleTheme = () => {
    const newTheme = themeMode === 'light' ? 'dark' : 'light';
    setThemeMode(newTheme);
    localStorage.setItem('inventree-card-theme', newTheme);
  };

  const setTheme = (mode: ThemeMode) => {
    setThemeMode(mode);
    localStorage.setItem('inventree-card-theme', mode);
  };

  // Apply theme to CSS custom properties
  useEffect(() => {
    const root = document.documentElement;
    
    root.style.setProperty('--inventree-bg-primary', theme.primaryBackground);
    root.style.setProperty('--inventree-bg-secondary', theme.secondaryBackground);
    root.style.setProperty('--inventree-bg-card', theme.cardBackground);
    root.style.setProperty('--inventree-text-primary', theme.primaryText);
    root.style.setProperty('--inventree-text-secondary', theme.secondaryText);
    root.style.setProperty('--inventree-border', theme.borderColor);
    root.style.setProperty('--inventree-border-subtle', theme.borderColorSubtle);
    root.style.setProperty('--inventree-shadow', theme.shadowColor);
    root.style.setProperty('--inventree-glow', theme.glowColor);
    root.style.setProperty('--inventree-gradient', theme.backgroundGradient);
  }, [theme]);

  return {
    themeMode,
    theme,
    toggleTheme,
    setTheme,
    isDark: themeMode === 'dark',
    isLight: themeMode === 'light',
  };
};
