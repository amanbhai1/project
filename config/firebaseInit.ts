import app from '@react-native-firebase/app';
const initializeApp = app.initializeApp;
const getApps = app().getApps;
import firebaseConfig from './firebaseConfig';

let initialized = false;

export function ensureFirebaseInitialized() {
  if (!initialized) {
    if (getApps().length === 0) {
      initializeApp(firebaseConfig);
    }
    initialized = true;
  }
}
