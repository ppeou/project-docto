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
import { db, auth } from '@core/services/firebase';

/**
 * Base service utilities for Firestore operations
 * Follows DRY principle by extracting common patterns
 */

/**
 * Get current authenticated user
 * @throws {Error} If user is not authenticated
 */
export function getCurrentUser() {
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated');
  return user;
}

/**
 * Create metadata for document creation
 */
export function createMetadata() {
  const user = getCurrentUser();
  return {
    created: {
      by: user.uid,
      on: serverTimestamp(),
    },
    updated: {
      by: user.uid,
      on: serverTimestamp(),
    },
    isDeleted: false,
  };
}

/**
 * Create metadata for document update
 */
export function updateMetadata() {
  const user = getCurrentUser();
  return {
    updated: {
      by: user.uid,
      on: serverTimestamp(),
    },
  };
}

/**
 * Soft delete a document
 */
export async function softDelete(collectionName, id) {
  const docRef = doc(db, collectionName, id);
  await updateDoc(docRef, {
    isDeleted: true,
    ...updateMetadata(),
  });
}

/**
 * Convert Firestore document to plain object
 */
export function docToObject(docSnap) {
  if (!docSnap.exists()) return null;
  return { id: docSnap.id, ...docSnap.data() };
}

/**
 * Convert Firestore query snapshot to array of objects
 */
export function snapshotToArray(snapshot) {
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

/**
 * Create a document with metadata
 */
export async function createDocument(collectionName, data) {
  const docRef = await addDoc(collection(db, collectionName), {
    ...data,
    ...createMetadata(),
  });
  return docRef.id;
}

/**
 * Get a document by ID
 */
export async function getDocument(collectionName, id) {
  const docRef = doc(db, collectionName, id);
  const docSnap = await getDoc(docRef);
  return docToObject(docSnap);
}

/**
 * Update a document with metadata
 */
export async function updateDocument(collectionName, id, data) {
  const docRef = doc(db, collectionName, id);
  await updateDoc(docRef, {
    ...data,
    ...updateMetadata(),
  });
}

/**
 * Create a query for user's documents
 */
export function createUserQuery(collectionName, userId, orderByField = 'created.on', orderDirection = 'desc') {
  return query(
    collection(db, collectionName),
    where('created.by', '==', userId),
    where('isDeleted', '==', false),
    orderBy(orderByField, orderDirection)
  );
}

/**
 * Subscribe to user's documents
 */
export function subscribeToUserDocuments(collectionName, userId, callback, orderByField = 'created.on', orderDirection = 'desc') {
  const q = createUserQuery(collectionName, userId, orderByField, orderDirection);
  return onSnapshot(
    q,
    (snapshot) => {
      callback(snapshotToArray(snapshot));
    },
    (error) => {
      console.error(`Error in subscribeToUserDocuments (${collectionName}):`, error);
      if (error.code === 'permission-denied') {
        callback([]);
      }
    }
  );
}

