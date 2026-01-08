import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, getDoc, Timestamp } from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
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

// Firebase config for Node.js script
const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID,
};

const FREQUENCY_OPTIONS = [
  // Hourly intervals
  { label: "Every 4 hours", intervalValue: 4, intervalUnit: "hour", displayOrder: 1 },
  { label: "Every 6 hours", intervalValue: 6, intervalUnit: "hour", displayOrder: 2 },
  { label: "Every 8 hours", intervalValue: 8, intervalUnit: "hour", displayOrder: 3 },
  { label: "Every 12 hours", intervalValue: 12, intervalUnit: "hour", displayOrder: 4 },
  
  // Multiple times per day
  { label: "4 times per day", intervalValue: 6, intervalUnit: "hour", displayOrder: 5 },
  { label: "3 times per day", intervalValue: 8, intervalUnit: "hour", displayOrder: 6 },
  { label: "2 times per day", intervalValue: 12, intervalUnit: "hour", displayOrder: 7 },
  
  // Daily
  { label: "Once daily", intervalValue: 1, intervalUnit: "day", displayOrder: 8 },
  { label: "Once per day", intervalValue: 1, intervalUnit: "day", displayOrder: 9 },
  
  // Weekly
  { label: "Once per week", intervalValue: 7, intervalUnit: "day", displayOrder: 10 },
  { label: "Twice per week", intervalValue: 3.5, intervalUnit: "day", displayOrder: 11 },
  { label: "Every 2 weeks", intervalValue: 14, intervalUnit: "day", displayOrder: 12 },
  
  // Monthly
  { label: "Once per month", intervalValue: 1, intervalUnit: "month", displayOrder: 13 },
  { label: "Every 2 months", intervalValue: 2, intervalUnit: "month", displayOrder: 14 },
  
  // As needed
  { label: "As needed", intervalValue: null, intervalUnit: "as_needed", displayOrder: 15 },
];

async function initializeFrequencyOptions() {
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
    console.log(`Using Firestore emulator at ${host}:${port}`);
  }
  
  console.log('Initializing frequency options...\n');
  
  let added = 0;
  let skipped = 0;
  let errors = 0;
  
  for (const option of FREQUENCY_OPTIONS) {
    try {
      // Create a document ID from the label
      const docId = option.label.toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');
      
      const docRef = doc(collection(db, 'frequencyOptions'), docId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        await setDoc(docRef, {
          ...option,
          isActive: true,
          created: {
            on: Timestamp.now(),
          },
          updated: {
            on: Timestamp.now(),
          },
        });
        console.log(`✓ Added: ${option.label}`);
        added++;
      } else {
        console.log(`- Skipped (exists): ${option.label}`);
        skipped++;
      }
    } catch (error) {
      console.error(`✗ Error adding ${option.label}:`, error.message);
      errors++;
      if (error.code === 'permission-denied') {
        console.error('   → Permission denied. Try using emulator: node scripts/init-frequency-options.js --emulator');
      }
    }
  }
  
  console.log(`\nFrequency options initialization complete!`);
  console.log(`Added: ${added}, Skipped: ${skipped}, Errors: ${errors}`);
  
  if (errors > 0 && !useEmulator) {
    console.log('\nTip: If you got permission errors, try using the emulator:');
    console.log('   FIRESTORE_EMULATOR_HOST=localhost:8080 node scripts/init-frequency-options.js');
    console.log('   or: node scripts/init-frequency-options.js --emulator');
  }
  
  process.exit(0);
}

initializeFrequencyOptions().catch(console.error);

