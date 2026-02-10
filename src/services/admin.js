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
  arrayUnion,
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
  'users',
  'specialties',
  'frequencyOptions',
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

// Sample data - More realistic and diverse
const FIRST_NAMES = [
  'John', 'Jane', 'Michael', 'Sarah', 'David', 'Emily', 'Robert', 'Lisa', 'James', 'Maria',
  'William', 'Patricia', 'Richard', 'Jennifer', 'Joseph', 'Linda', 'Thomas', 'Barbara', 'Charles', 'Elizabeth',
  'Christopher', 'Susan', 'Daniel', 'Jessica', 'Matthew', 'Karen', 'Anthony', 'Nancy', 'Mark', 'Betty',
  'Donald', 'Margaret', 'Steven', 'Sandra', 'Paul', 'Ashley', 'Andrew', 'Kimberly', 'Joshua', 'Donna',
  'Kenneth', 'Helen', 'Kevin', 'Carol', 'Brian', 'Michelle', 'George', 'Emily', 'Edward', 'Amanda'
];
const LAST_NAMES = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Wilson', 'Moore',
  'Taylor', 'Anderson', 'Thomas', 'Jackson', 'White', 'Harris', 'Martin', 'Thompson', 'Garcia', 'Martinez',
  'Robinson', 'Clark', 'Rodriguez', 'Lewis', 'Lee', 'Walker', 'Hall', 'Allen', 'Young', 'Hernandez',
  'King', 'Wright', 'Lopez', 'Hill', 'Scott', 'Green', 'Adams', 'Baker', 'Gonzalez', 'Nelson',
  'Carter', 'Mitchell', 'Perez', 'Roberts', 'Turner', 'Phillips', 'Campbell', 'Parker', 'Evans', 'Edwards'
];
const RELATIONS = ['Self', 'Mother', 'Father', 'Spouse', 'Child', 'Sibling', 'Grandparent', 'Grandchild', 'Other'];
const SPECIALTIES = [
  'Cardiology', 'Dermatology', 'Endocrinology', 'Gastroenterology', 'General Practice', 
  'Neurology', 'Oncology', 'Orthopedics', 'Pediatrics', 'Psychiatry', 'Pulmonology',
  'Rheumatology', 'Urology', 'Ophthalmology', 'Otolaryngology', 'Anesthesiology'
];
const MEDICATIONS = [
  { name: 'Aspirin', generic: 'Acetylsalicylic acid', dosage: '81mg' },
  { name: 'Lisinopril', generic: 'Lisinopril', dosage: '10mg' },
  { name: 'Metformin', generic: 'Metformin', dosage: '500mg' },
  { name: 'Atorvastatin', generic: 'Atorvastatin', dosage: '20mg' },
  { name: 'Levothyroxine', generic: 'Levothyroxine', dosage: '75mcg' },
  { name: 'Amlodipine', generic: 'Amlodipine', dosage: '5mg' },
  { name: 'Omeprazole', generic: 'Omeprazole', dosage: '20mg' },
  { name: 'Albuterol', generic: 'Albuterol', dosage: '90mcg' },
  { name: 'Metoprolol', generic: 'Metoprolol', dosage: '25mg' },
  { name: 'Simvastatin', generic: 'Simvastatin', dosage: '20mg' },
  { name: 'Losartan', generic: 'Losartan', dosage: '50mg' },
  { name: 'Gabapentin', generic: 'Gabapentin', dosage: '300mg' },
  { name: 'Sertraline', generic: 'Sertraline', dosage: '50mg' },
  { name: 'Tramadol', generic: 'Tramadol', dosage: '50mg' },
  { name: 'Furosemide', generic: 'Furosemide', dosage: '40mg' },
];
const CLINIC_NAMES = [
  'City Medical Center', 'Regional Hospital', 'Community Health Clinic', 'Family Care Associates',
  'Metropolitan Medical Group', 'Valley Healthcare', 'Riverside Medical', 'Summit Health',
  'Premier Medical Associates', 'Advanced Care Clinic', 'Wellness Medical Center', 'Primary Care Partners'
];
const PURPOSES = [
  'Annual physical examination', 'Follow-up visit', 'New patient consultation', 'Test results review',
  'Routine checkup', 'Preventive care', 'Chronic condition management', 'Medication review',
  'Specialist referral', 'Post-surgery follow-up', 'Diagnostic consultation', 'Treatment plan discussion'
];
const NOTE_TITLES = [
  'Blood Test Results', 'Treatment Plan', 'Diagnosis Summary', 'Follow-up Instructions',
  'Medication Review', 'Lab Results', 'Imaging Results', 'Progress Notes',
  'Consultation Summary', 'Discharge Instructions', 'Preventive Care Recommendations'
];
const NOTE_CONTENTS = [
  'Patient shows improvement in symptoms. Continue current medication regimen and follow up in 3 months.',
  'Blood work results are within normal ranges. Patient advised to maintain current lifestyle.',
  'New diagnosis confirmed. Treatment plan initiated. Patient education provided.',
  'Follow-up appointment scheduled. Patient instructed to monitor symptoms and report any changes.',
  'Medication adjustment recommended based on latest test results. New prescription provided.',
  'Imaging studies show no significant changes. Continue monitoring.',
  'Patient responding well to treatment. Gradual improvement noted.',
  'Comprehensive evaluation completed. Recommendations provided for ongoing care.',
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

const generatePhone = () => {
  const areaCode = Math.floor(Math.random() * 800) + 200; // 200-999
  const exchange = Math.floor(Math.random() * 800) + 200; // 200-999
  const number = Math.floor(Math.random() * 10000); // 0000-9999
  return {
    phone: `+1${areaCode}${exchange}${number.toString().padStart(4, '0')}`,
    typeId: getRandomItem([1, 2, 3, 4, 5]),
    isPrimary: Math.random() > 0.7,
  };
};

const generateEmail = (firstName, lastName, domain = 'example.com') => ({
  email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${domain}`,
  typeId: getRandomItem([1, 2, 3]),
  isPrimary: Math.random() > 0.7,
});

const STREET_NAMES = [
  'Main Street', 'Oak Avenue', 'Park Drive', 'Maple Lane', 'Cedar Boulevard', 'Elm Street',
  'Washington Avenue', 'Lincoln Way', 'Jefferson Street', 'Madison Avenue', 'Franklin Drive',
  'Church Street', 'Market Street', 'Broadway', 'First Street', 'Second Avenue', 'Third Street'
];
const CITIES = [
  { city: 'New York', state: 'NY' }, { city: 'Los Angeles', state: 'CA' },
  { city: 'Chicago', state: 'IL' }, { city: 'Houston', state: 'TX' },
  { city: 'Phoenix', state: 'AZ' }, { city: 'Philadelphia', state: 'PA' },
  { city: 'San Antonio', state: 'TX' }, { city: 'San Diego', state: 'CA' },
  { city: 'Dallas', state: 'TX' }, { city: 'San Jose', state: 'CA' },
  { city: 'Austin', state: 'TX' }, { city: 'Jacksonville', state: 'FL' },
  { city: 'Fort Worth', state: 'TX' }, { city: 'Columbus', state: 'OH' },
  { city: 'Charlotte', state: 'NC' }, { city: 'San Francisco', state: 'CA' },
  { city: 'Indianapolis', state: 'IN' }, { city: 'Seattle', state: 'WA' }
];

const generateAddress = () => {
  const location = getRandomItem(CITIES);
  return {
    street: `${Math.floor(Math.random() * 9999) + 1} ${getRandomItem(STREET_NAMES)}`,
    city: location.city,
    state: location.state,
    postalCode: `${Math.floor(Math.random() * 90000) + 10000}`,
    country: 'USA',
    typeId: getRandomItem([1, 2, 3, 4, 5]),
    isPrimary: Math.random() > 0.8,
  };
};

/**
 * Generate seed patients
 */
export const generateSeedPatients = async (count = 10, userId = null) => {
  const targetUserId = userId || auth.currentUser?.uid;
  if (!targetUserId) throw new Error('Not authenticated and no userId provided');

  const patients = [];
  const BATCH_SIZE = 500;
  
  for (let i = 0; i < count; i += BATCH_SIZE) {
    const batch = writeBatch(db);
    const batchCount = Math.min(BATCH_SIZE, count - i);
    
    for (let j = 0; j < batchCount; j++) {
      const firstName = getRandomItem(FIRST_NAMES);
      const lastName = getRandomItem(LAST_NAMES);
      // Use provided userId or currently authenticated user for all seed data to comply with Firestore rules
      const userIdForData = targetUserId;
      
      const patientData = {
        name: `${firstName} ${lastName}`,
        relation: getRandomItem(RELATIONS),
        phones: [generatePhone()],
        emails: [generateEmail(firstName, lastName)],
        addresses: [generateAddress()],
        userId: userIdForData,
        created: {
          by: userIdForData,
          on: serverTimestamp(),
        },
        updated: {
          by: userIdForData,
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
export const generateSeedDoctors = async (count = 10, userId = null) => {
  const targetUserId = userId || auth.currentUser?.uid;
  if (!targetUserId) throw new Error('Not authenticated and no userId provided');

  const doctors = [];
  const BATCH_SIZE = 500;
  
  for (let i = 0; i < count; i += BATCH_SIZE) {
    const batch = writeBatch(db);
    const batchCount = Math.min(BATCH_SIZE, count - i);
    
    for (let j = 0; j < batchCount; j++) {
      const firstName = getRandomItem(FIRST_NAMES);
      const lastName = getRandomItem(LAST_NAMES);
      // Use provided userId or currently authenticated user for all seed data to comply with Firestore rules
      const userIdForData = targetUserId;
      
      const doctorData = {
        name: `Dr. ${firstName} ${lastName}`,
        specialty: getRandomItem(SPECIALTIES),
        phones: [generatePhone()],
        emails: [generateEmail(firstName, lastName)],
        userId: userIdForData,
        created: {
          by: userIdForData,
          on: serverTimestamp(),
        },
        updated: {
          by: userIdForData,
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
export const generateSeedItineraries = async (count = 10, patientIds = [], doctorIds = [], userId = null) => {
  const targetUserId = userId || auth.currentUser?.uid;
  if (!targetUserId) throw new Error('Not authenticated and no userId provided');

  if (patientIds.length === 0) {
    throw new Error('Need at least one patient to create itineraries');
  }

  const itineraries = [];
  const BATCH_SIZE = 500;
  
  for (let i = 0; i < count; i += BATCH_SIZE) {
    const batch = writeBatch(db);
    const batchCount = Math.min(BATCH_SIZE, count - i);
    
    for (let j = 0; j < batchCount; j++) {
      // Use provided userId or currently authenticated user for all seed data to comply with Firestore rules
      const userIdForData = targetUserId;
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

    // More realistic date ranges - itineraries typically span months to a year
    const startDate = new Date();
    const monthsAgo = Math.floor(Math.random() * 12); // 0-11 months ago
    startDate.setMonth(startDate.getMonth() - monthsAgo);
    startDate.setDate(1); // First of the month
    
    const endDate = new Date(startDate);
    const durationMonths = Math.floor(Math.random() * 12) + 6; // 6-18 months duration
    endDate.setMonth(endDate.getMonth() + durationMonths);

    const year = startDate.getFullYear();
    const relationText = patientData.relation === 'Self' ? '' : `${patientData.relation}'s `;
    const itineraryData = {
      name: `${relationText}Healthcare - ${year}`,
      description: `Comprehensive healthcare itinerary for ${patientData.name} covering ${patientData.relation === 'Self' ? 'their' : 'their ' + patientData.relation.toLowerCase() + "'s"} medical needs.`,
      startDate: Timestamp.fromDate(startDate),
      endDate: Timestamp.fromDate(endDate),
      patient: {
        name: patientData.name,
        relation: patientData.relation,
        phones: patientData.phones || [],
        emails: patientData.emails || [],
        addresses: patientData.addresses || [],
      },
      ownerId: userIdForData,
      memberIds: [userIdForData], // Creator is automatically a member
      memberAccess: { [userIdForData]: 2 }, // owner is collaborator
      created: {
        by: userIdForData,
        on: serverTimestamp(),
      },
      updated: {
        by: userIdForData,
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
export const generateSeedAppointments = async (count = 20, itineraryIds = [], doctorIds = [], userId = null) => {
  const targetUserId = userId || auth.currentUser?.uid;
  if (!targetUserId) throw new Error('Not authenticated and no userId provided');

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
      // Use provided userId or currently authenticated user for all seed data to comply with Firestore rules
      const userIdForData = targetUserId;
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

      // More realistic appointment dates - mix of past and future
      const appointmentDate = new Date();
      const daysOffset = Math.floor(Math.random() * 180) - 60; // -60 to +120 days
      appointmentDate.setDate(appointmentDate.getDate() + daysOffset);
      // Set realistic time (9 AM to 5 PM, 15-minute intervals)
      const hour = 9 + Math.floor(Math.random() * 8);
      const minute = [0, 15, 30, 45][Math.floor(Math.random() * 4)];
      appointmentDate.setHours(hour, minute, 0, 0);

      const appointmentData = {
        itineraryId,
        title: `${doctorData.specialty || 'General'} Visit`,
        doctor: {
          name: doctorData.name,
          specialty: doctorData.specialty,
          phones: doctorData.phones || [],
          emails: doctorData.emails || [],
        },
        clinicName: getRandomItem(CLINIC_NAMES),
        clinicAddress: generateAddress(),
        appointmentDate: Timestamp.fromDate(appointmentDate),
        duration: getRandomItem([15, 30, 45, 60]),
        purpose: getRandomItem(PURPOSES),
        status: getRandomItem(APPOINTMENT_STATUSES),
        notes: daysOffset < 0 
          ? `Completed appointment with ${doctorData.name}. Patient discussed ${getRandomItem(['symptoms', 'test results', 'treatment options', 'medication concerns'])}.`
          : `Upcoming appointment scheduled for ${doctorData.specialty || 'general'} consultation.`,
        reminder: {
          enabled: Math.random() > 0.2, // 80% have reminders enabled
          minutesBefore: getRandomItem([60, 1440, 2880, 10080]), // 1 hour, 1 day, 2 days, 1 week
        },
        created: {
          by: userIdForData,
          on: serverTimestamp(),
        },
        updated: {
          by: userIdForData,
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
export const generateSeedPrescriptions = async (count = 15, itineraryIds = [], doctorIds = [], userId = null) => {
  const targetUserId = userId || auth.currentUser?.uid;
  if (!targetUserId) throw new Error('Not authenticated and no userId provided');

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
      // Use provided userId or currently authenticated user for all seed data to comply with Firestore rules
      const userIdForData = targetUserId;
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

      // More realistic prescription dates - typically within last 6 months
      const datePrescribed = new Date();
      datePrescribed.setDate(datePrescribed.getDate() - Math.floor(Math.random() * 180));
      datePrescribed.setHours(0, 0, 0, 0);

      const totalRefills = Math.floor(Math.random() * 6); // 0-5 refills
      const prescriptionStatus = getRandomItem(PRESCRIPTION_STATUSES);
      const remainingRefills = prescriptionStatus === 1 ? Math.floor(Math.random() * (totalRefills + 1)) : 0; // Active prescriptions may have refills

      const prescriptionData = {
        itineraryId,
        medicationName: medication.name,
        genericName: medication.generic,
        dosage: medication.dosage,
        frequency,
        quantity: getRandomItem([30, 60, 90, 120, 180]),
        prescribedBy: {
          name: doctorData.name,
          specialty: doctorData.specialty,
          phones: doctorData.phones || [],
          emails: doctorData.emails || [],
        },
        pharmacyName: getRandomItem(['CVS Pharmacy', 'Walgreens', 'Rite Aid', 'Walmart Pharmacy', 'Target Pharmacy', 'Kroger Pharmacy', 'Safeway Pharmacy']),
        pharmacyPhone: generatePhone().phone,
        rxNumber: `RX${String(Math.floor(Math.random() * 900000) + 100000).padStart(6, '0')}`,
        datePrescribed: Timestamp.fromDate(datePrescribed),
        refills: {
          remaining: remainingRefills,
          total: totalRefills,
        },
        refillReminder: {
          enabled: Math.random() > 0.3, // 70% have reminders
          daysBefore: getRandomItem([3, 5, 7, 10, 14]),
        },
        instructions: getRandomItem([
          'Take with food', 'Take on empty stomach', 'Avoid alcohol', 
          'Take with plenty of water', 'Take at bedtime', 'Take in the morning',
          'May cause drowsiness', 'Avoid direct sunlight', ''
        ]),
        status: prescriptionStatus,
        trackingEnabled: Math.random() > 0.4, // 60% have tracking enabled
        trackingStartDate: datePrescribed.toISOString().split('T')[0],
        intakeRecords: [],
        created: {
          by: userIdForData,
          on: serverTimestamp(),
        },
        updated: {
          by: userIdForData,
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
export const generateSeedDoctorNotes = async (count = 20, appointmentIds = [], itineraryIds = [], userId = null) => {
  const targetUserId = userId || auth.currentUser?.uid;
  if (!targetUserId) throw new Error('Not authenticated and no userId provided');

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
      // Use provided userId or currently authenticated user for all seed data to comply with Firestore rules
      const userIdForData = targetUserId;
      const appointmentId = getRandomItem(appointmentIds);
      const itineraryId = getRandomItem(itineraryIds);
      const noteType = getRandomItem(NOTE_TYPES);

      const noteData = {
        appointmentId,
        itineraryId,
        title: getRandomItem(NOTE_TITLES),
        content: getRandomItem(NOTE_CONTENTS),
        noteType,
        created: {
          by: userIdForData,
          on: serverTimestamp(),
        },
        updated: {
          by: userIdForData,
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
 * Generate seed invitations
 */
export const generateSeedInvitations = async (count = 10, itineraryIds = [], userId = null) => {
  const targetUserId = userId || auth.currentUser?.uid;
  if (!targetUserId) throw new Error('Not authenticated and no userId provided');

  if (itineraryIds.length === 0) {
    throw new Error('Need at least one itinerary to create invitations');
  }

  const invitations = [];
  const BATCH_SIZE = 500;
  
  for (let i = 0; i < count; i += BATCH_SIZE) {
    const batch = writeBatch(db);
    const batchCount = Math.min(BATCH_SIZE, count - i);
    
    for (let j = 0; j < batchCount; j++) {
      // Use provided userId or currently authenticated user for all seed data to comply with Firestore rules
      const userIdForData = targetUserId;
      const itineraryId = getRandomItem(itineraryIds);
      
      // Generate random email or phone
      const inviteeType = getRandomItem([1, 2]); // 1=email, 2=phone
      const firstName = getRandomItem(FIRST_NAMES);
      const lastName = getRandomItem(LAST_NAMES);
      const inviteeIdentifier = inviteeType === 1 
        ? generateEmail(firstName, lastName).email
        : generatePhone().phone;
      
      const createdDate = new Date();
      createdDate.setDate(createdDate.getDate() - Math.floor(Math.random() * 30)); // Last 30 days
      
      const expiresAt = new Date(createdDate);
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from creation
      
      const status = getRandomItem([0, 1, -1, -2]); // pending, accepted, rejected, cancelled
      let respondedAt = null;
      if (status !== 0 && status !== -2) { // If not pending or cancelled
        respondedAt = new Date(createdDate);
        respondedAt.setDate(respondedAt.getDate() + Math.floor(Math.random() * 5) + 1);
      }

      const invitationData = {
        itineraryId,
        invitedBy: userIdForData,
        inviteeIdentifier,
        inviteeType,
        accessLevel: getRandomItem([1, 2]), // 1=viewer, 2=collaborator
        status,
        created: {
          by: userIdForData,
          on: Timestamp.fromDate(createdDate),
        },
        expiresAt: Timestamp.fromDate(expiresAt),
        ...(respondedAt && { respondedAt: Timestamp.fromDate(respondedAt) }),
      };

      const docRef = doc(collection(db, 'invitations'));
      batch.set(docRef, invitationData);
      invitations.push({ id: docRef.id, ...invitationData });
    }

    await batch.commit();
  }

  return invitations;
};

/**
 * Generate seed itinerary shares
 */
export const generateSeedItineraryShares = async (count = 10, itineraryIds = [], userIds = [], userId = null) => {
  const targetUserId = userId || auth.currentUser?.uid;
  if (!targetUserId) throw new Error('Not authenticated and no userId provided');

  if (itineraryIds.length === 0) {
    throw new Error('Need at least one itinerary to create shares');
  }

  // Use admin user IDs as potential share recipients
  const availableUserIds = userIds.length > 0 ? userIds : ADMIN_USER_IDS.filter(id => id !== targetUserId);
  
  if (availableUserIds.length === 0) {
    throw new Error('Need at least one other user ID to create shares');
  }

  const shares = [];
  const BATCH_SIZE = 500;
  /** @type {Record<string, Record<string, number>>} itineraryId -> { [userId]: accessLevel } */
  const batchItineraryUpdates = {};

  for (let i = 0; i < count; i += BATCH_SIZE) {
    const batch = writeBatch(db);
    const batchCount = Math.min(BATCH_SIZE, count - i);
    const batchUpdates = /** @type {Record<string, Record<string, number>>} */ ({});

    for (let j = 0; j < batchCount; j++) {
      const userIdForData = targetUserId;
      const itineraryId = getRandomItem(itineraryIds);
      const sharedWith = getRandomItem(availableUserIds);
      const accessLevel = getRandomItem([1, 2]); // 1=viewer, 2=collaborator
      const isDeleted = Math.random() > 0.9;

      const shareData = {
        itineraryId,
        sharedBy: userIdForData,
        sharedWith,
        accessLevel,
        created: {
          by: userIdForData,
          on: serverTimestamp(),
        },
        isDeleted,
      };

      const docRef = doc(collection(db, 'itineraryShares'));
      batch.set(docRef, shareData);
      shares.push({ id: docRef.id, ...shareData });

      if (!isDeleted) {
        if (!batchUpdates[itineraryId]) batchUpdates[itineraryId] = {};
        batchUpdates[itineraryId][sharedWith] = accessLevel;
      }
    }

    for (const [itineraryId, userAccess] of Object.entries(batchUpdates)) {
      const itineraryRef = doc(db, 'itineraries', itineraryId);
      const userIds = Object.keys(userAccess);
      const memberAccessUpdate = userIds.reduce((acc, uid) => {
        acc[`memberAccess.${uid}`] = userAccess[uid];
        return acc;
      }, /** @type {Record<string, number>} */ ({}));
      batch.update(itineraryRef, {
        memberIds: arrayUnion(...userIds),
        ...memberAccessUpdate,
      });
    }

    await batch.commit();
  }

  return shares;
};

/**
 * Generate complete itinerary with related appointments and prescriptions
 * Ensures all related objects belong to the same owner
 */
const generateCompleteItinerary = async (patientId, patientData, doctorIds, doctorDataMap, userId) => {
  const batch = writeBatch(db);
  
  // Create itinerary
  const startDate = new Date();
  const monthsAgo = Math.floor(Math.random() * 12); // 0-11 months ago
  startDate.setMonth(startDate.getMonth() - monthsAgo);
  startDate.setDate(1); // First of the month
  
  const endDate = new Date(startDate);
  const durationMonths = Math.floor(Math.random() * 12) + 6; // 6-18 months duration
  endDate.setMonth(endDate.getMonth() + durationMonths);

  const year = startDate.getFullYear();
  const relationText = patientData.relation === 'Self' ? '' : `${patientData.relation}'s `;
  const itineraryData = {
    name: `${relationText}Healthcare - ${year}`,
    description: `Comprehensive healthcare itinerary for ${patientData.name} covering ${patientData.relation === 'Self' ? 'their' : 'their ' + patientData.relation.toLowerCase() + "'s"} medical needs.`,
    startDate: Timestamp.fromDate(startDate),
    endDate: Timestamp.fromDate(endDate),
    patient: {
      name: patientData.name,
      relation: patientData.relation,
      phones: patientData.phones || [],
      emails: patientData.emails || [],
      addresses: patientData.addresses || [],
    },
    ownerId: userId,
    memberIds: [userId], // Creator is automatically a member
    memberAccess: { [userId]: 2 }, // owner is collaborator
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

  const itineraryRef = doc(collection(db, 'itineraries'));
  batch.set(itineraryRef, itineraryData);
  const itineraryId = itineraryRef.id;

  // Generate 2-5 appointments for this itinerary
  const appointmentCount = Math.floor(Math.random() * 4) + 2; // 2-5 appointments
  const appointments = [];
  const appointmentIds = [];

  for (let i = 0; i < appointmentCount; i++) {
    const doctorId = getRandomItem(doctorIds);
    const doctorData = doctorDataMap[doctorId] || {
      name: `Dr. ${getRandomItem(FIRST_NAMES)} ${getRandomItem(LAST_NAMES)}`,
      specialty: getRandomItem(SPECIALTIES),
      phones: [],
      emails: [],
    };

    // Appointment dates within itinerary date range
    const appointmentDate = new Date(startDate);
    const daysIntoItinerary = Math.floor(Math.random() * (endDate - startDate) / (1000 * 60 * 60 * 24));
    appointmentDate.setDate(appointmentDate.getDate() + daysIntoItinerary);
    const hour = 9 + Math.floor(Math.random() * 8);
    const minute = [0, 15, 30, 45][Math.floor(Math.random() * 4)];
    appointmentDate.setHours(hour, minute, 0, 0);

    const appointmentData = {
      itineraryId,
      title: `${doctorData.specialty || 'General'} Visit`,
      doctor: {
        name: doctorData.name,
        specialty: doctorData.specialty,
        phones: doctorData.phones || [],
        emails: doctorData.emails || [],
      },
      clinicName: getRandomItem(CLINIC_NAMES),
      clinicAddress: generateAddress(),
      appointmentDate: Timestamp.fromDate(appointmentDate),
      duration: getRandomItem([15, 30, 45, 60]),
      purpose: getRandomItem(PURPOSES),
      status: appointmentDate < new Date() ? getRandomItem([2, 3]) : getRandomItem([1, 4]), // Past = completed/cancelled, Future = scheduled/rescheduled
      notes: appointmentDate < new Date()
        ? `Completed appointment with ${doctorData.name}. Patient discussed ${getRandomItem(['symptoms', 'test results', 'treatment options', 'medication concerns'])}.`
        : `Upcoming appointment scheduled for ${doctorData.specialty || 'general'} consultation.`,
      reminder: {
        enabled: Math.random() > 0.2,
        minutesBefore: getRandomItem([60, 1440, 2880, 10080]),
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

    const appointmentRef = doc(collection(db, 'appointments'));
    batch.set(appointmentRef, appointmentData);
    appointmentIds.push(appointmentRef.id);
    appointments.push({ id: appointmentRef.id, ...appointmentData });
  }

  // Generate 1-4 prescriptions for this itinerary
  const prescriptionCount = Math.floor(Math.random() * 4) + 1; // 1-4 prescriptions
  const prescriptions = [];

  for (let i = 0; i < prescriptionCount; i++) {
    const doctorId = getRandomItem(doctorIds);
    const doctorData = doctorDataMap[doctorId] || {
      name: `Dr. ${getRandomItem(FIRST_NAMES)} ${getRandomItem(LAST_NAMES)}`,
      specialty: getRandomItem(SPECIALTIES),
      phones: [],
      emails: [],
    };

    const medication = getRandomItem(MEDICATIONS);
    const frequency = getRandomItem(FREQUENCIES);
    
    // Prescription date within itinerary date range
    const datePrescribed = new Date(startDate);
    const daysIntoItinerary = Math.floor(Math.random() * (endDate - startDate) / (1000 * 60 * 60 * 24));
    datePrescribed.setDate(datePrescribed.getDate() + daysIntoItinerary);
    datePrescribed.setHours(0, 0, 0, 0);

    const totalRefills = Math.floor(Math.random() * 6);
    const prescriptionStatus = getRandomItem(PRESCRIPTION_STATUSES);
    const remainingRefills = prescriptionStatus === 1 ? Math.floor(Math.random() * (totalRefills + 1)) : 0;

    const prescriptionData = {
      itineraryId,
      medicationName: medication.name,
      genericName: medication.generic,
      dosage: medication.dosage,
      frequency,
      quantity: getRandomItem([30, 60, 90, 120, 180]),
      prescribedBy: {
        name: doctorData.name,
        specialty: doctorData.specialty,
        phones: doctorData.phones || [],
        emails: doctorData.emails || [],
      },
      pharmacyName: getRandomItem(['CVS Pharmacy', 'Walgreens', 'Rite Aid', 'Walmart Pharmacy', 'Target Pharmacy', 'Kroger Pharmacy', 'Safeway Pharmacy']),
      pharmacyPhone: generatePhone().phone,
      rxNumber: `RX${String(Math.floor(Math.random() * 900000) + 100000).padStart(6, '0')}`,
      datePrescribed: Timestamp.fromDate(datePrescribed),
      refills: {
        remaining: remainingRefills,
        total: totalRefills,
      },
      refillReminder: {
        enabled: Math.random() > 0.3,
        daysBefore: getRandomItem([3, 5, 7, 10, 14]),
      },
      instructions: getRandomItem([
        'Take with food', 'Take on empty stomach', 'Avoid alcohol', 
        'Take with plenty of water', 'Take at bedtime', 'Take in the morning',
        'May cause drowsiness', 'Avoid direct sunlight', ''
      ]),
      status: prescriptionStatus,
      trackingEnabled: Math.random() > 0.4,
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

    const prescriptionRef = doc(collection(db, 'prescriptions'));
    batch.set(prescriptionRef, prescriptionData);
    prescriptions.push({ id: prescriptionRef.id, ...prescriptionData });
  }

  // Generate 1-3 doctor notes for appointments in this itinerary
  const noteCount = Math.min(Math.floor(Math.random() * 3) + 1, appointmentIds.length); // 1-3 notes, but not more than appointments
  const notes = [];

  for (let i = 0; i < noteCount; i++) {
    const appointmentId = getRandomItem(appointmentIds);
    const noteType = getRandomItem(NOTE_TYPES);

    const noteData = {
      appointmentId,
      itineraryId,
      title: getRandomItem(NOTE_TITLES),
      content: getRandomItem(NOTE_CONTENTS),
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

    const noteRef = doc(collection(db, 'doctorNotes'));
    batch.set(noteRef, noteData);
    notes.push({ id: noteRef.id, ...noteData });
  }

  await batch.commit();

  return {
    itinerary: { id: itineraryId, ...itineraryData },
    appointments,
    prescriptions,
    notes,
  };
};

/**
 * Generate all seed data in proper order
 * Now ensures each itinerary has related appointments and prescriptions
 */
export const generateAllSeedData = async (counts = {}, userId = null) => {
  const {
    patients = 10,
    doctors = 10,
    itineraries = 10,
    invitations = 10,
    itineraryShares = 10,
  } = counts;

  const results = {
    patients: [],
    doctors: [],
    itineraries: [],
    appointments: [],
    prescriptions: [],
    notes: [],
    invitations: [],
    itineraryShares: [],
  };

  try {
    const targetUserId = userId || auth.currentUser?.uid;
    if (!targetUserId) throw new Error('Not authenticated and no userId provided');

    // Step 1: Generate patients and doctors (independent)
    console.log('Generating patients...');
    results.patients = await generateSeedPatients(patients, targetUserId);
    const patientIds = results.patients.map(p => p.id);

    console.log('Generating doctors...');
    results.doctors = await generateSeedDoctors(doctors, targetUserId);
    const doctorIds = results.doctors.map(d => d.id);

    // Step 2: Create doctor data map from generated doctors (no need to read from Firestore)
    console.log('Preparing doctor data...');
    const doctorDataMap = {};
    for (const doctor of results.doctors) {
      doctorDataMap[doctor.id] = doctor;
    }

    // Step 3: Create patient data map from generated patients (no need to read from Firestore)
    console.log('Preparing patient data...');
    const patientDataMap = {};
    for (const patient of results.patients) {
      patientDataMap[patient.id] = patient;
    }

    // Step 4: Generate complete itineraries with related data
    console.log('Generating complete itineraries with appointments and prescriptions...');
    const itineraryResults = [];
    
    for (let i = 0; i < itineraries; i++) {
      const patientId = getRandomItem(patientIds);
      const patientData = patientDataMap[patientId] || {
        name: `${getRandomItem(FIRST_NAMES)} ${getRandomItem(LAST_NAMES)}`,
        relation: getRandomItem(RELATIONS),
        phones: [],
        emails: [],
        addresses: [],
      };

      const complete = await generateCompleteItinerary(patientId, patientData, doctorIds, doctorDataMap, targetUserId);
      itineraryResults.push(complete);
      results.itineraries.push(complete.itinerary);
      results.appointments.push(...complete.appointments);
      results.prescriptions.push(...complete.prescriptions);
      results.notes.push(...complete.notes);
    }

    const itineraryIds = results.itineraries.map(i => i.id);

    // Step 5: Generate invitations (needs itineraries)
    console.log('Generating invitations...');
    results.invitations = await generateSeedInvitations(invitations, itineraryIds, targetUserId);

    // Step 6: Generate itinerary shares (needs itineraries and user IDs)
    console.log('Generating itinerary shares...');
    results.itineraryShares = await generateSeedItineraryShares(itineraryShares, itineraryIds, ADMIN_USER_IDS, targetUserId);

    return results;
  } catch (error) {
    console.error('Error generating seed data:', error);
    throw error;
  }
};

