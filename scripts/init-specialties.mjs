import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, getDoc } from 'firebase/firestore';

// You'll need to add your Firebase config here or import it
// For now, using environment variables
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

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

async function initializeSpecialties() {
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  
  console.log('Initializing specialties...');
  
  for (const specialty of COMMON_SPECIALTIES) {
    const docId = specialty.toLowerCase().replace(/\s+/g, '-');
    const docRef = doc(collection(db, 'specialties'), docId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      await setDoc(docRef, {
        name: specialty,
        createdAt: new Date().toISOString(),
      });
      console.log(`✓ Added: ${specialty}`);
    } else {
      console.log(`- Skipped (exists): ${specialty}`);
    }
  }
  
  console.log('Specialties initialization complete!');
  process.exit(0);
}

initializeSpecialties().catch(console.error);

