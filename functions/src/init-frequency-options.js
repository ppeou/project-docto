const admin = require('firebase-admin');
const { readFileSync } = require('fs');
const { resolve } = require('path');

// Load environment variables from .env file in project root
function loadEnv() {
  try {
    const envPath = resolve(__dirname, '../../.env');
    const envFile = readFileSync(envPath, 'utf-8');
    const env = {};
    envFile.split('\n').forEach(line => {
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match) {
        env[match[1].trim()] = match[2].trim();
      }
    });
    return env;
  } catch (error) {
    console.warn('Could not load .env file, using default credentials:', error.message);
    return {};
  }
}

const env = loadEnv();

// Initialize Admin SDK with project ID
try {
  admin.initializeApp({
    projectId: env.VITE_FIREBASE_PROJECT_ID || 'project-docto',
  });
} catch (error) {
  // App already initialized
  if (error.code !== 'app/already-initialized') {
    throw error;
  }
}

const db = admin.firestore();

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
  console.log('Initializing frequency options...');
  
  let added = 0;
  let skipped = 0;
  let errors = 0;

  for (const option of FREQUENCY_OPTIONS) {
    try {
      // Create a document ID from the label
      const docId = option.label.toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');
      
      const docRef = db.collection('frequencyOptions').doc(docId);
      const docSnap = await docRef.get();
      
      if (!docSnap.exists) {
        await docRef.set({
          ...option,
          isActive: true,
          created: {
            on: admin.firestore.FieldValue.serverTimestamp(),
          },
          updated: {
            on: admin.firestore.FieldValue.serverTimestamp(),
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
    }
  }
  
  console.log('\nFrequency options initialization complete!');
  console.log(`Added: ${added}, Skipped: ${skipped}, Errors: ${errors}`);
  process.exit(0);
}

initializeFrequencyOptions().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

