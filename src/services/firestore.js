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
  return onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    callback(data);
  });
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
  return onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    callback(data);
  });
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
  return onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    callback(data);
  });
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
  return onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    callback(data);
  });
};

