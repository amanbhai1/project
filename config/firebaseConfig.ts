import { Platform } from 'react-native';

export const firebaseConfig = {
  apiKey: "AIzaSyATbNpAAj2X6KFmDU697Sx3pQV9qPltdGM",
  authDomain: "the-code-sneakers.firebaseapp.com",
  projectId: "the-code-sneakers",
  storageBucket: "the-code-sneakers.firebasestorage.app",
  messagingSenderId: "456081169519",
  appId: "1:456081169519:web:4387d0689132d94a57819a",
};

// Initialize Firebase based on platform
let firebaseApp: any = null;

if (Platform.OS === 'web') {
  // For web, use Firebase web SDK
  try {
    const { initializeApp, getApps } = require('firebase/app');
    if (getApps().length === 0) {
      firebaseApp = initializeApp(firebaseConfig);
      console.log('Firebase initialized for web');
    }
  } catch (error) {
    console.error('Error initializing Firebase for web:', error);
  }
} else {
  // For native platforms, use React Native Firebase
  try {
    const { getApps } = require('@react-native-firebase/app');
    const { default: app } = require('@react-native-firebase/app');
    
    if (getApps().length === 0) {
      firebaseApp = app().initializeApp(firebaseConfig);
      console.log('Firebase initialized for native');
    }
  } catch (error) {
    console.error('Error initializing Firebase for native:', error);
  }
}

export default firebaseConfig;