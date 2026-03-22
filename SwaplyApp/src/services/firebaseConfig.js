import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// firebase config bilgilerimiz
const firebaseConfig = {
  apiKey: "AIzaSyA4YJnDQOCuMjg3GbpkqqVoTgliAU45ZK4",
  authDomain: "swaplylatest.firebaseapp.com",
  projectId: "swaplylatest",
  storageBucket: "swaplylatest.firebasestorage.app",
  messagingSenderId: "18092993583",
  appId: "1:18092993583:web:e5b9f413325652d4ddaada"
};


const app = initializeApp(firebaseConfig);

//persistance ayarı ile auth'un başlatılması.
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

// dbnin ve storage'ın başlatılması
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };