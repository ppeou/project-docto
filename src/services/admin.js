import {
  collection,
  doc,
  getDocs,
  getDoc,
  deleteDoc,
  writeBatch,
  serverTimestamp,
  Timestamp,
  addDoc,
  setDoc,
  query,
  where,
} from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';

// Admin user IDs
export const ADMIN_USER_IDS = [
  '0JUzMFus8zLnHUr6p2FYMR7nvtY2',
  '25uMgxju8GUskuqim5R3CnLdQQi1',
  'j78F2lp1IabzfJR2oTvYiIoqInT2',
  'rsDCRyBC0yN1slA45MVwTjraTPz1',
  'uea5ozO3ZsPArk3iwiscwvVJBCi2',
];

// Available collections
export const COLLECTIONS = [
  'itineraries',
  'appointments',
  'prescriptions',
  'doctorNotes',
  'patients',
  'doctors',
  'itineraryShares',
  'invitations',
];

/**
 * Delete all documents from a collection
 */
export const deleteCollection = async (collectionName) => {
  const collectionRef = collection(db, collectionName);
  const snapshot = await getDocs(collectionRef);
  
  if (snapshot.empty) {
    return { success: true, deleted: 0 };
  }

  const BATCH_SIZE = 500;
  const docs = snapshot.docs;
  let totalDeleted = 0;
  
  for (let i = 0; i < docs.length; i += BATCH_SIZE) {
    const batch = writeBatch(db);
    const batchDocs = docs.slice(i, i + BATCH_SIZE);
    
    batchDocs.forEach((doc) => {
      batch.delete(doc.ref);
      totalDeleted++;
    });

    await batch.commit();
  }

  return { success: true, deleted: totalDeleted };
};

/**
 * Get collection count
 * Returns count or 'N/A' if permission denied
 */
export const getCollectionCount = async (collectionName) => {
  try {
    const collectionRef = collection(db, collectionName);
    const snapshot = await getDocs(collectionRef);
    return snapshot.size;
  } catch (error) {
    if (error.code === 'permission-denied') {
      return 'N/A';
    }
    throw error;
  }
};

// ========================================
// Frequency Options Initialization
// ========================================

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
  
  // As needed - using 0 as intervalValue since schema requires a number
  { label: "As needed", intervalValue: 0, intervalUnit: "as_needed", displayOrder: 15 },
];

/**
 * Initialize frequency options
 */
export const initializeFrequencyOptions = async () => {
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated');

  let added = 0;
  let skipped = 0;
  const errors = [];

  for (const option of FREQUENCY_OPTIONS) {
    try {
      // Create a document ID from the label
      const docId = option.label.toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');
      
      const docRef = doc(collection(db, 'frequencyOptions'), docId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        // Explicitly structure the data to ensure all required fields are present
        // Handle null intervalValue for "as_needed" option
        const docData = {
          label: option.label,
          intervalValue: option.intervalValue, // Can be number or null
          intervalUnit: option.intervalUnit,
          displayOrder: option.displayOrder,
          isActive: true,
          created: {
            by: user.uid,
            on: serverTimestamp(),
          },
          updated: {
            by: user.uid,
            on: serverTimestamp(),
          },
        };
        
        await setDoc(docRef, docData);
        added++;
      } else {
        skipped++;
      }
    } catch (error) {
      errors.push({ label: option.label, error: error.message });
      console.error(`Error adding ${option.label}:`, error);
    }
  }

  return { added, skipped, errors };
};

// ========================================
// Seed Data Generators
// ========================================

const getRandomItem = (array) => array[Math.floor(Math.random() * array.length)];
const getRandomUserId = () => getRandomItem(ADMIN_USER_IDS);

// Sample data
const FIRST_NAMES = ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Emily', 'Robert', 'Lisa', 'James', 'Maria'];
const LAST_NAMES = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Wilson', 'Moore'];
const RELATIONS = ['Self', 'Mother', 'Father', 'Spouse', 'Child', 'Sibling', 'Other'];
const SPECIALTIES = ['Cardiology', 'Dermatology', 'Endocrinology', 'Gastroenterology', 'General Practice', 'Neurology', 'Oncology', 'Orthopedics', 'Pediatrics', 'Psychiatry'];
const MEDICATIONS = [
  { name: 'Aspirin', generic: 'Acetylsalicylic acid', dosage: '81mg' },
  { name: 'Lisinopril', generic: 'Lisinopril', dosage: '10mg' },
  { name: 'Metformin', generic: 'Metformin', dosage: '500mg' },
  { name: 'Atorvastatin', generic: 'Atorvastatin', dosage: '20mg' },
  { name: 'Levothyroxine', generic: 'Levothyroxine', dosage: '75mcg' },
  { name: 'Amlodipine', generic: 'Amlodipine', dosage: '5mg' },
  { name: 'Omeprazole', generic: 'Omeprazole', dosage: '20mg' },
  { name: 'Albuterol', generic: 'Albuterol', dosage: '90mcg' },
];
const FREQUENCIES = [
  { label: 'Once daily', intervalValue: 1, intervalUnit: 'day' },
  { label: 'Twice daily', intervalValue: 12, intervalUnit: 'hour' },
  { label: 'Three times per day', intervalValue: 8, intervalUnit: 'hour' },
  { label: 'Four times per day', intervalValue: 6, intervalUnit: 'hour' },
  { label: 'Once weekly', intervalValue: 1, intervalUnit: 'week' },
  { label: 'As needed', intervalValue: 0, intervalUnit: 'as_needed' },
];
const NOTE_TYPES = [1, 2, 3, 4, 5]; // general, test results, treatment plan, diagnosis, other
const APPOINTMENT_STATUSES = [1, 2, 3, 4]; // scheduled, completed, cancelled, rescheduled
const PRESCRIPTION_STATUSES = [1, 2, 3]; // active, completed, discontinued

const generatePhone = () => ({
  phone: `+1${Math.floor(Math.random() * 9000000000) + 1000000000}`,
  typeId: getRandomItem([1, 2, 3, 4, 5]),
  isPrimary: false,
});

const generateEmail = (firstName, lastName) => ({
  email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
  typeId: getRandomItem([1, 2, 3]),
  isPrimary: false,
});

const generateAddress = () => ({
  street: `${Math.floor(Math.random() * 9999) + 1} Main Street`,
  city: getRandomItem(['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose']),
  state: getRandomItem(['NY', 'CA', 'IL', 'TX', 'AZ', 'PA', 'FL', 'OH', 'GA', 'NC']),
  postalCode: `${Math.floor(Math.random() * 90000) + 10000}`,
  country: 'USA',
  typeId: getRandomItem([1, 2, 3, 4, 5]),
  isPrimary: false,
});

/**
 * Generate seed patients
 */
export const generateSeedPatients = async (count = 10) => {
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated');

  const patients = [];
  const BATCH_SIZE = 500;
  
  for (let i = 0; i < count; i += BATCH_SIZE) {
    const batch = writeBatch(db);
    const batchCount = Math.min(BATCH_SIZE, count - i);
    
    for (let j = 0; j < batchCount; j++) {
      const firstName = getRandomItem(FIRST_NAMES);
      const lastName = getRandomItem(LAST_NAMES);
      // Use currently authenticated user for all seed data to comply with Firestore rules
      const userId = user.uid;
      
      const patientData = {
        name: `${firstName} ${lastName}`,
        relation: getRandomItem(RELATIONS),
        phones: [generatePhone()],
        emails: [generateEmail(firstName, lastName)],
        addresses: [generateAddress()],
        userId,
        created: {
          by: userId,
          on: serverTimestamp(),
        },
        updated: {
          by: userId,
          on: serverTimestamp(),
        },
        isDeleted: false,
      };

      const docRef = doc(collection(db, 'patients'));
      batch.set(docRef, patientData);
      patients.push({ id: docRef.id, ...patientData });
    }

    await batch.commit();
  }

  return patients;
};

/**
 * Generate seed doctors
 */
export const generateSeedDoctors = async (count = 10) => {
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated');

  const doctors = [];
  const BATCH_SIZE = 500;
  
  for (let i = 0; i < count; i += BATCH_SIZE) {
    const batch = writeBatch(db);
    const batchCount = Math.min(BATCH_SIZE, count - i);
    
    for (let j = 0; j < batchCount; j++) {
      const firstName = getRandomItem(FIRST_NAMES);
      const lastName = getRandomItem(LAST_NAMES);
      // Use currently authenticated user for all seed data to comply with Firestore rules
      const userId = user.uid;
      
      const doctorData = {
        name: `Dr. ${firstName} ${lastName}`,
        specialty: getRandomItem(SPECIALTIES),
        phones: [generatePhone()],
        emails: [generateEmail(firstName, lastName)],
        userId,
        created: {
          by: userId,
          on: serverTimestamp(),
        },
        updated: {
          by: userId,
          on: serverTimestamp(),
        },
        isDeleted: false,
      };

      const docRef = doc(collection(db, 'doctors'));
      batch.set(docRef, doctorData);
      doctors.push({ id: docRef.id, ...doctorData });
    }

    await batch.commit();
  }

  return doctors;
};

/**
 * Generate seed itineraries
 */
export const generateSeedItineraries = async (count = 10, patientIds = [], doctorIds = []) => {
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated');

  if (patientIds.length === 0) {
    throw new Error('Need at least one patient to create itineraries');
  }

  const itineraries = [];
  const BATCH_SIZE = 500;
  
  for (let i = 0; i < count; i += BATCH_SIZE) {
    const batch = writeBatch(db);
    const batchCount = Math.min(BATCH_SIZE, count - i);
    
    for (let j = 0; j < batchCount; j++) {
      // Use currently authenticated user for all seed data to comply with Firestore rules
      const userId = user.uid;
    const patientId = getRandomItem(patientIds);
    
    // Get patient data
    const patientDocRef = doc(db, 'patients', patientId);
    const patientDoc = await getDoc(patientDocRef);
    let patientData = null;
    if (patientDoc.exists()) {
      patientData = { id: patientDoc.id, ...patientDoc.data() };
    } else {
      // Fallback patient data
      const firstName = getRandomItem(FIRST_NAMES);
      const lastName = getRandomItem(LAST_NAMES);
      patientData = {
        name: `${firstName} ${lastName}`,
        relation: getRandomItem(RELATIONS),
      };
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - Math.floor(Math.random() * 365));
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + Math.floor(Math.random() * 365));

    const itineraryData = {
      name: `${patientData.name}'s Healthcare - ${new Date().getFullYear()}`,
      description: `Healthcare itinerary for ${patientData.name}`,
      startDate: Timestamp.fromDate(startDate),
      endDate: Timestamp.fromDate(endDate),
      patient: {
        name: patientData.name,
        relation: patientData.relation,
        phones: patientData.phones || [],
        emails: patientData.emails || [],
        addresses: patientData.addresses || [],
      },
      created: {
        by: userId,
        on: serverTimestamp(),
      },
      updated: {
        by: userId,
        on: serverTimestamp(),
      },
      isDeleted: false,
    };

      const docRef = doc(collection(db, 'itineraries'));
      batch.set(docRef, itineraryData);
      itineraries.push({ id: docRef.id, ...itineraryData });
    }

    await batch.commit();
  }

  return itineraries;
};

/**
 * Generate seed appointments
 */
export const generateSeedAppointments = async (count = 20, itineraryIds = [], doctorIds = []) => {
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated');

  if (itineraryIds.length === 0) {
    throw new Error('Need at least one itinerary to create appointments');
  }
  if (doctorIds.length === 0) {
    throw new Error('Need at least one doctor to create appointments');
  }

  const appointments = [];
  const BATCH_SIZE = 500;
  
  for (let i = 0; i < count; i += BATCH_SIZE) {
    const batch = writeBatch(db);
    const batchCount = Math.min(BATCH_SIZE, count - i);
    
    for (let j = 0; j < batchCount; j++) {
      // Use currently authenticated user for all seed data to comply with Firestore rules
      const userId = user.uid;
    const itineraryId = getRandomItem(itineraryIds);
    const doctorId = getRandomItem(doctorIds);
    
    // Get doctor data
    const doctorDocRef = doc(db, 'doctors', doctorId);
    const doctorDoc = await getDoc(doctorDocRef);
    let doctorData = null;
    if (doctorDoc.exists()) {
      doctorData = { id: doctorDoc.id, ...doctorDoc.data() };
    } else {
      const firstName = getRandomItem(FIRST_NAMES);
      const lastName = getRandomItem(LAST_NAMES);
      doctorData = {
        name: `Dr. ${firstName} ${lastName}`,
        specialty: getRandomItem(SPECIALTIES),
      };
    }

    const appointmentDate = new Date();
    appointmentDate.setDate(appointmentDate.getDate() + Math.floor(Math.random() * 90) - 30);

    const appointmentData = {
      itineraryId,
      title: `${doctorData.specialty || 'General'} Visit`,
      doctor: {
        name: doctorData.name,
        specialty: doctorData.specialty,
        phones: doctorData.phones || [],
        emails: doctorData.emails || [],
      },
      clinicName: `${doctorData.specialty || 'Medical'} Clinic`,
      clinicAddress: generateAddress(),
      appointmentDate: Timestamp.fromDate(appointmentDate),
      duration: getRandomItem([15, 30, 45, 60]),
      purpose: getRandomItem(['Follow-up', 'New patient', 'Test results', 'Routine checkup', 'Consultation']),
      status: getRandomItem(APPOINTMENT_STATUSES),
      notes: `Appointment notes for ${doctorData.name}`,
      reminder: {
        enabled: true,
        minutesBefore: getRandomItem([60, 1440, 2880]),
      },
      created: {
        by: userId,
        on: serverTimestamp(),
      },
      updated: {
        by: userId,
        on: serverTimestamp(),
      },
      isDeleted: false,
    };

      const docRef = doc(collection(db, 'appointments'));
      batch.set(docRef, appointmentData);
      appointments.push({ id: docRef.id, ...appointmentData });
    }

    await batch.commit();
  }

  return appointments;
};

/**
 * Generate seed prescriptions
 */
export const generateSeedPrescriptions = async (count = 15, itineraryIds = [], doctorIds = []) => {
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated');

  if (itineraryIds.length === 0) {
    throw new Error('Need at least one itinerary to create prescriptions');
  }
  if (doctorIds.length === 0) {
    throw new Error('Need at least one doctor to create prescriptions');
  }

  const prescriptions = [];
  const BATCH_SIZE = 500;
  
  for (let i = 0; i < count; i += BATCH_SIZE) {
    const batch = writeBatch(db);
    const batchCount = Math.min(BATCH_SIZE, count - i);
    
    for (let j = 0; j < batchCount; j++) {
      // Use currently authenticated user for all seed data to comply with Firestore rules
      const userId = user.uid;
    const itineraryId = getRandomItem(itineraryIds);
    const doctorId = getRandomItem(doctorIds);
    const medication = getRandomItem(MEDICATIONS);
    const frequency = getRandomItem(FREQUENCIES);
    
    // Get doctor data
    const doctorDocRef = doc(db, 'doctors', doctorId);
    const doctorDoc = await getDoc(doctorDocRef);
    let doctorData = null;
    if (doctorDoc.exists()) {
      doctorData = { id: doctorDoc.id, ...doctorDoc.data() };
    } else {
      const firstName = getRandomItem(FIRST_NAMES);
      const lastName = getRandomItem(LAST_NAMES);
      doctorData = {
        name: `Dr. ${firstName} ${lastName}`,
        specialty: getRandomItem(SPECIALTIES),
      };
    }

    const datePrescribed = new Date();
    datePrescribed.setDate(datePrescribed.getDate() - Math.floor(Math.random() * 180));

    const prescriptionData = {
      itineraryId,
      medicationName: medication.name,
      genericName: medication.generic,
      dosage: medication.dosage,
      frequency,
      quantity: getRandomItem([30, 60, 90, 120]),
      prescribedBy: {
        name: doctorData.name,
        specialty: doctorData.specialty,
        phones: doctorData.phones || [],
        emails: doctorData.emails || [],
      },
      pharmacyName: getRandomItem(['CVS Pharmacy', 'Walgreens', 'Rite Aid', 'Walmart Pharmacy', 'Target Pharmacy']),
      pharmacyPhone: generatePhone().phone,
      rxNumber: `RX${Math.floor(Math.random() * 900000) + 100000}`,
      datePrescribed: Timestamp.fromDate(datePrescribed),
      refills: {
        remaining: Math.floor(Math.random() * 5),
        total: Math.floor(Math.random() * 5) + 1,
      },
      refillReminder: {
        enabled: true,
        daysBefore: 7,
      },
      instructions: getRandomItem(['Take with food', 'Take on empty stomach', 'Avoid alcohol', 'Take with plenty of water', '']),
      status: getRandomItem(PRESCRIPTION_STATUSES),
      trackingEnabled: true,
      trackingStartDate: datePrescribed.toISOString().split('T')[0],
      intakeRecords: [],
      created: {
        by: userId,
        on: serverTimestamp(),
      },
      updated: {
        by: userId,
        on: serverTimestamp(),
      },
      isDeleted: false,
    };

      const docRef = doc(collection(db, 'prescriptions'));
      batch.set(docRef, prescriptionData);
      prescriptions.push({ id: docRef.id, ...prescriptionData });
    }

    await batch.commit();
  }

  return prescriptions;
};

/**
 * Generate seed doctor notes
 */
export const generateSeedDoctorNotes = async (count = 20, appointmentIds = [], itineraryIds = []) => {
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated');

  if (appointmentIds.length === 0) {
    throw new Error('Need at least one appointment to create doctor notes');
  }
  if (itineraryIds.length === 0) {
    throw new Error('Need at least one itinerary to create doctor notes');
  }

  const notes = [];
  const BATCH_SIZE = 500;
  
  for (let i = 0; i < count; i += BATCH_SIZE) {
    const batch = writeBatch(db);
    const batchCount = Math.min(BATCH_SIZE, count - i);
    
    for (let j = 0; j < batchCount; j++) {
      // Use currently authenticated user for all seed data to comply with Firestore rules
      const userId = user.uid;
    const appointmentId = getRandomItem(appointmentIds);
    const itineraryId = getRandomItem(itineraryIds);
    const noteType = getRandomItem(NOTE_TYPES);

    const noteData = {
      appointmentId,
      itineraryId,
      title: getRandomItem(['Test Results', 'Treatment Plan', 'Diagnosis', 'Follow-up Notes', 'General Notes']),
      content: `This is a sample doctor note of type ${noteType}. It contains important medical information and observations from the appointment.`,
      noteType,
      created: {
        by: userId,
        on: serverTimestamp(),
      },
      updated: {
        by: userId,
        on: serverTimestamp(),
      },
      isDeleted: false,
    };

      const docRef = doc(collection(db, 'doctorNotes'));
      batch.set(docRef, noteData);
      notes.push({ id: docRef.id, ...noteData });
    }

    await batch.commit();
  }

  return notes;
};

/**
 * Generate all seed data in proper order
 */
export const generateAllSeedData = async (counts = {}) => {
  const {
    patients = 10,
    doctors = 10,
    itineraries = 10,
    appointments = 20,
    prescriptions = 15,
    notes = 20,
  } = counts;

  const results = {
    patients: [],
    doctors: [],
    itineraries: [],
    appointments: [],
    prescriptions: [],
    notes: [],
  };

  try {
    // Step 1: Generate patients and doctors (independent)
    console.log('Generating patients...');
    results.patients = await generateSeedPatients(patients);
    const patientIds = results.patients.map(p => p.id);

    console.log('Generating doctors...');
    results.doctors = await generateSeedDoctors(doctors);
    const doctorIds = results.doctors.map(d => d.id);

    // Step 2: Generate itineraries (needs patients)
    console.log('Generating itineraries...');
    results.itineraries = await generateSeedItineraries(itineraries, patientIds);
    const itineraryIds = results.itineraries.map(i => i.id);

    // Step 3: Generate appointments (needs itineraries and doctors)
    console.log('Generating appointments...');
    results.appointments = await generateSeedAppointments(appointments, itineraryIds, doctorIds);
    const appointmentIds = results.appointments.map(a => a.id);

    // Step 4: Generate prescriptions (needs itineraries and doctors)
    console.log('Generating prescriptions...');
    results.prescriptions = await generateSeedPrescriptions(prescriptions, itineraryIds, doctorIds);

    // Step 5: Generate doctor notes (needs appointments and itineraries)
    console.log('Generating doctor notes...');
    results.notes = await generateSeedDoctorNotes(notes, appointmentIds, itineraryIds);

    return results;
  } catch (error) {
    console.error('Error generating seed data:', error);
    throw error;
  }
};

