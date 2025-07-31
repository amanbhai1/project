import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService, AuthUser } from '@/services/firebaseService';
import { Platform } from 'react-native';

// Define a universal user type
interface AppUser {
  uid: string;
  email: string | null;
  displayName?: string | null;
  emailVerified?: boolean;
  isAnonymous?: boolean;
  isDemo?: boolean;
}

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    
    const unsubscribe = authService.onAuthStateChanged((firebaseUser) => {
      if (mounted) {
        if (firebaseUser) {
          // Convert Firebase user to our universal user format
          const appUser: AppUser = {
            uid: firebaseUser.uid,
            email: firebaseUser.email || (firebaseUser.isAnonymous ? 'demo@notes-app.com' : null),
            displayName: firebaseUser.displayName || (firebaseUser.isAnonymous ? 'Demo User' : null),
            emailVerified: firebaseUser.emailVerified,
            isAnonymous: firebaseUser.isAnonymous,
            isDemo: firebaseUser.isAnonymous, // Anonymous users are demo users
          };
          setUser(appUser);
        } else {
          setUser(null);
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
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      await authService.signIn(email, password);
    } catch (error: any) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      await authService.signUp(email, password);
    } catch (error: any) {
      console.error('Sign up error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await authService.signOut();
    } catch (error: any) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
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
