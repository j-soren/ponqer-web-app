'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface ThemeSettings {
  // Background settings
  backgroundType: 'gradient' | 'solid' | 'animated';
  backgroundColors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  
  // Color scheme
  colorScheme: 'light' | 'dark' | 'auto';
  
  // Text settings
  welcomeText: string;
  subtitleText: string;
  getStartedButtonText: string;
  
  // Button settings
  buttonStyle: 'rounded' | 'square' | 'pill';
  buttonSize: 'sm' | 'md' | 'lg';
  buttonAnimation: 'none' | 'hover-grow' | 'hover-glow' | 'pulse';
  
  // Layout settings
  animationsEnabled: boolean;
  glowEffects: boolean;
  particleEffects: boolean;
}

export interface SettingsContextType {
  settings: ThemeSettings;
  updateSettings: (newSettings: Partial<ThemeSettings>) => void;
  resetSettings: () => void;
  presetThemes: Record<string, ThemeSettings>;
  applyPreset: (presetName: string) => void;
}

const defaultSettings: ThemeSettings = {
  backgroundType: 'gradient',
  backgroundColors: {
    primary: '#0f172a', // slate-900
    secondary: '#7c3aed', // purple-600
    accent: '#06b6d4', // cyan-500
  },
  colorScheme: 'dark',
  welcomeText: 'Welcome',
  subtitleText: "You've successfully signed in to your dashboard",
  getStartedButtonText: 'Get Started',
  buttonStyle: 'rounded',
  buttonSize: 'md',
  buttonAnimation: 'hover-grow',
  animationsEnabled: true,
  glowEffects: true,
  particleEffects: true,
};

const presetThemes: Record<string, ThemeSettings> = {
  'Dark Aurora': {
    ...defaultSettings,
    backgroundType: 'gradient',
    backgroundColors: {
      primary: '#0f172a',
      secondary: '#7c3aed',
      accent: '#06b6d4',
    },
    colorScheme: 'dark',
    welcomeText: 'Welcome',
    buttonAnimation: 'hover-grow',
    glowEffects: true,
    particleEffects: true,
  },
  'Ocean Breeze': {
    ...defaultSettings,
    backgroundType: 'gradient',
    backgroundColors: {
      primary: '#1e293b',
      secondary: '#0ea5e9',
      accent: '#10b981',
    },
    colorScheme: 'dark',
    welcomeText: 'Hello',
    buttonStyle: 'pill',
    buttonAnimation: 'hover-glow',
  },
  'Sunset Vibes': {
    ...defaultSettings,
    backgroundType: 'gradient',
    backgroundColors: {
      primary: '#451a03',
      secondary: '#ea580c',
      accent: '#f59e0b',
    },
    colorScheme: 'dark',
    welcomeText: 'Greetings',
    buttonAnimation: 'pulse',
    glowEffects: true,
  },
  'Minimal Light': {
    ...defaultSettings,
    backgroundType: 'solid',
    backgroundColors: {
      primary: '#f8fafc',
      secondary: '#e2e8f0',
      accent: '#3b82f6',
    },
    colorScheme: 'light',
    welcomeText: 'Welcome Back',
    buttonStyle: 'square',
    buttonAnimation: 'hover-grow',
    glowEffects: false,
    particleEffects: false,
  },
  'Cyberpunk': {
    ...defaultSettings,
    backgroundType: 'animated',
    backgroundColors: {
      primary: '#000000',
      secondary: '#ff00ff',
      accent: '#00ffff',
    },
    colorScheme: 'dark',
    welcomeText: 'ENTER',
    subtitleText: 'Access granted to the system',
    getStartedButtonText: 'INITIALIZE',
    buttonStyle: 'square',
    buttonAnimation: 'hover-glow',
    glowEffects: true,
    particleEffects: true,
  },
  'Forest Green': {
    ...defaultSettings,
    backgroundType: 'gradient',
    backgroundColors: {
      primary: '#14532d',
      secondary: '#16a34a',
      accent: '#84cc16',
    },
    colorScheme: 'dark',
    welcomeText: 'Welcome',
    buttonStyle: 'rounded',
    buttonAnimation: 'hover-grow',
  },
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<ThemeSettings>(defaultSettings);

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem('theme-settings');
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        setSettings({ ...defaultSettings, ...parsed });
      }
    } catch (error) {
      console.error('Failed to load settings from localStorage:', error);
    }
  }, []);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('theme-settings', JSON.stringify(settings));
    } catch (error) {
      console.error('Failed to save settings to localStorage:', error);
    }
  }, [settings]);

  // Apply CSS custom properties whenever settings change
  useEffect(() => {
    const root = document.documentElement;
    
    // Background colors
    root.style.setProperty('--theme-bg-primary', settings.backgroundColors.primary);
    root.style.setProperty('--theme-bg-secondary', settings.backgroundColors.secondary);
    root.style.setProperty('--theme-bg-accent', settings.backgroundColors.accent);
    
    // Color scheme
    root.style.setProperty('--theme-color-scheme', settings.colorScheme);
    
    // Button settings
    root.style.setProperty('--theme-button-radius', 
      settings.buttonStyle === 'square' ? '0.375rem' :
      settings.buttonStyle === 'pill' ? '9999px' : '0.75rem'
    );
    
    root.style.setProperty('--theme-button-size', 
      settings.buttonSize === 'sm' ? '0.75rem 1.5rem' :
      settings.buttonSize === 'lg' ? '1rem 2.5rem' : '0.875rem 2rem'
    );

    // Animation settings
    root.style.setProperty('--theme-animations', settings.animationsEnabled ? 'running' : 'paused');
    root.style.setProperty('--theme-glow-opacity', settings.glowEffects ? '1' : '0');
    
  }, [settings]);

  const updateSettings = (newSettings: Partial<ThemeSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
  };

  const applyPreset = (presetName: string) => {
    if (presetThemes[presetName]) {
      setSettings(presetThemes[presetName]);
    }
  };

  const value: SettingsContextType = {
    settings,
    updateSettings,
    resetSettings,
    presetThemes,
    applyPreset,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}