import { Platform } from 'react-native';

// Define the auth service interface
interface AuthServiceInterface {
  signIn: (email: string, password: string) => Promise<any>;
  signUp: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<void>;
  onAuthStateChanged: (callback: (user: any) => void) => (() => void);
  getCurrentUser: () => any;
}

// Create platform-specific auth service
const createAuthService = (): AuthServiceInterface => {
  if (Platform.OS === 'web') {
    // Web Firebase v9+ - use dynamic imports to avoid bundling issues
    return {
      async signIn(email: string, password: string) {
        const { signInWithEmailAndPassword } = await import('firebase/auth');
        const { auth } = await import('../config/firebase.web');
        return signInWithEmailAndPassword(auth, email, password);
      },
      
      async signUp(email: string, password: string) {
        const { createUserWithEmailAndPassword } = await import('firebase/auth');
        const { auth } = await import('../config/firebase.web');
        return createUserWithEmailAndPassword(auth, email, password);
      },
      
      async signOut() {
        const { signOut } = await import('firebase/auth');
        const { auth } = await import('../config/firebase.web');
        return signOut(auth);
      },
      
      onAuthStateChanged(callback: (user: any) => void) {
        let unsubscribe: () => void = () => {};
        
        (async () => {
          const { onAuthStateChanged } = await import('firebase/auth');
          const { auth } = await import('../config/firebase.web');
          unsubscribe = onAuthStateChanged(auth, callback);
        })();
        
        return () => unsubscribe();
      },
      
      getCurrentUser() {
        // This will be available after async initialization
        return null;
      }
    };
  } else {
    // React Native Firebase - only import on native platforms
    const auth = require('@react-native-firebase/auth').default;
    
    return {
      signIn: (email: string, password: string) => 
        auth().signInWithEmailAndPassword(email, password),
      
      signUp: (email: string, password: string) => 
        auth().createUserWithEmailAndPassword(email, password),
      
      signOut: () => auth().signOut(),
      
      onAuthStateChanged: (callback: (user: any) => void) => 
        auth().onAuthStateChanged(callback),

      getCurrentUser: () => auth().currentUser
    };
  }
};

export const authService = createAuthService();
