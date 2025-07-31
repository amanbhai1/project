import { Platform } from 'react-native';

let firestoreService: any;

if (Platform.OS === 'web') {
  // Web Firebase v9+ imports
  const {
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
  } = require('firebase/firestore');
  
  const { firestore } = require('../config/firebase.web');

  firestoreService = {
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

} else {
  // React Native Firebase
  const firestore = require('@react-native-firebase/firestore').default;

  firestoreService = {
    collection: (path: string) => firestore().collection(path),
    
    doc: (collectionRef: any, id?: string) => 
      id ? collectionRef.doc(id) : collectionRef.doc(),
    
    addDoc: (collectionRef: any, data: any) => collectionRef.add(data),
    
    updateDoc: (docRef: any, data: any) => docRef.update(data),
    
    deleteDoc: (docRef: any) => docRef.delete(),
    
    getDocs: (queryRef: any) => queryRef.get(),
    
    query: (collectionRef: any) => collectionRef,
    
    where: (collectionRef: any, field: string, opStr: any, value: any) => 
      collectionRef.where(field, opStr, value),
    
    orderBy: (queryRef: any, field: string, directionStr?: 'asc' | 'desc') => 
      queryRef.orderBy(field, directionStr),
    
    onSnapshot: (queryRef: any, callback: any, errorCallback?: any) => 
      queryRef.onSnapshot(callback, errorCallback),
    
    serverTimestamp: () => firestore.FieldValue.serverTimestamp(),
    
    Timestamp: firestore.Timestamp
  };
}

export { firestoreService };
