import { FirebaseOptions } from '@react-native-firebase/app';

export const firebaseConfig: FirebaseOptions = {
  apiKey: "AIzaSyATbNpAAj2X6KFmDU697Sx3pQV9qPltdGM",
  authDomain: "the-code-sneakers.firebaseapp.com",
  projectId: "the-code-sneakers",
  storageBucket: "the-code-sneakers.firebasestorage.app",
  messagingSenderId: "456081169519",
  appId: "1:456081169519:web:4387d0689132d94a57819a",
};

export default firebaseConfig;

export const initializeFirebase = () => {
  if (getApps.length === 0) {
    app().initializeApp(firebaseConfig);
  }
};

export default firebaseConfig;