import { initializeApp, getApps } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User
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

// Auth service
export const authService = {
  signIn: (email: string, password: string) => 
    signInWithEmailAndPassword(auth, email, password),
  
  signUp: (email: string, password: string) => 
    createUserWithEmailAndPassword(auth, email, password),
  
  signOut: () => signOut(auth),
  
  onAuthStateChanged: (callback: (user: User | null) => void) => 
    onAuthStateChanged(auth, callback),

  getCurrentUser: () => auth.currentUser
};

// Firestore service
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
