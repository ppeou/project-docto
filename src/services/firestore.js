import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';

// Itineraries
export const createItinerary = async (data) => {
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated');

  const docRef = await addDoc(collection(db, 'itineraries'), {
    ...data,
    created: {
      by: user.uid,
      on: serverTimestamp(),
    },
    updated: {
      by: user.uid,
      on: serverTimestamp(),
    },
    isDeleted: false,
  });

  return docRef.id;
};

export const getItinerary = async (id) => {
  const docRef = doc(db, 'itineraries', id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() };
  }
  return null;
};

export const updateItinerary = async (id, data) => {
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated');

  await updateDoc(doc(db, 'itineraries', id), {
    ...data,
    updated: {
      by: user.uid,
      on: serverTimestamp(),
    },
  });
};

export const deleteItinerary = async (id) => {
  await updateDoc(doc(db, 'itineraries', id), {
    isDeleted: true,
    updated: {
      by: auth.currentUser.uid,
      on: serverTimestamp(),
    },
  });
};

export const getUserItineraries = async (userId) => {
  const q = query(
    collection(db, 'itineraries'),
    where('created.by', '==', userId),
    where('isDeleted', '==', false),
    orderBy('created.on', 'desc')
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

export const subscribeToUserItineraries = (userId, callback) => {
  const q = query(
    collection(db, 'itineraries'),
    where('created.by', '==', userId),
    where('isDeleted', '==', false),
    orderBy('created.on', 'desc')
  );
  return onSnapshot(
    q,
    (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      callback(data);
    },
    (error) => {
      console.error('Error in subscribeToUserItineraries:', error);
      // Return empty array on permission error
      if (error.code === 'permission-denied') {
        callback([]);
      }
    }
  );
};

// Appointments
export const createAppointment = async (data) => {
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated');

  const docRef = await addDoc(collection(db, 'appointments'), {
    ...data,
    appointmentDate: Timestamp.fromDate(new Date(data.appointmentDate)),
    created: {
      by: user.uid,
      on: serverTimestamp(),
    },
    updated: {
      by: user.uid,
      on: serverTimestamp(),
    },
    isDeleted: false,
    status: 1, // scheduled
  });

  return docRef.id;
};

export const getAppointment = async (id) => {
  const docRef = doc(db, 'appointments', id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() };
  }
  return null;
};

export const updateAppointment = async (id, data) => {
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated');

  const updateData = { ...data };
  if (updateData.appointmentDate) {
    updateData.appointmentDate = Timestamp.fromDate(new Date(updateData.appointmentDate));
  }

  await updateDoc(doc(db, 'appointments', id), {
    ...updateData,
    updated: {
      by: user.uid,
      on: serverTimestamp(),
    },
  });
};

export const deleteAppointment = async (id) => {
  await updateDoc(doc(db, 'appointments', id), {
    isDeleted: true,
    updated: {
      by: auth.currentUser.uid,
      on: serverTimestamp(),
    },
  });
};

export const subscribeToItineraryAppointments = (itineraryId, callback) => {
  const q = query(
    collection(db, 'appointments'),
    where('itineraryId', '==', itineraryId),
    where('isDeleted', '==', false),
    orderBy('appointmentDate', 'asc')
  );
  return onSnapshot(
    q,
    (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      callback(data);
    },
    (error) => {
      console.error('Error in subscribeToItineraryAppointments:', error);
      if (error.code === 'permission-denied') {
        callback([]);
      }
    }
  );
};

// Prescriptions
export const createPrescription = async (data) => {
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated');

  const docRef = await addDoc(collection(db, 'prescriptions'), {
    ...data,
    frequency: data.frequency, // Should be { label, intervalValue, intervalUnit }
    datePrescribed: Timestamp.fromDate(new Date(data.datePrescribed)),
    nextRefillDate: data.nextRefillDate ? Timestamp.fromDate(new Date(data.nextRefillDate)) : null,
    intakeRecords: [],
    trackingStartDate: data.trackingStartDate || new Date().toISOString().split('T')[0],
    trackingEndDate: data.trackingEndDate || null,
    trackingEnabled: data.trackingEnabled !== false,
    created: {
      by: user.uid,
      on: serverTimestamp(),
    },
    updated: {
      by: user.uid,
      on: serverTimestamp(),
    },
    isDeleted: false,
    status: 1, // active
  });

  return docRef.id;
};

export const getPrescription = async (id) => {
  const docRef = doc(db, 'prescriptions', id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() };
  }
  return null;
};

export const updatePrescription = async (id, data) => {
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated');

  const updateData = { ...data };
  if (updateData.datePrescribed) {
    updateData.datePrescribed = Timestamp.fromDate(new Date(updateData.datePrescribed));
  }
  if (updateData.nextRefillDate) {
    updateData.nextRefillDate = Timestamp.fromDate(new Date(updateData.nextRefillDate));
  }

  await updateDoc(doc(db, 'prescriptions', id), {
    ...updateData,
    updated: {
      by: user.uid,
      on: serverTimestamp(),
    },
  });
};

export const deletePrescription = async (id) => {
  await updateDoc(doc(db, 'prescriptions', id), {
    isDeleted: true,
    updated: {
      by: auth.currentUser.uid,
      on: serverTimestamp(),
    },
  });
};

export const subscribeToItineraryPrescriptions = (itineraryId, callback) => {
  const q = query(
    collection(db, 'prescriptions'),
    where('itineraryId', '==', itineraryId),
    where('isDeleted', '==', false),
    orderBy('datePrescribed', 'desc')
  );
  return onSnapshot(
    q,
    (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      callback(data);
    },
    (error) => {
      console.error('Error in subscribeToItineraryPrescriptions:', error);
      if (error.code === 'permission-denied') {
        callback([]);
      }
    }
  );
};

// Doctor Notes
export const createDoctorNote = async (data) => {
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated');

  const docRef = await addDoc(collection(db, 'doctorNotes'), {
    ...data,
    created: {
      by: user.uid,
      on: serverTimestamp(),
    },
    updated: {
      by: user.uid,
      on: serverTimestamp(),
    },
    isDeleted: false,
  });

  return docRef.id;
};

export const subscribeToAppointmentNotes = (appointmentId, callback) => {
  const q = query(
    collection(db, 'doctorNotes'),
    where('appointmentId', '==', appointmentId),
    where('isDeleted', '==', false),
    orderBy('created.on', 'desc')
  );
  return onSnapshot(
    q,
    (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      callback(data);
    },
    (error) => {
      console.error('Error in subscribeToAppointmentNotes:', error);
      if (error.code === 'permission-denied') {
        callback([]);
      }
    }
  );
};

// Patients
export const createPatient = async (data) => {
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated');

  const docRef = await addDoc(collection(db, 'patients'), {
    ...data,
    userId: user.uid,
    created: {
      by: user.uid,
      on: serverTimestamp(),
    },
    updated: {
      by: user.uid,
      on: serverTimestamp(),
    },
    isDeleted: false,
  });

  return docRef.id;
};

export const updatePatient = async (id, data) => {
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated');

  // Get existing document to preserve userId and created fields
  const docRef = doc(db, 'patients', id);
  const docSnap = await getDoc(docRef);
  
  if (!docSnap.exists()) {
    throw new Error('Patient not found');
  }

  const existingData = docSnap.data();
  
  // Remove fields that shouldn't be updated, but preserve userId and created
  const { userId, created, isDeleted, ...updateData } = data;

  await updateDoc(docRef, {
    ...updateData,
    userId: existingData.userId, // Preserve userId
    created: existingData.created, // Preserve created
    updated: {
      by: user.uid,
      on: serverTimestamp(),
    },
  });
};

export const deletePatient = async (id) => {
  await updateDoc(doc(db, 'patients', id), {
    isDeleted: true,
    updated: {
      by: auth.currentUser.uid,
      on: serverTimestamp(),
    },
  });
};

export const getPatient = async (id) => {
  const docRef = doc(db, 'patients', id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() };
  }
  return null;
};

export const subscribeToUserPatients = (userId, callback) => {
  const q = query(
    collection(db, 'patients'),
    where('userId', '==', userId),
    where('isDeleted', '==', false),
    orderBy('created.on', 'desc')
  );
  return onSnapshot(
    q,
    (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      callback(data);
    },
    (error) => {
      console.error('Error in subscribeToUserPatients:', error);
      if (error.code === 'permission-denied') {
        callback([]);
      }
    }
  );
};

// Doctors
export const createDoctor = async (data) => {
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated');

  const docRef = await addDoc(collection(db, 'doctors'), {
    ...data,
    userId: user.uid,
    created: {
      by: user.uid,
      on: serverTimestamp(),
    },
    updated: {
      by: user.uid,
      on: serverTimestamp(),
    },
    isDeleted: false,
  });

  return docRef.id;
};

export const updateDoctor = async (id, data) => {
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated');

  // Get existing document to preserve userId and created fields
  const docRef = doc(db, 'doctors', id);
  const docSnap = await getDoc(docRef);
  
  if (!docSnap.exists()) {
    throw new Error('Doctor not found');
  }

  const existingData = docSnap.data();
  
  // Remove fields that shouldn't be updated, but preserve userId and created
  const { userId, created, isDeleted, ...updateData } = data;

  await updateDoc(docRef, {
    ...updateData,
    userId: existingData.userId, // Preserve userId
    created: existingData.created, // Preserve created
    updated: {
      by: user.uid,
      on: serverTimestamp(),
    },
  });
};

export const deleteDoctor = async (id) => {
  await updateDoc(doc(db, 'doctors', id), {
    isDeleted: true,
    updated: {
      by: auth.currentUser.uid,
      on: serverTimestamp(),
    },
  });
};

export const subscribeToUserDoctors = (userId, callback) => {
  const q = query(
    collection(db, 'doctors'),
    where('userId', '==', userId),
    where('isDeleted', '==', false),
    orderBy('created.on', 'desc')
  );
  return onSnapshot(
    q,
    (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      callback(data);
    },
    (error) => {
      console.error('Error in subscribeToUserDoctors:', error);
      if (error.code === 'permission-denied') {
        callback([]);
      }
    }
  );
};

// ========================================
// Frequency Options
// ========================================

/**
 * Get all frequency options
 */
export const getFrequencyOptions = async () => {
  const q = query(
    collection(db, 'frequencyOptions'),
    where('isActive', '==', true),
    orderBy('displayOrder', 'asc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

/**
 * Subscribe to frequency options
 */
export const subscribeToFrequencyOptions = (callback) => {
  const q = query(
    collection(db, 'frequencyOptions'),
    where('isActive', '==', true),
    orderBy('displayOrder', 'asc')
  );
  return onSnapshot(
    q,
    (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(data);
    },
    (error) => {
      console.error('Error in subscribeToFrequencyOptions:', error);
      callback([]);
    }
  );
};

// ========================================
// Prescription Medication Intake Tracking
// ========================================

/**
 * Calculate next expected time based on frequency
 */
export const calculateNextExpectedTime = (frequency, lastTakenAt) => {
  if (!frequency || !lastTakenAt) {
    return null;
  }

  // Special case: as needed
  if (frequency.intervalUnit === "as_needed") {
    return null; // No specific time
  }

  const lastTaken = new Date(lastTakenAt);
  const nextTime = new Date(lastTaken);

  switch (frequency.intervalUnit) {
    case "hour":
      nextTime.setHours(nextTime.getHours() + frequency.intervalValue);
      break;
    case "day":
      nextTime.setDate(nextTime.getDate() + frequency.intervalValue);
      break;
    case "week":
      nextTime.setDate(nextTime.getDate() + (frequency.intervalValue * 7));
      break;
    case "month":
      nextTime.setMonth(nextTime.getMonth() + frequency.intervalValue);
      break;
    default:
      return null;
  }

  return nextTime.toISOString();
};

/**
 * Get medication status for today
 */
export const getMedicationStatus = (prescription) => {
  if (!prescription || prescription.trackingEnabled === false) {
    return {
      canMark: false,
      lastTaken: null,
      todayRecords: [],
      nextExpectedTime: null,
      isWithinPeriod: false,
    };
  }

  const intakeRecords = prescription.intakeRecords || [];
  const frequency = prescription.frequency;
  
  // Get today's date
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().split('T')[0];
  
  // Get last taken record
  let lastTaken = null;
  let lastTakenDate = null;
  if (intakeRecords.length > 0) {
    lastTaken = intakeRecords[intakeRecords.length - 1];
    lastTakenDate = new Date(lastTaken.takenAt);
  }
  
  // Filter today's records
  const todayRecords = intakeRecords.filter(record => {
    const takenDate = new Date(record.takenAt);
    takenDate.setHours(0, 0, 0, 0);
    return takenDate.getTime() === today.getTime();
  });
  
  // Check tracking period
  const trackingStart = prescription.trackingStartDate 
    ? new Date(prescription.trackingStartDate)
    : (prescription.datePrescribed ? new Date(prescription.datePrescribed) : today);
  trackingStart.setHours(0, 0, 0, 0);
  
  const trackingEnd = prescription.trackingEndDate 
    ? new Date(prescription.trackingEndDate)
    : null;
  if (trackingEnd) trackingEnd.setHours(0, 0, 0, 0);
  
  const isWithinPeriod = today >= trackingStart && (!trackingEnd || today <= trackingEnd);
  
  // Calculate next expected time
  let nextExpectedTime = null;
  if (lastTaken && frequency) {
    nextExpectedTime = calculateNextExpectedTime(frequency, lastTaken.takenAt);
  }
  
  // Determine if can mark
  let canMark = false;
  
  if (!isWithinPeriod) {
    canMark = false;
  } else if (!frequency || frequency.intervalUnit === "as_needed") {
    canMark = true; // Always allow "as needed"
  } else if (frequency.intervalUnit === "hour") {
    // For hourly, check if enough hours have passed
    if (lastTakenDate) {
      const hoursSinceLastTaken = (new Date() - lastTakenDate) / (1000 * 60 * 60);
      canMark = hoursSinceLastTaken >= frequency.intervalValue;
    } else {
      canMark = true; // First time
    }
  } else {
    // For day/week/month, check if today is the right day
    if (lastTakenDate) {
      const nextExpected = new Date(nextExpectedTime);
      nextExpected.setHours(0, 0, 0, 0);
      canMark = today >= nextExpected;
    } else {
      canMark = true; // First time
    }
  }
  
  return {
    canMark,
    lastTaken,
    lastTakenDate: lastTakenDate ? lastTakenDate.toISOString() : null,
    todayRecords,
    todayCount: todayRecords.length,
    isWithinPeriod,
    trackingStartDate: trackingStart.toISOString().split('T')[0],
    trackingEndDate: trackingEnd ? trackingEnd.toISOString().split('T')[0] : null,
    nextExpectedTime,
    frequency,
  };
};

/**
 * Mark medication as taken
 */
export const markMedicationTaken = async (prescriptionId, notes = '') => {
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated');

  const prescriptionRef = doc(db, 'prescriptions', prescriptionId);
  const prescriptionDoc = await getDoc(prescriptionRef);
  
  if (!prescriptionDoc.exists()) {
    throw new Error('Prescription not found');
  }

  const prescription = prescriptionDoc.data();
  
  if (prescription.trackingEnabled === false) {
    throw new Error('Medication tracking is not enabled');
  }

  const intakeRecords = prescription.intakeRecords || [];
  
  const newRecord = {
    takenAt: new Date().toISOString(),
    markedBy: user.uid,
    notes: notes.trim() || undefined,
  };

  const updatedRecords = [...intakeRecords, newRecord];

  await updateDoc(prescriptionRef, {
    intakeRecords: updatedRecords,
    updated: {
      by: user.uid,
      on: serverTimestamp(),
    },
  });

  return { success: true, record: newRecord };
};

/**
 * Unmark medication (remove last record)
 */
export const unmarkMedicationTaken = async (prescriptionId, recordIndex = null) => {
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated');

  const prescriptionRef = doc(db, 'prescriptions', prescriptionId);
  const prescriptionDoc = await getDoc(prescriptionRef);
  
  if (!prescriptionDoc.exists()) {
    throw new Error('Prescription not found');
  }

  const prescription = prescriptionDoc.data();
  const intakeRecords = [...(prescription.intakeRecords || [])];

  if (intakeRecords.length === 0) {
    throw new Error('No intake records to remove');
  }

  if (recordIndex !== null) {
    intakeRecords.splice(recordIndex, 1);
  } else {
    intakeRecords.pop(); // Remove last
  }

  await updateDoc(prescriptionRef, {
    intakeRecords: intakeRecords,
    updated: {
      by: user.uid,
      on: serverTimestamp(),
    },
  });

  return { success: true };
};

// ========================================
// Patient Vital Signs
// ========================================

/**
 * Add vital signs record to patient
 */
export const addPatientVitalSigns = async (patientId, vitalSignsData) => {
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated');

  // Get patient
  const patientRef = doc(db, 'patients', patientId);
  const patientDoc = await getDoc(patientRef);
  
  if (!patientDoc.exists()) {
    throw new Error('Patient not found');
  }

  const patient = patientDoc.data();
  const vitalSigns = patient.vitalSigns || [];

  // Parse recordedAt - default to now if not provided, or use provided datetime
  let recordedAt;
  if (vitalSignsData.recordedAt) {
    // User provided specific datetime
    recordedAt = new Date(vitalSignsData.recordedAt).toISOString();
  } else {
    // Default to current date/time
    recordedAt = new Date().toISOString();
  }

  // Create new vital signs record
  const newRecord = {
    recordedAt: recordedAt,
    recordedBy: user.uid,
    bloodPressure: vitalSignsData.bloodPressure ? {
      systolic: parseInt(vitalSignsData.bloodPressure.systolic),
      diastolic: parseInt(vitalSignsData.bloodPressure.diastolic),
    } : undefined,
    weight: vitalSignsData.weight ? parseFloat(vitalSignsData.weight) : undefined,
    height: vitalSignsData.height ? parseFloat(vitalSignsData.height) : undefined,
    notes: vitalSignsData.notes?.trim() || undefined,
  };

  // Add to array (prepend so newest is first)
  const updatedVitalSigns = [newRecord, ...vitalSigns];

  await updateDoc(patientRef, {
    vitalSigns: updatedVitalSigns,
    updated: {
      by: user.uid,
      on: serverTimestamp(),
    },
  });

  return { success: true, record: newRecord };
};

/**
 * Update vital signs record
 */
export const updatePatientVitalSigns = async (patientId, recordIndex, vitalSignsData) => {
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated');

  const patientRef = doc(db, 'patients', patientId);
  const patientDoc = await getDoc(patientRef);
  
  if (!patientDoc.exists()) {
    throw new Error('Patient not found');
  }

  const patient = patientDoc.data();
  const vitalSigns = [...(patient.vitalSigns || [])];

  if (!vitalSigns[recordIndex]) {
    throw new Error('Vital signs record not found');
  }

  // Update the record
  const updatedRecord = {
    ...vitalSigns[recordIndex],
    bloodPressure: vitalSignsData.bloodPressure ? {
      systolic: parseInt(vitalSignsData.bloodPressure.systolic),
      diastolic: parseInt(vitalSignsData.bloodPressure.diastolic),
    } : vitalSigns[recordIndex].bloodPressure,
    weight: vitalSignsData.weight !== undefined ? parseFloat(vitalSignsData.weight) : vitalSigns[recordIndex].weight,
    height: vitalSignsData.height !== undefined ? parseFloat(vitalSignsData.height) : vitalSigns[recordIndex].height,
    notes: vitalSignsData.notes !== undefined ? (vitalSignsData.notes.trim() || undefined) : vitalSigns[recordIndex].notes,
  };

  // Update recordedAt if provided
  if (vitalSignsData.recordedAt) {
    updatedRecord.recordedAt = new Date(vitalSignsData.recordedAt).toISOString();
  }

  vitalSigns[recordIndex] = updatedRecord;

  await updateDoc(patientRef, {
    vitalSigns: vitalSigns,
    updated: {
      by: user.uid,
      on: serverTimestamp(),
    },
  });

  return { success: true, record: updatedRecord };
};

/**
 * Delete vital signs record
 */
export const deletePatientVitalSigns = async (patientId, recordIndex) => {
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated');

  const patientRef = doc(db, 'patients', patientId);
  const patientDoc = await getDoc(patientRef);
  
  if (!patientDoc.exists()) {
    throw new Error('Patient not found');
  }

  const patient = patientDoc.data();
  const vitalSigns = [...(patient.vitalSigns || [])];

  if (!vitalSigns[recordIndex]) {
    throw new Error('Vital signs record not found');
  }

  vitalSigns.splice(recordIndex, 1);

  await updateDoc(patientRef, {
    vitalSigns: vitalSigns,
    updated: {
      by: user.uid,
      on: serverTimestamp(),
    },
  });

  return { success: true };
};

/**
 * Get latest vital signs for a patient
 */
export const getLatestVitalSigns = (patient) => {
  if (!patient || !patient.vitalSigns || patient.vitalSigns.length === 0) {
    return null;
  }

  // Records are already sorted newest first
  return patient.vitalSigns[0];
};

/**
 * Manually clean up old vital signs records (called by maintainer)
 * Keep only the most recent N records
 */
export const cleanupPatientVitalSigns = async (patientId, keepRecords = 1000) => {
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated');

  const patientRef = doc(db, 'patients', patientId);
  const patientDoc = await getDoc(patientRef);
  
  if (!patientDoc.exists()) {
    throw new Error('Patient not found');
  }

  const patient = patientDoc.data();
  const vitalSigns = patient.vitalSigns || [];

  if (vitalSigns.length <= keepRecords) {
    return { success: true, removed: 0, kept: vitalSigns.length };
  }

  // Sort by recordedAt (newest first) and keep only keepRecords
  const sorted = [...vitalSigns].sort((a, b) => {
    return new Date(b.recordedAt) - new Date(a.recordedAt);
  });

  const cleanedVitalSigns = sorted.slice(0, keepRecords);
  const removedCount = vitalSigns.length - cleanedVitalSigns.length;

  await updateDoc(patientRef, {
    vitalSigns: cleanedVitalSigns,
    updated: {
      by: user.uid,
      on: serverTimestamp(),
    },
  });

  return { 
    success: true, 
    removed: removedCount, 
    kept: cleanedVitalSigns.length 
  };
};

