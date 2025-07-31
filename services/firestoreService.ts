import { Platform } from 'react-native';

// Define the firestore service interface
interface FirestoreServiceInterface {
  collection: (path: string) => any;
  doc: (collectionRef: any, id?: string) => any;
  addDoc: (collectionRef: any, data: any) => Promise<any>;
  updateDoc: (docRef: any, data: any) => Promise<void>;
  deleteDoc: (docRef: any) => Promise<void>;
  getDocs: (queryRef: any) => Promise<any>;
  query: (collectionRef: any, ...queryConstraints: any[]) => any;
  where: (field: string, opStr: any, value: any) => any;
  orderBy: (field: string, directionStr?: 'asc' | 'desc') => any;
  onSnapshot: (queryRef: any, callback: any, errorCallback?: any) => (() => void);
  serverTimestamp: () => any;
  Timestamp: any;
}

// Create platform-specific firestore service
const createFirestoreService = (): FirestoreServiceInterface => {
  if (Platform.OS === 'web') {
    // Web Firebase v9+ - use async pattern for web
    let webFirestore: any = null;
    let webFunctions: any = null;
    
    const initWeb = async () => {
      if (!webFunctions) {
        webFunctions = await import('firebase/firestore');
        const { firestore } = await import('../config/firebase.web');
        webFirestore = firestore;
      }
      return { firestore: webFirestore, functions: webFunctions };
    };

    return {
      collection: (path: string) => {
        // Return a proxy that will work with async initialization
        return {
          _path: path,
          _isWebCollection: true
        };
      },
      
      doc: (collectionRef: any, id?: string) => {
        return {
          _collectionRef: collectionRef,
          _id: id,
          _isWebDoc: true
        };
      },
      
      async addDoc(collectionRef: any, data: any) {
        const { firestore, functions } = await initWeb();
        const collection = functions.collection(firestore, collectionRef._path);
        return functions.addDoc(collection, data);
      },
      
      async updateDoc(docRef: any, data: any) {
        const { firestore, functions } = await initWeb();
        const collection = functions.collection(firestore, docRef._collectionRef._path);
        const doc = functions.doc(collection, docRef._id);
        return functions.updateDoc(doc, data);
      },
      
      async deleteDoc(docRef: any) {
        const { firestore, functions } = await initWeb();
        const collection = functions.collection(firestore, docRef._collectionRef._path);
        const doc = functions.doc(collection, docRef._id);
        return functions.deleteDoc(doc);
      },
      
      async getDocs(queryRef: any) {
        const { firestore, functions } = await initWeb();
        return functions.getDocs(queryRef._webQuery);
      },
      
      query: (collectionRef: any, ...queryConstraints: any[]) => {
        return {
          _collectionRef: collectionRef,
          _constraints: queryConstraints,
          _isWebQuery: true
        };
      },
      
      where: (field: string, opStr: any, value: any) => {
        return { _type: 'where', field, opStr, value };
      },
      
      orderBy: (field: string, directionStr?: 'asc' | 'desc') => {
        return { _type: 'orderBy', field, directionStr };
      },
      
      onSnapshot: (queryRef: any, callback: any, errorCallback?: any) => {
        let unsubscribe = () => {};
        
        (async () => {
          const { firestore, functions } = await initWeb();
          const collection = functions.collection(firestore, queryRef._collectionRef._path);
          
          // Build query with constraints
          let query = collection;
          for (const constraint of queryRef._constraints) {
            if (constraint._type === 'where') {
              query = functions.query(query, functions.where(constraint.field, constraint.opStr, constraint.value));
            } else if (constraint._type === 'orderBy') {
              query = functions.query(query, functions.orderBy(constraint.field, constraint.directionStr));
            }
          }
          
          unsubscribe = functions.onSnapshot(query, callback, errorCallback);
        })();
        
        return () => unsubscribe();
      },
      
      async serverTimestamp() {
        const { functions } = await initWeb();
        return functions.serverTimestamp();
      },
      
      get Timestamp() {
        return null; // Will be set async
      }
    };
  } else {
    // React Native Firebase
    const firestore = require('@react-native-firebase/firestore').default;

    return {
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
};

export const firestoreService = createFirestoreService();
