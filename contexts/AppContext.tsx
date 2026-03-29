import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { SafetySettings } from '@/types/database';

export type CaseType = 'self_protect' | 'warning_letter' | 'complaint' | null;

const DEFAULT_SAFETY_SETTINGS: SafetySettings = {
  fakeIcon: 'calculator',
  fakeNotificationText: '내일 날씨: 맑음',
  autoDeleteOnPinFail: false,
  pinFailLimit: 5,
  quickExitTrigger: 'none',
  stealthPin: '1234',
};

export interface AppContextType {
  // Stealth mode
  isStealthMode: boolean;
  setStealthMode: (v: boolean) => void;

  // SOS
  showSOS: boolean;
  setShowSOS: (v: boolean) => void;

  // Protection progress tracking
  completedSteps: string[];
  addCompletedStep: (step: string) => void;

  // Onboarding
  userOnboarded: boolean;
  setUserOnboarded: (v: boolean) => void;

  // Case tracking
  casePhase: 1 | 2 | 3 | 4 | 5;
  setCasePhase: (phase: 1 | 2 | 3 | 4 | 5) => void;
  caseStatus: string;
  setCaseStatus: (status: string) => void;
  caseType: CaseType;
  setCaseType: (type: CaseType) => void;

  // Safety settings
  safetySettings: SafetySettings;
  setSafetySettings: (settings: Partial<SafetySettings>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [isStealthMode, setStealthMode] = useState(false);
  const [showSOS, setShowSOS] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [userOnboarded, setUserOnboarded] = useState(false);

  // Case tracking
  const [casePhase, setCasePhase] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [caseStatus, setCaseStatus] = useState<string>('intake');
  const [caseType, setCaseType] = useState<CaseType>(null);

  // Safety settings
  const [safetySettings, setSafetySettingsState] = useState<SafetySettings>(DEFAULT_SAFETY_SETTINGS);
  const setSafetySettings = useCallback((settings: Partial<SafetySettings>) => {
    setSafetySettingsState((prev) => ({ ...prev, ...settings }));
  }, []);

  const addCompletedStep = useCallback((step: string) => {
    setCompletedSteps((prev) => {
      if (prev.includes(step)) return prev;
      return [...prev, step];
    });
  }, []);

  return (
    <AppContext.Provider
      value={{
        isStealthMode,
        setStealthMode,
        showSOS,
        setShowSOS,
        completedSteps,
        addCompletedStep,
        userOnboarded,
        setUserOnboarded,
        casePhase,
        setCasePhase,
        caseStatus,
        setCaseStatus,
        caseType,
        setCaseType,
        safetySettings,
        setSafetySettings,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext(): AppContextType {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}

export default AppContext;
