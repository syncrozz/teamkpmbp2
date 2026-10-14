import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { auth, isFirebaseConfigured } from '../lib/firebase';
import {
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from 'firebase/auth';

interface AuthContextType {
  user: UserProfile | null;
  isAdmin: boolean;
  isAdminMode: boolean;
  setIsAdminMode: (active: boolean) => void;
  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  authorizedEmail: string;
}

const AUTHORIZED_ADMIN_EMAIL = 'cgkhairi2u@gmail.com';
const AUTH_STORAGE_KEY = 'syncrozz_kpmbp_auth';
const ADMIN_MODE_KEY = 'syncrozz_kpmbp_admin_mode';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem(AUTH_STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isAdminMode, setIsAdminModeState] = useState<boolean>(() => {
    try {
      return localStorage.getItem(ADMIN_MODE_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const setIsAdminMode = (active: boolean) => {
    setIsAdminModeState(active);
    try {
      localStorage.setItem(ADMIN_MODE_KEY, active ? 'true' : 'false');
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (isFirebaseConfigured && auth) {
      const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        if (firebaseUser) {
          const isUserAdmin =
            firebaseUser.email?.toLowerCase() === AUTHORIZED_ADMIN_EMAIL.toLowerCase();
          const profile: UserProfile = {
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0],
            isAdmin: isUserAdmin,
          };
          setUser(profile);
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(profile));
        } else {
          // If explicitly signed out in Firebase
          const stored = localStorage.getItem(AUTH_STORAGE_KEY);
          if (stored) {
            // Keep local session if preview mode
          }
        }
      });
      return () => unsubscribe();
    }
  }, []);

  const login = async (email: string, password?: string): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    
    // Check if Firebase is available and configured
    if (isFirebaseConfigured && auth && password) {
      try {
        const cred = await signInWithEmailAndPassword(auth, cleanEmail, password);
        const isUserAdmin = cred.user.email?.toLowerCase() === AUTHORIZED_ADMIN_EMAIL.toLowerCase();
        const profile: UserProfile = {
          uid: cred.user.uid,
          email: cred.user.email || cleanEmail,
          displayName: cred.user.displayName || 'Admin',
          isAdmin: isUserAdmin,
        };
        setUser(profile);
        setIsAdminMode(isUserAdmin);
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(profile));
        return { success: true };
      } catch (err: unknown) {
        const error = err as { message?: string };
        return { success: false, error: error.message || 'Firebase authentication failed.' };
      }
    }

    // Phase A / Resilient Preview Mode authentication:
    // Authorized administrative email matches cgkhairi2u@gmail.com
    if (cleanEmail === AUTHORIZED_ADMIN_EMAIL.toLowerCase()) {
      const profile: UserProfile = {
        uid: 'admin-kpmbp-leader',
        email: AUTHORIZED_ADMIN_EMAIL,
        displayName: 'Cikgu Khairi (Contingent Lead)',
        isAdmin: true,
      };
      setUser(profile);
      setIsAdminMode(true);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(profile));
      return { success: true };
    }

    return {
      success: false,
      error: `Email ${cleanEmail} is not registered in the administrator allowlist. Please use ${AUTHORIZED_ADMIN_EMAIL}`,
    };
  };

  const logout = async () => {
    if (isFirebaseConfigured && auth) {
      try {
        await firebaseSignOut(auth);
      } catch (e) {
        console.error(e);
      }
    }
    setUser(null);
    setIsAdminMode(false);
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem(ADMIN_MODE_KEY);
  };

  const isAdmin = Boolean(user?.isAdmin);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin,
        isAdminMode: isAdmin && isAdminMode,
        setIsAdminMode,
        login,
        logout,
        authorizedEmail: AUTHORIZED_ADMIN_EMAIL,
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
