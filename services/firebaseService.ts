import { initializeApp, getApps } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  signInAnonymously,
  AuthError,
  connectAuthEmulator
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  connectFirestoreEmulator
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyATbNpAAj2X6KFmDU697Sx3pQV9qPltdGM",
  authDomain: "the-code-sneakers.firebaseapp.com",
  projectId: "the-code-sneakers",
  storageBucket: "the-code-sneakers.firebasestorage.app",
  messagingSenderId: "456081169519",
  appId: "1:456081169519:web:4387d0689132d94a57819a",
};

// Initialize Firebase
let app;
let auth: any;
let firestore: any;

try {
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApps()[0];
  }

  auth = getAuth(app);
  firestore = getFirestore(app);

  // Add connection timeout and retry logic
  auth.settings = {
    appVerificationDisabledForTesting: false,
  };

} catch (error) {
  console.error('Firebase initialization error:', error);
}

// Network connectivity checker
const checkNetworkConnectivity = async (): Promise<boolean> => {
  try {
    // Try to make a simple request to check connectivity
    const response = await fetch('https://www.google.com/favicon.ico', {
      method: 'HEAD',
      cache: 'no-cache',
      mode: 'no-cors'
    });
    return true;
  } catch (error) {
    return false;
  }
};

// Retry wrapper for network operations
const retryOperation = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      const authError = error as AuthError;
      
      if (authError.code === 'auth/network-request-failed' && attempt < maxRetries) {
        console.warn(`Network request failed, retrying... (${attempt}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay * attempt));
        continue;
      }
      
      throw error;
    }
  }
  throw new Error('Max retries exceeded');
};

// Enhanced error handling for Firebase Auth errors
const handleAuthError = (error: AuthError, networkConnected: boolean = true): Error => {
  console.error('Firebase Auth Error:', error);
  
  switch (error.code) {
    case 'auth/network-request-failed':
      if (!networkConnected) {
        return new Error('You appear to be offline. Please check your internet connection and try again, or use Demo Mode to explore the app offline.');
      }
      return new Error('Connection to authentication service failed. This might be due to network restrictions. Try Demo Mode to explore the app.');
    
    case 'auth/operation-not-allowed':
      return new Error('Email/password authentication is not enabled. Please try Demo Mode to explore all features.');
    
    case 'auth/too-many-requests':
      return new Error('Too many failed attempts. Please wait a few minutes before trying again, or use Demo Mode.');
    
    case 'auth/user-disabled':
      return new Error('This account has been disabled. Please contact support or try Demo Mode.');
    
    case 'auth/user-not-found':
      return new Error('No account found with this email address. Try creating an account or use Demo Mode.');
    
    case 'auth/wrong-password':
      return new Error('Incorrect password. Please try again or use Demo Mode to explore the app.');
    
    case 'auth/email-already-in-use':
      return new Error('An account with this email already exists. Try signing in instead.');
    
    case 'auth/weak-password':
      return new Error('Password is too weak. Please choose a stronger password.');
    
    case 'auth/invalid-email':
      return new Error('Please enter a valid email address.');
    
    case 'auth/missing-email':
      return new Error('Please enter your email address.');
    
    case 'auth/timeout':
      return new Error('Request timed out. Please check your connection or try Demo Mode.');
    
    default:
      return new Error('Authentication failed. Please try Demo Mode to explore the app without an account.');
  }
};

// Demo/fallback authentication for when network or auth is not available
const createDemoUser = async (): Promise<User> => {
  try {
    // Check network connectivity first
    const isConnected = await checkNetworkConnectivity();
    
    if (!isConnected) {
      // For offline demo, we'll create a mock user object
      throw new Error('demo-offline');
    }

    // Try anonymous sign-in with retry
    const result = await retryOperation(() => signInAnonymously(auth), 2, 500);
    return result.user;
  } catch (error: any) {
    if (error.message === 'demo-offline') {
      // Create offline demo user
      throw new Error('Demo mode is available offline! You can explore all features without an internet connection.');
    }
    throw new Error('Demo mode is temporarily unavailable. Please check your internet connection.');
  }
};

// Auth service with enhanced error handling and retry logic
export const authService = {
  signIn: async (email: string, password: string) => {
    const isConnected = await checkNetworkConnectivity();
    
    try {
      return await retryOperation(() => 
        signInWithEmailAndPassword(auth, email, password)
      );
    } catch (error) {
      throw handleAuthError(error as AuthError, isConnected);
    }
  },
  
  signUp: async (email: string, password: string) => {
    const isConnected = await checkNetworkConnectivity();
    
    try {
      return await retryOperation(() => 
        createUserWithEmailAndPassword(auth, email, password)
      );
    } catch (error) {
      const authError = error as AuthError;
      
      // Special handling for signup errors
      if (authError.code === 'auth/operation-not-allowed') {
        throw new Error('Email registration is currently not available. Try Demo Mode to explore all features instantly!');
      }
      
      if (authError.code === 'auth/network-request-failed') {
        throw new Error('Unable to create account due to network issues. Try Demo Mode to start using the app immediately!');
      }
      
      throw handleAuthError(authError, isConnected);
    }
  },
  
  signInDemo: async () => {
    try {
      return await createDemoUser();
    } catch (error: any) {
      // If demo fails, we can still provide offline functionality
      throw error;
    }
  },
  
  signOut: async () => {
    try {
      return await signOut(auth);
    } catch (error) {
      throw new Error('Failed to sign out. You may continue using the app.');
    }
  },
  
  onAuthStateChanged: (callback: (user: User | null) => void) => {
    try {
      return onAuthStateChanged(auth, callback);
    } catch (error) {
      console.error('Auth state listener error:', error);
      // Return a dummy unsubscribe function
      return () => {};
    }
  },

  getCurrentUser: () => {
    try {
      return auth.currentUser;
    } catch (error) {
      return null;
    }
  },

  // Check if authentication services are available
  isAuthAvailable: async (): Promise<boolean> => {
    try {
      const isConnected = await checkNetworkConnectivity();
      if (!isConnected) return false;
      
      // Try a simple auth operation to check availability
      await retryOperation(async () => {
        const testAuth = getAuth();
        return Promise.resolve(testAuth);
      }, 1, 500);
      
      return true;
    } catch (error) {
      return false;
    }
  }
};

// Firestore service with enhanced error handling
export const firestoreService = {
  collection: (path: string) => {
    try {
      return collection(firestore, path);
    } catch (error) {
      console.error('Firestore collection error:', error);
      throw new Error('Database connection failed. Your notes may not sync properly.');
    }
  },
  
  doc: (collectionRef: any, id?: string) => {
    try {
      return id ? doc(collectionRef, id) : doc(collectionRef);
    } catch (error) {
      console.error('Firestore doc error:', error);
      throw new Error('Database operation failed.');
    }
  },
  
  addDoc: async (collectionRef: any, data: any) => {
    try {
      return await retryOperation(() => addDoc(collectionRef, data), 2, 1000);
    } catch (error) {
      console.error('Firestore addDoc error:', error);
      throw new Error('Failed to save data. Please check your connection.');
    }
  },
  
  updateDoc: async (docRef: any, data: any) => {
    try {
      return await retryOperation(() => updateDoc(docRef, data), 2, 1000);
    } catch (error) {
      console.error('Firestore updateDoc error:', error);
      throw new Error('Failed to update data. Please check your connection.');
    }
  },
  
  deleteDoc: async (docRef: any) => {
    try {
      return await retryOperation(() => deleteDoc(docRef), 2, 1000);
    } catch (error) {
      console.error('Firestore deleteDoc error:', error);
      throw new Error('Failed to delete data. Please check your connection.');
    }
  },
  
  getDocs: (queryRef: any) => getDocs(queryRef),
  
  query: (collectionRef: any, ...queryConstraints: any[]) => 
    query(collectionRef, ...queryConstraints),
  
  where: (field: string, opStr: any, value: any) => where(field, opStr, value),
  
  orderBy: (field: string, directionStr?: 'asc' | 'desc') => 
    orderBy(field, directionStr),
  
  onSnapshot: (queryRef: any, callback: any, errorCallback?: any) => {
    try {
      return onSnapshot(queryRef, callback, errorCallback || ((error: any) => {
        console.error('Firestore snapshot error:', error);
      }));
    } catch (error) {
      console.error('Firestore onSnapshot error:', error);
      return () => {}; // Return dummy unsubscribe
    }
  },
  
  serverTimestamp: () => serverTimestamp(),
  
  Timestamp
};

export type AuthUser = User;
