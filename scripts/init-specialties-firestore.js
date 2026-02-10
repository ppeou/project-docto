/**
 * Script to initialize doctor specialties in Firestore
 * Run with: npm run init:specialties
 * 
 * Requires environment variables (from .env file):
 * - VITE_FIREBASE_API_KEY
 * - VITE_FIREBASE_AUTH_DOMAIN
 * - VITE_FIREBASE_PROJECT_ID
 * - VITE_FIREBASE_STORAGE_BUCKET
 * - VITE_FIREBASE_MESSAGING_SENDER_ID
 * - VITE_FIREBASE_APP_ID
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, getDoc } from 'firebase/firestore';
import { readFileSync } from 'fs';

// Load environment variables from .env file
function loadEnv() {
  try {
    const envFile = readFileSync('.env', 'utf-8');
    const env = {};
    envFile.split('\n').forEach(line => {
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match) {
        env[match[1].trim()] = match[2].trim();
      }
    });
    return env;
  } catch (error) {
    console.error('Error loading .env file:', error.message);
    return {};
  }
}

const env = loadEnv();

const COMMON_SPECIALTIES = [
  'Allergy and Immunology',
  'Anesthesiology',
  'Cardiology',
  'Dermatology',
  'Emergency Medicine',
  'Endocrinology',
  'Family Medicine',
  'Gastroenterology',
  'General Practice',
  'Geriatrics',
  'Hematology',
  'Infectious Disease',
  'Internal Medicine',
  'Nephrology',
  'Neurology',
  'Obstetrics and Gynecology',
  'Oncology',
  'Ophthalmology',
  'Orthopedics',
  'Otolaryngology',
  'Pathology',
  'Pediatrics',
  'Physical Medicine and Rehabilitation',
  'Plastic Surgery',
  'Psychiatry',
  'Pulmonology',
  'Radiology',
  'Rheumatology',
  'Surgery',
  'Urology',
];

// Firebase config for Node.js script
const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID,
};

// Validate config
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.error('❌ Firebase configuration is missing!');
  console.error('Please ensure your .env file contains all required Firebase config variables.');
  process.exit(1);
}

async function initializeSpecialties() {
  // Check if we should use emulator
  const useEmulator = process.env.FIRESTORE_EMULATOR_HOST || process.argv.includes('--emulator');
  
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  
  if (useEmulator) {
    // Connect to emulator (rules are bypassed in emulator)
    const { connectFirestoreEmulator } = await import('firebase/firestore');
    const emulatorHost = process.env.FIRESTORE_EMULATOR_HOST || 'localhost:8080';
    const [host, port] = emulatorHost.split(':');
    connectFirestoreEmulator(db, host, parseInt(port));
    console.log(`Using Firestore emulator at ${host}:${port}\n`);
  }
  
  try {
    console.log('🚀 Initializing doctor specialties in Firestore...\n');
    
    const specialtiesRef = collection(db, 'specialties');
    let addedCount = 0;
    let skippedCount = 0;
    let errors = 0;
    
    for (const specialty of COMMON_SPECIALTIES) {
      try {
        const docId = specialty.toLowerCase().replace(/\s+/g, '-');
        const docRef = doc(specialtiesRef, docId);
        const docSnap = await getDoc(docRef);
        
        if (!docSnap.exists()) {
          await setDoc(docRef, {
            name: specialty,
            createdAt: new Date().toISOString(),
          });
          console.log(`  ✓ Added: ${specialty}`);
          addedCount++;
        } else {
          console.log(`  - Skipped (already exists): ${specialty}`);
          skippedCount++;
        }
      } catch (error) {
        console.error(`  ✗ Error adding ${specialty}:`, error.message);
        errors++;
        if (error.code === 'permission-denied') {
          console.error('     → Permission denied. Try using emulator: npm run init:specialties -- --emulator');
        }
      }
    }
    
    console.log('\n✅ Specialties initialization complete!');
    console.log(`   Added: ${addedCount}`);
    console.log(`   Skipped: ${skippedCount}`);
    console.log(`   Errors: ${errors}`);
    console.log(`   Total: ${COMMON_SPECIALTIES.length}`);
    
    if (errors > 0 && !useEmulator) {
      console.log('\n💡 Tip: If you got permission errors, try using the emulator:');
      console.log('   FIRESTORE_EMULATOR_HOST=localhost:8080 npm run init:specialties');
      console.log('   or: npm run init:specialties -- --emulator');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error initializing specialties:', error);
    process.exit(1);
  }
}

initializeSpecialties();

