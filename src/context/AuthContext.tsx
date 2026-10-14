import React, { createContext, useContext, useState } from 'react';
import { UserProfile } from '../types';

interface AuthContextType {
  user: UserProfile | null;
  isAdmin: boolean;
  isAdminMode: boolean;
  setIsAdminMode: (active: boolean) => void;
  verifyPin: (pin: string) => { success: boolean; error?: string };
  exitAdminMode: () => void;
  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  authorizedEmail: string;
}

// Secret PIN for Admin Mode Authentication (Never expose in UI, console, or error messages)
const ADMIN_PIN = '5313';
const AUTH_STORAGE_KEY = 'syncrozz_kpmbp_auth';
const ADMIN_MODE_KEY = 'syncrozz_kpmbp_admin_mode';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAdminMode, setIsAdminModeState] = useState<boolean>(() => {
    try {
      return localStorage.getItem(ADMIN_MODE_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem(AUTH_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
      if (localStorage.getItem(ADMIN_MODE_KEY) === 'true') {
        return {
          uid: 'admin-kpmbp-leader',
          email: 'admin@kpmbp.edu.my',
          displayName: 'Pentadbir Kontinjen',
          isAdmin: true,
        };
      }
      return null;
    } catch {
      return null;
    }
  });

  const setIsAdminMode = (active: boolean) => {
    setIsAdminModeState(active);
    try {
      localStorage.setItem(ADMIN_MODE_KEY, active ? 'true' : 'false');
      if (active) {
        const adminProfile: UserProfile = {
          uid: 'admin-kpmbp-leader',
          email: 'admin@kpmbp.edu.my',
          displayName: 'Pentadbir Kontinjen',
          isAdmin: true,
        };
        setUser(adminProfile);
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(adminProfile));
      } else {
        setUser(null);
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    } catch (e) {
      console.error('Failed to update admin mode in storage:', e);
    }
  };

  /**
   * Fast, keyboard-first PIN validation against 5313
   */
  const verifyPin = (inputPin: string): { success: boolean; error?: string } => {
    const clean = inputPin.trim();
    if (clean === ADMIN_PIN) {
      setIsAdminMode(true);
      return { success: true };
    }
    return {
      success: false,
      error: 'PIN keselamatan tidak sah. Sila cuba lagi.',
    };
  };

  const exitAdminMode = () => {
    setIsAdminMode(false);
  };

  const login = async (_email: string, _password?: string): Promise<{ success: boolean; error?: string }> => {
    setIsAdminMode(true);
    return { success: true };
  };

  const logout = async (): Promise<void> => {
    exitAdminMode();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin: isAdminMode,
        isAdminMode,
        setIsAdminMode,
        verifyPin,
        exitAdminMode,
        login,
        logout,
        authorizedEmail: 'admin@kpmbp.edu.my',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
