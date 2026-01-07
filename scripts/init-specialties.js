import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, getDoc } from 'firebase/firestore';
import { config } from '../src/lib/firebase.js';

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
  const app = initializeApp(config);
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

