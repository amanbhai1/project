import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService, AuthUser } from '@/services/firebaseService';
import {
  offlineDemoService,
  OFFLINE_DEMO_USER,
} from '@/services/offlineDemoService';
import { Platform } from 'react-native';

// Define a universal user type
interface AppUser {
  uid: string;
  email: string | null;
  displayName?: string | null;
  emailVerified?: boolean;
  isAnonymous?: boolean;
  isDemo?: boolean;
  isOffline?: boolean;
}

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  isOfflineMode: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signInOfflineDemo: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  useEffect(() => {
    let mounted = true;

    // Check if we should start in offline mode
    const initializeAuth = async () => {
      try {
        // Check if authentication services are available
        const authAvailable = await authService.isAuthAvailable();

        if (!authAvailable) {
          console.log(
            'Firebase auth not available, checking for offline demo...',
          );
          // Check if we have an offline demo session
          const offlineUser = await checkOfflineDemoSession();
          if (offlineUser && mounted) {
            setUser(offlineUser);
            setIsOfflineMode(true);
            setLoading(false);
            return;
          }
        }

        // Try normal Firebase auth
        const unsubscribe = authService.onAuthStateChanged((firebaseUser) => {
          if (mounted) {
            if (firebaseUser) {
              // Convert Firebase user to our universal user format
              const appUser: AppUser = {
                uid: firebaseUser.uid,
                email:
                  firebaseUser.email ||
                  (firebaseUser.isAnonymous ? 'demo@notes-app.com' : null),
                displayName:
                  firebaseUser.displayName ||
                  (firebaseUser.isAnonymous ? 'Demo User' : null),
                emailVerified: firebaseUser.emailVerified,
                isAnonymous: firebaseUser.isAnonymous,
                isDemo: firebaseUser.isAnonymous,
                isOffline: false,
              };
              setUser(appUser);
              setIsOfflineMode(false);
            } else {
              setUser(null);
              setIsOfflineMode(false);
            }
            setLoading(false);
          }
        });

        return () => {
          mounted = false;
          if (typeof unsubscribe === 'function') {
            unsubscribe();
          }
        };
      } catch (error) {
        console.error('Auth initialization error:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();
  }, []);

  // Check for existing offline demo session
  const checkOfflineDemoSession = async (): Promise<AppUser | null> => {
    try {
      // In a real app, you might check AsyncStorage for a demo session token
      // For now, we'll return null and let users explicitly start demo mode
      return null;
    } catch (error) {
      return null;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      await authService.signIn(email, password);
      setIsOfflineMode(false);
    } catch (error: any) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      await authService.signUp(email, password);
      setIsOfflineMode(false);
    } catch (error: any) {
      console.error('Sign up error:', error);
      throw error;
    }
  };

  const signInOfflineDemo = async () => {
    try {
      // First try Firebase demo mode
      try {
        await authService.signInDemo();
        setIsOfflineMode(false);
        return;
      } catch (firebaseError) {
        console.log(
          'Firebase demo failed, starting offline demo:',
          firebaseError,
        );
      }

      // If Firebase fails, start offline demo
      await offlineDemoService.initialize();
      const demoUser: AppUser = {
        ...OFFLINE_DEMO_USER,
      };

      setUser(demoUser);
      setIsOfflineMode(true);
    } catch (error: any) {
      console.error('Demo sign in error:', error);
      throw new Error('Demo mode failed to start. Please try again.');
    }
  };

  const signOut = async () => {
    try {
      if (isOfflineMode) {
        // Clear offline demo session
        await offlineDemoService.clearDemoData();
        setUser(null);
        setIsOfflineMode(false);
      } else {
        await authService.signOut();
        setIsOfflineMode(false);
      }
    } catch (error: any) {
      console.error('Sign out error:', error);
      // Even if sign out fails, clear local user state
      setUser(null);
      setIsOfflineMode(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isOfflineMode,
        signIn,
        signUp,
        signInOfflineDemo,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
