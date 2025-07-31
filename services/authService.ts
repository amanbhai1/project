import { Platform } from 'react-native';

// Platform-specific auth service
if (Platform.OS === 'web') {
  // Web Firebase v9+ imports
  const {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    User
  } = require('firebase/auth');
  
  const { auth } = require('../config/firebase.web');

  export const authService = {
    signIn: (email: string, password: string) => 
      signInWithEmailAndPassword(auth, email, password),
    
    signUp: (email: string, password: string) => 
      createUserWithEmailAndPassword(auth, email, password),
    
    signOut: () => signOut(auth),
    
    onAuthStateChanged: (callback: (user: any) => void) => 
      onAuthStateChanged(auth, callback),

    getCurrentUser: () => auth.currentUser
  };

  export type AuthUser = User;

} else {
  // React Native Firebase
  const auth = require('@react-native-firebase/auth').default;

  export const authService = {
    signIn: (email: string, password: string) => 
      auth().signInWithEmailAndPassword(email, password),
    
    signUp: (email: string, password: string) => 
      auth().createUserWithEmailAndPassword(email, password),
    
    signOut: () => auth().signOut(),
    
    onAuthStateChanged: (callback: (user: any) => void) => 
      auth().onAuthStateChanged(callback),

    getCurrentUser: () => auth().currentUser
  };

  export type AuthUser = import('@react-native-firebase/auth').FirebaseAuthTypes.User;
}
