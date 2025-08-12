"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ELEVENLABS_VOICE_OPTIONS } from '../utils/tts';

// Define the types for our settings
export interface Settings {
  voiceId: string;
  language: string;
}

// Define the context type
interface SettingsContextType {
  settings: Settings;
  updateSettings: (newSettings: Partial<Settings>) => void;
  availableVoices: Record<string, string>;
  availableLanguages: Record<string, string>;
}

// Create the context with default values
const SettingsContext = createContext<SettingsContextType>({
  settings: {
    voiceId: 'pNInz6obpgDQGcFmaJgB', // Default to Adam (Indian male)
    language: 'en', // Default to English
  },
  updateSettings: () => {},
  availableVoices: {},
  availableLanguages: {},
});

// Available languages with their codes
const AVAILABLE_LANGUAGES = {
  'en': 'English',
  'hi': 'Hindi',
  'es': 'Spanish',
  'fr': 'French',
  'de': 'German',
  'ja': 'Japanese',
  'ko': 'Korean',
  'zh': 'Chinese',
  'ar': 'Arabic',
  'ru': 'Russian',
};

// Provider component
export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Initialize settings from localStorage or use defaults
  const [settings, setSettings] = useState<Settings>(() => {
    const savedSettings = localStorage.getItem('codeMentorSettings');
    return savedSettings 
      ? JSON.parse(savedSettings) 
      : {
          voiceId: 'pNInz6obpgDQGcFmaJgB', // Default to Adam (Indian male)
          language: 'en', // Default to English
        };
  });

  // Update settings function
  const updateSettings = (newSettings: Partial<Settings>) => {
    setSettings(prevSettings => {
      const updatedSettings = { ...prevSettings, ...newSettings };
      localStorage.setItem('codeMentorSettings', JSON.stringify(updatedSettings));
      return updatedSettings;
    });
  };

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('codeMentorSettings', JSON.stringify(settings));
  }, [settings]);

  // Context value
  const contextValue = {
    settings,
    updateSettings,
    availableVoices: ELEVENLABS_VOICE_OPTIONS,
    availableLanguages: AVAILABLE_LANGUAGES,
  };

  return (
    <SettingsContext.Provider value={contextValue}>
      {children}
    </SettingsContext.Provider>
  );
};

// Custom hook for using the settings context
export const useSettings = () => useContext(SettingsContext);
