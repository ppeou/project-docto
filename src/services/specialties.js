// Common medical specialties
export const COMMON_SPECIALTIES = [
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

// Initialize specialties collection in Firestore
export const initializeSpecialties = async () => {
  const { collection, doc, setDoc, getDoc } = await import('firebase/firestore');
  const { db } = await import('@/lib/firebase');
  
  const specialtiesRef = collection(db, 'specialties');
  
  for (const specialty of COMMON_SPECIALTIES) {
    const docRef = doc(specialtiesRef, specialty.toLowerCase().replace(/\s+/g, '-'));
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      await setDoc(docRef, {
        name: specialty,
        createdAt: new Date().toISOString(),
      });
    }
  }
};

