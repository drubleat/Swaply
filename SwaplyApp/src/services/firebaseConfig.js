import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore } from 'firebase/firestore';

// firebase config bilgilerimiz
const firebaseConfig = {
  apiKey: "AIzaSyAPtcdIyPQTfLl4GgLa6At4dWe7VIhApDo",
  authDomain: "swaply-aa22a.firebaseapp.com",
  projectId: "swaply-aa22a",
  storageBucket: "swaply-aa22a.firebasestorage.app",
  messagingSenderId: "615979080184",
  appId: "1:615979080184:web:c7fd8b34ce5855bbbd1e0d",
  measurementId: "G-2KS9B8BVVD"
};


const app = initializeApp(firebaseConfig);

//persistance ayarı ile auth'un başlatılması.
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

// dbnin başlatılması
const db = getFirestore(app);

export { app, auth, db };