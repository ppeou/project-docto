/**
 * Base Repository Pattern
 * Implements SOLID principles:
 * - Single Responsibility: Handles data access for one entity type
 * - Open/Closed: Extensible through inheritance
 * - Dependency Inversion: Depends on abstractions (Firestore)
 * 
 * Follows DRY by providing common CRUD operations
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import {
  createMetadata,
  updateMetadata,
  docToObject,
  snapshotToArray,
} from '@/services/base';

/**
 * Base Repository class for Firestore operations
 * Template Method Pattern: Defines skeleton of operations
 */
export class BaseRepository {
  constructor(collectionName, config = {}) {
    this.collectionName = collectionName;
    this.config = {
      userIdField: config.userIdField || 'created.by', // Field to filter by userId
      userIdArrayField: config.userIdArrayField || false, // If true, use array-contains
      orderByField: config.orderByField || 'created.on',
      orderDirection: config.orderDirection || 'desc',
      transformCreate: config.transformCreate || ((data) => data),
      transformUpdate: config.transformUpdate || ((data) => data),
      ...config,
    };
  }

  /**
   * Create a new document
   */
  async create(data) {
    const user = auth.currentUser;
    if (!user) throw new Error('Not authenticated');

    const transformedData = this.config.transformCreate(data);
    const docRef = await addDoc(collection(db, this.collectionName), {
      ...transformedData,
      ...createMetadata(),
    });

    return docRef.id;
  }

  /**
   * Get a document by ID
   */
  async get(id) {
    const docRef = doc(db, this.collectionName, id);
    const docSnap = await getDoc(docRef);
    return docToObject(docSnap);
  }

  /**
   * Update a document
   */
  async update(id, data) {
    const user = auth.currentUser;
    if (!user) throw new Error('Not authenticated');

    const transformedData = this.config.transformUpdate(data);
    await updateDoc(doc(db, this.collectionName, id), {
      ...transformedData,
      ...updateMetadata(),
    });
  }

  /**
   * Soft delete a document
   */
  async delete(id) {
    await updateDoc(doc(db, this.collectionName, id), {
      isDeleted: true,
      ...updateMetadata(),
    });
  }

  /**
   * Create query for user's documents
   */
  createUserQuery(userId, orderByField = null, orderDirection = null) {
    const orderField = orderByField || this.config.orderByField;
    const orderDir = orderDirection || this.config.orderDirection;

    const constraints = [
      // If userIdField points to an array (e.g., memberIds), use array-contains
      this.config.userIdArrayField
        ? where(this.config.userIdField, 'array-contains', userId)
        : where(this.config.userIdField, '==', userId),
      where('isDeleted', '==', false),
      orderBy(orderField, orderDir),
    ];

    return query(collection(db, this.collectionName), ...constraints);
  }

  /**
   * Subscribe to user's documents
   */
  subscribeToUserDocuments(userId, callback, orderByField = null, orderDirection = null) {
    const q = this.createUserQuery(userId, orderByField, orderDirection);
    return onSnapshot(
      q,
      (snapshot) => {
        callback(snapshotToArray(snapshot));
      },
      (error) => {
        console.error(`Error in subscribeToUserDocuments (${this.collectionName}):`, error);
        if (error.code === 'permission-denied') {
          callback([]);
        }
      }
    );
  }

  /**
   * Create query for documents filtered by a field
   * For appointments and prescriptions, also filters by user ownership
   */
  createFilteredQuery(filterField, filterValue, orderByField = null, orderDirection = null) {
    const orderField = orderByField || this.config.orderByField;
    const orderDir = orderDirection || this.config.orderDirection;

    const constraints = [
      where(filterField, '==', filterValue),
      where('isDeleted', '==', false),
    ];

    constraints.push(orderBy(orderField, orderDir));

    return query(
      collection(db, this.collectionName),
      ...constraints
    );
  }

  /**
   * Subscribe to filtered documents
   */
  subscribeToFilteredDocuments(filterField, filterValue, callback, orderByField = null, orderDirection = null) {
    const q = this.createFilteredQuery(filterField, filterValue, orderByField, orderDirection);
    return onSnapshot(
      q,
      (snapshot) => {
        callback(snapshotToArray(snapshot));
      },
      (error) => {
        console.error(`Error in subscribeToFilteredDocuments (${this.collectionName}):`, error);
        if (error.code === 'permission-denied') {
          callback([]);
        }
      }
    );
  }
}

