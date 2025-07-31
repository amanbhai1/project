import { Platform } from 'react-native';

// Platform-specific Firebase exports
let auth: any;
let firestore: any;

if (Platform.OS === 'web') {
  const webFirebase = require('./firebase.web');
  auth = webFirebase.auth;
  firestore = webFirebase.firestore;
} else {
  const nativeFirebase = require('./firebase.native');
  auth = nativeFirebase.auth;
  firestore = nativeFirebase.firestore;
}

export { auth, firestore };

// For backward compatibility
export const firebaseConfig = {
  apiKey: "AIzaSyATbNpAAj2X6KFmDU697Sx3pQV9qPltdGM",
  authDomain: "the-code-sneakers.firebaseapp.com",
  projectId: "the-code-sneakers",
  storageBucket: "the-code-sneakers.firebasestorage.app",
  messagingSenderId: "456081169519",
  appId: "1:456081169519:web:4387d0689132d94a57819a",
};

export default firebaseConfig;
