import React, { createContext, useContext, useState, useEffect } from 'react';
import { settingsRepository } from '../db/repositories/settingsRepository';
import { AppSettings } from '../types';

export type AppModule =
  | 'home'
  | 'prompt-builder'
  | 'pin-board'
  | 'architecture'
  | 'prompt-library'
  | 'project-profile'
  | 'export-history'
  | 'settings';

interface ToastItem {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

interface AppContextType {
  activeModule: AppModule;
  setActiveModule: (mod: AppModule) => void;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => Promise<void>;
  toasts: ToastItem[];
  showToast: (message: string, type?: ToastItem['type']) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeModule, setActiveModule] = useState<AppModule>('home');
  const [theme, setThemeState] = useState<'light' | 'dark'>('light');
  const [settings, setSettings] = useState<AppSettings>({
    theme: 'light',
    defaultExportDirectory: 'downloads/devprompt',
    promptSeparator: '###',
    defaultGlobalRuleId: 'p-global-01',
    autoBackup: true,
  });
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    settingsRepository.getSettings().then((s) => {
      setSettings(s);
      setThemeState(s.theme);
      document.documentElement.setAttribute('data-theme', s.theme);
    });
  }, []);

  const setTheme = (t: 'light' | 'dark') => {
    setThemeState(t);
    document.documentElement.setAttribute('data-theme', t);
    settingsRepository.updateSettings({ theme: t });
  };

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
  };

  const updateSettings = async (newSettings: Partial<AppSettings>) => {
    const updated = await settingsRepository.updateSettings(newSettings);
    setSettings(updated);
    if (newSettings.theme) {
      setThemeState(newSettings.theme);
      document.documentElement.setAttribute('data-theme', newSettings.theme);
    }
  };

  const showToast = (message: string, type: ToastItem['type'] = 'info') => {
    const id = `t-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  };

  return (
    <AppContext.Provider
      value={{
        activeModule,
        setActiveModule,
        theme,
        setTheme,
        toggleTheme,
        settings,
        updateSettings,
        toasts,
        showToast,
        searchQuery,
        setSearchQuery,
      }}
    >
      {children}
      <div className="toast-container">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="toast"
            style={{
              borderLeft:
                t.type === 'success'
                  ? '4px solid var(--success)'
                  : t.type === 'warning'
                  ? '4px solid var(--warning)'
                  : t.type === 'error'
                  ? '4px solid var(--danger)'
                  : '4px solid var(--primary)',
            }}
          >
            {t.message}
          </div>
        ))}
      </div>
    </AppContext.Provider>
  );
};

export function useApp(): AppContextType {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
