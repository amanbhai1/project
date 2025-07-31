import { Platform } from 'react-native';

let authService: any;
let AuthUser: any;

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

  authService = {
    signIn: (email: string, password: string) => 
      signInWithEmailAndPassword(auth, email, password),
    
    signUp: (email: string, password: string) => 
      createUserWithEmailAndPassword(auth, email, password),
    
    signOut: () => signOut(auth),
    
    onAuthStateChanged: (callback: (user: any) => void) => 
      onAuthStateChanged(auth, callback),

    getCurrentUser: () => auth.currentUser
  };

  AuthUser = User;

} else {
  // React Native Firebase
  const auth = require('@react-native-firebase/auth').default;

  authService = {
    signIn: (email: string, password: string) => 
      auth().signInWithEmailAndPassword(email, password),
    
    signUp: (email: string, password: string) => 
      auth().createUserWithEmailAndPassword(email, password),
    
    signOut: () => auth().signOut(),
    
    onAuthStateChanged: (callback: (user: any) => void) => 
      auth().onAuthStateChanged(callback),

    getCurrentUser: () => auth().currentUser
  };

  // For React Native Firebase, we'll use the FirebaseAuthTypes.User
  AuthUser = null; // Will be typed properly in usage
}

export { authService };
export type { AuthUser };
