import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';
import { getStorage } from 'firebase/storage';

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'demo-api-key',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'demo.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'demo-project',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'demo-project.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '123456789',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:123456789:web:abcdef',
};

// Validate Firebase config
const hasValidConfig = import.meta.env.VITE_FIREBASE_API_KEY && 
                       import.meta.env.VITE_FIREBASE_API_KEY !== 'demo-api-key' &&
                       import.meta.env.VITE_FIREBASE_API_KEY.length > 20 && // Firebase API keys are usually 39 chars
                       import.meta.env.VITE_FIREBASE_PROJECT_ID &&
                       import.meta.env.VITE_FIREBASE_PROJECT_ID !== 'demo-project';

if (!hasValidConfig) {
  console.error('❌ Firebase configuration is missing or invalid!');
  console.error('');
  if (!import.meta.env.VITE_FIREBASE_API_KEY) {
    console.error('❌ VITE_FIREBASE_API_KEY is missing');
  } else if (import.meta.env.VITE_FIREBASE_API_KEY === 'demo-api-key') {
    console.error('❌ VITE_FIREBASE_API_KEY is still set to demo value');
  } else if (import.meta.env.VITE_FIREBASE_API_KEY.length <= 20) {
    console.error('❌ VITE_FIREBASE_API_KEY appears to be too short (should be ~39 characters)');
  }
  if (!import.meta.env.VITE_FIREBASE_PROJECT_ID) {
    console.error('❌ VITE_FIREBASE_PROJECT_ID is missing');
  }
  console.error('');
  console.error('Please check your .env file in the project root.');
  console.error('Make sure you RESTARTED the dev server after creating/updating .env');
  console.error('');
}

let app;
let auth;
let db;
let functions;
let storage;

try {
  // Initialize Firebase
  app = initializeApp(firebaseConfig);

  // Initialize services
  auth = getAuth(app);
  db = getFirestore(app);
  functions = getFunctions(app);
  storage = getStorage(app);

  // Enable offline persistence
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.');
    } else if (err.code === 'unimplemented') {
      console.warn('The current browser does not support all of the features required for persistence.');
    }
  });
} catch (error) {
  console.error('❌ Firebase initialization error:', error);
  console.error('Please check your Firebase configuration in .env file');
  // Ensure storage is initialized even if there's an error
  if (app && !storage) {
    try {
      storage = getStorage(app);
    } catch (storageError) {
      console.error('❌ Failed to initialize storage:', storageError);
    }
  }
}

export { auth, db, functions, storage };
export const config = firebaseConfig; // Export config for scripts
export default app;
