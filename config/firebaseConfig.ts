import { Platform } from 'react-native';

// Export Firebase auth and firestore based on platform
export let auth: any;
export let firestore: any;

if (Platform.OS === 'web') {
  // Import web Firebase
  try {
    const webAuth = require('./firebase.web').auth;
    const webFirestore = require('./firebase.web').firestore;
    auth = webAuth;
    firestore = webFirestore;
  } catch (error) {
    console.error('Failed to initialize web Firebase:', error);
  }
} else {
  // Import React Native Firebase
  try {
    const nativeAuth = require('@react-native-firebase/auth').default;
    const nativeFirestore = require('@react-native-firebase/firestore').default;
    auth = nativeAuth;
    firestore = nativeFirestore;
  } catch (error) {
    console.error('Failed to initialize native Firebase:', error);
  }
}

// For backward compatibility
export const firebaseConfig = {
  apiKey: "AIzaSyATbNpAAj2X6KFmDU697Sx3pQV9qPltdGM",
  authDomain: "the-code-sneakers.firebaseapp.com",
  projectId: "the-code-sneakers",
  storageBucket: "the-code-sneakers.firebasestorage.app",
  messagingSenderId: "456081169519",
  appId: "1:456081169519:web:4387d0689132d94a57819a57819a",
};

export default firebaseConfig;
