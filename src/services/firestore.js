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
    datePrescribed: Timestamp.fromDate(new Date(data.datePrescribed)),
    nextRefillDate: data.nextRefillDate ? Timestamp.fromDate(new Date(data.nextRefillDate)) : null,
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

