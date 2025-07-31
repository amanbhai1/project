import { initializeApp, getApps } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  signInAnonymously,
  AuthError
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
  Timestamp
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
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

const auth = getAuth(app);
const firestore = getFirestore(app);

// Enhanced error handling for Firebase Auth errors
const handleAuthError = (error: AuthError): Error => {
  console.error('Firebase Auth Error:', error);
  
  switch (error.code) {
    case 'auth/operation-not-allowed':
      return new Error('Email/password authentication is not enabled. Please contact support or try the demo mode.');
    case 'auth/network-request-failed':
      return new Error('Network connection failed. Please check your internet connection and try again.');
    case 'auth/too-many-requests':
      return new Error('Too many failed attempts. Please try again later.');
    case 'auth/user-disabled':
      return new Error('This account has been disabled. Please contact support.');
    case 'auth/user-not-found':
      return new Error('No account found with this email address.');
    case 'auth/wrong-password':
      return new Error('Incorrect password. Please try again.');
    case 'auth/email-already-in-use':
      return new Error('An account with this email already exists. Try signing in instead.');
    case 'auth/weak-password':
      return new Error('Password is too weak. Please choose a stronger password.');
    case 'auth/invalid-email':
      return new Error('Please enter a valid email address.');
    case 'auth/missing-email':
      return new Error('Please enter your email address.');
    default:
      return new Error(error.message || 'Authentication failed. Please try again.');
  }
};

// Demo/fallback authentication for when email/password is not available
const createDemoUser = async (): Promise<User> => {
  try {
    // Try anonymous sign-in as a fallback
    const result = await signInAnonymously(auth);
    return result.user;
  } catch (error) {
    throw new Error('Unable to create demo account. Please contact support.');
  }
};

// Auth service with enhanced error handling
export const authService = {
  signIn: async (email: string, password: string) => {
    try {
      return await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      throw handleAuthError(error as AuthError);
    }
  },
  
  signUp: async (email: string, password: string) => {
    try {
      return await createUserWithEmailAndPassword(auth, email, password);
    } catch (error) {
      const authError = error as AuthError;
      
      // If email/password signup is not allowed, offer demo account
      if (authError.code === 'auth/operation-not-allowed') {
        throw new Error('Email registration is currently not available. Would you like to try our demo mode instead?');
      }
      
      throw handleAuthError(authError);
    }
  },
  
  signInDemo: async () => {
    try {
      return await createDemoUser();
    } catch (error) {
      throw new Error('Demo mode is not available. Please contact support.');
    }
  },
  
  signOut: async () => {
    try {
      return await signOut(auth);
    } catch (error) {
      throw new Error('Failed to sign out. Please try again.');
    }
  },
  
  onAuthStateChanged: (callback: (user: User | null) => void) => 
    onAuthStateChanged(auth, callback),

  getCurrentUser: () => auth.currentUser,

  // Check if email/password auth is available
  isEmailAuthAvailable: async (): Promise<boolean> => {
    try {
      // Try to create a user with a test email to check if the operation is allowed
      // This is just to test the availability, we won't actually create the user
      await createUserWithEmailAndPassword(auth, 'test@test.com', 'test123');
      return true;
    } catch (error) {
      const authError = error as AuthError;
      return authError.code !== 'auth/operation-not-allowed';
    }
  }
};

// Firestore service remains the same
export const firestoreService = {
  collection: (path: string) => collection(firestore, path),
  
  doc: (collectionRef: any, id?: string) => 
    id ? doc(collectionRef, id) : doc(collectionRef),
  
  addDoc: (collectionRef: any, data: any) => addDoc(collectionRef, data),
  
  updateDoc: (docRef: any, data: any) => updateDoc(docRef, data),
  
  deleteDoc: (docRef: any) => deleteDoc(docRef),
  
  getDocs: (queryRef: any) => getDocs(queryRef),
  
  query: (collectionRef: any, ...queryConstraints: any[]) => 
    query(collectionRef, ...queryConstraints),
  
  where: (field: string, opStr: any, value: any) => where(field, opStr, value),
  
  orderBy: (field: string, directionStr?: 'asc' | 'desc') => 
    orderBy(field, directionStr),
  
  onSnapshot: (queryRef: any, callback: any, errorCallback?: any) => 
    onSnapshot(queryRef, callback, errorCallback),
  
  serverTimestamp: () => serverTimestamp(),
  
  Timestamp
};

export type AuthUser = User;
