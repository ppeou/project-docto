/**
 * Refactored Firestore service using Repository pattern
 * Maintains backward compatibility with existing code
 * Follows SOLID principles and DRY
 */

import { getRepository } from './repositories/EntityRepositoryFactory';
import { Timestamp } from 'firebase/firestore';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { serverTimestamp } from 'firebase/firestore';

// ========================================
// Itineraries - Using Repository Pattern
// ========================================

export const createItinerary = async (data) => {
  const repo = getRepository('itineraries');
  return await repo.create(data);
};

export const getItinerary = async (id) => {
  const repo = getRepository('itineraries');
  return await repo.get(id);
};

export const updateItinerary = async (id, data) => {
  const repo = getRepository('itineraries');
  return await repo.update(id, data);
};

export const deleteItinerary = async (id) => {
  const repo = getRepository('itineraries');
  return await repo.delete(id);
};

export const getUserItineraries = async (userId) => {
  const repo = getRepository('itineraries');
  return new Promise((resolve, reject) => {
    const unsubscribe = repo.subscribeToUserDocuments(userId, (data) => {
      unsubscribe();
      resolve(data);
    });
  });
};

export const subscribeToUserItineraries = (userId, callback) => {
  const repo = getRepository('itineraries');
  return repo.subscribeToUserDocuments(userId, callback);
};

// ========================================
// Appointments - Using Repository Pattern
// ========================================

export const createAppointment = async (data) => {
  const repo = getRepository('appointments');
  return await repo.create(data);
};

export const getAppointment = async (id) => {
  const repo = getRepository('appointments');
  return await repo.get(id);
};

export const updateAppointment = async (id, data) => {
  const repo = getRepository('appointments');
  return await repo.update(id, data);
};

export const deleteAppointment = async (id) => {
  const repo = getRepository('appointments');
  return await repo.delete(id);
};

export const subscribeToItineraryAppointments = (itineraryId, callback) => {
  const repo = getRepository('appointments');
  return repo.subscribeToFilteredDocuments('itineraryId', itineraryId, callback, 'appointmentDate', 'asc');
};

// ========================================
// Prescriptions - Using Repository Pattern
// ========================================

export const createPrescription = async (data) => {
  const repo = getRepository('prescriptions');
  return await repo.create(data);
};

export const getPrescription = async (id) => {
  const repo = getRepository('prescriptions');
  return await repo.get(id);
};

export const updatePrescription = async (id, data) => {
  const repo = getRepository('prescriptions');
  return await repo.update(id, data);
};

export const deletePrescription = async (id) => {
  const repo = getRepository('prescriptions');
  return await repo.delete(id);
};

export const subscribeToItineraryPrescriptions = (itineraryId, callback) => {
  const repo = getRepository('prescriptions');
  return repo.subscribeToFilteredDocuments('itineraryId', itineraryId, callback, 'datePrescribed', 'desc');
};

// ========================================
// Doctor Notes - Using Repository Pattern
// ========================================

export const createDoctorNote = async (data) => {
  const repo = getRepository('doctorNotes');
  return await repo.create(data);
};

export const getDoctorNote = async (id) => {
  const repo = getRepository('doctorNotes');
  return await repo.get(id);
};

export const updateDoctorNote = async (id, data) => {
  const repo = getRepository('doctorNotes');
  return await repo.update(id, data);
};

export const deleteDoctorNote = async (id) => {
  const repo = getRepository('doctorNotes');
  return await repo.delete(id);
};

export const subscribeToAppointmentNotes = (appointmentId, callback) => {
  const repo = getRepository('doctorNotes');
  return repo.subscribeToFilteredDocuments('appointmentId', appointmentId, callback, 'created.on', 'desc');
};

// ========================================
// Patients - Using Repository Pattern
// ========================================

export const createPatient = async (data) => {
  const repo = getRepository('patients');
  return await repo.create(data);
};

export const getPatient = async (id) => {
  const repo = getRepository('patients');
  return await repo.get(id);
};

export const updatePatient = async (id, data) => {
  const repo = getRepository('patients');
  // Get existing document to preserve userId and created fields
  const existing = await repo.get(id);
  if (!existing) {
    throw new Error('Patient not found');
  }
  
  // Preserve userId and created fields
  const updateData = {
    ...data,
    userId: existing.userId,
    created: existing.created,
  };
  
  return await repo.update(id, updateData);
};

export const deletePatient = async (id) => {
  const repo = getRepository('patients');
  return await repo.delete(id);
};

export const subscribeToUserPatients = (userId, callback) => {
  const repo = getRepository('patients');
  return repo.subscribeToUserDocuments(userId, callback);
};

// ========================================
// Doctors - Using Repository Pattern
// ========================================

export const createDoctor = async (data) => {
  const repo = getRepository('doctors');
  return await repo.create(data);
};

export const getDoctor = async (id) => {
  const repo = getRepository('doctors');
  return await repo.get(id);
};

export const updateDoctor = async (id, data) => {
  const repo = getRepository('doctors');
  // Get existing document to preserve userId and created fields
  const existing = await repo.get(id);
  if (!existing) {
    throw new Error('Doctor not found');
  }
  
  // Preserve userId and created fields
  const updateData = {
    ...data,
    userId: existing.userId,
    created: existing.created,
  };
  
  return await repo.update(id, updateData);
};

export const deleteDoctor = async (id) => {
  const repo = getRepository('doctors');
  return await repo.delete(id);
};

export const subscribeToUserDoctors = (userId, callback) => {
  const repo = getRepository('doctors');
  return repo.subscribeToUserDocuments(userId, callback);
};

// ========================================
// Frequency Options
// ========================================

export const getFrequencyOptions = async () => {
  const repo = getRepository('frequencyOptions');
  return new Promise((resolve, reject) => {
    // Frequency options don't have userId filtering, so we need a custom query
    const { collection, query, where, orderBy, getDocs } = require('firebase/firestore');
    const q = query(
      collection(db, 'frequencyOptions'),
      where('isActive', '==', true),
      orderBy('displayOrder', 'asc')
    );
    getDocs(q).then((snapshot) => {
      resolve(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }).catch(reject);
  });
};

export const subscribeToFrequencyOptions = (callback) => {
  const { collection, query, where, orderBy, onSnapshot } = require('firebase/firestore');
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

export const getLatestVitalSigns = (patient) => {
  if (!patient || !patient.vitalSigns || patient.vitalSigns.length === 0) {
    return null;
  }

  // Records are already sorted newest first
  return patient.vitalSigns[0];
};

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

