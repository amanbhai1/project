import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '@/services/authService';
import { Platform } from 'react-native';

// Define a universal user type
interface AuthUser {
  uid: string;
  email: string | null;
  displayName?: string | null;
  emailVerified?: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    
    const unsubscribe = authService.onAuthStateChanged((firebaseUser: any) => {
      if (mounted) {
        if (firebaseUser) {
          // Convert Firebase user to our universal user format
          const authUser: AuthUser = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            emailVerified: Platform.OS === 'web' ? firebaseUser.emailVerified : firebaseUser.emailVerified,
          };
          setUser(authUser);
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
    } catch (error) {
      throw error;
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      await authService.signUp(email, password);
    } catch (error) {
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await authService.signOut();
    } catch (error) {
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
