import React, { createContext, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';

// Mock user type for web compatibility
interface User {
  uid: string;
  email: string | null;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  // For demo purposes, create a mock authentication system
  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      // Mock authentication - in a real app, this would call Firebase
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
      const mockUser: User = {
        uid: 'demo-user-' + Date.now(),
        email: email
      };
      setUser(mockUser);
      console.log('Mock user signed in:', email);
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      setLoading(true);
      // Mock authentication - in a real app, this would call Firebase
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
      const mockUser: User = {
        uid: 'demo-user-' + Date.now(),
        email: email
      };
      setUser(mockUser);
      console.log('Mock user signed up:', email);
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
      setUser(null);
      console.log('Mock user signed out');
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
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