/**
 * Factory Pattern for creating entity repositories
 * Follows SOLID Open/Closed Principle - open for extension, closed for modification
 * 
 * Strategy Pattern: Different strategies for different entity types
 */

import { BaseRepository } from './BaseRepository';
import { Timestamp } from 'firebase/firestore';
import { auth } from '@core/services/firebase';

/**
 * Factory function to create entity repositories
 * Factory Pattern implementation
 */
export function createEntityRepository(collectionName, config = {}) {
  return new BaseRepository(collectionName, config);
}

/**
 * Pre-configured repositories for common entities
 * Strategy Pattern: Each entity has its own strategy/configuration
 */
export const repositoryFactory = {
  /**
   * Itineraries repository
   */
  itineraries: () => createEntityRepository('itineraries', {
    // Use memberIds array for user-based queries so collaborators can see shared itineraries
    userIdField: 'memberIds',
    userIdArrayField: true,
    orderByField: 'created.on',
    orderDirection: 'desc',
    transformCreate: (data) => {
      const user = auth.currentUser;
      const ownerId = user ? user.uid : undefined;
      const existingMemberIds = Array.isArray(data.memberIds) ? data.memberIds : [];
      const memberIds = ownerId
        ? Array.from(new Set([...existingMemberIds, ownerId]))
        : existingMemberIds;

      return {
        ...data,
        ownerId: data.ownerId || ownerId,
        memberIds,
      };
    },
  }),

  /**
   * Appointments repository
   */
  appointments: () => createEntityRepository('appointments', {
    userIdField: 'created.by',
    orderByField: 'appointmentDate',
    orderDirection: 'asc',
    transformCreate: (data) => ({
      ...data,
      appointmentDate: Timestamp.fromDate(new Date(data.appointmentDate)),
      status: data.status || 1, // scheduled
    }),
    transformUpdate: (data) => {
      const updateData = { ...data };
      if (updateData.appointmentDate) {
        updateData.appointmentDate = Timestamp.fromDate(new Date(updateData.appointmentDate));
      }
      return updateData;
    },
  }),

  /**
   * Prescriptions repository
   */
  prescriptions: () => createEntityRepository('prescriptions', {
    userIdField: 'created.by',
    orderByField: 'datePrescribed',
    orderDirection: 'desc',
    transformCreate: (data) => ({
      ...data,
      datePrescribed: Timestamp.fromDate(new Date(data.datePrescribed)),
      nextRefillDate: data.nextRefillDate ? Timestamp.fromDate(new Date(data.nextRefillDate)) : null,
      intakeRecords: data.intakeRecords || [],
      trackingStartDate: data.trackingStartDate || new Date().toISOString().split('T')[0],
      trackingEndDate: data.trackingEndDate || null,
      trackingEnabled: data.trackingEnabled !== false,
      status: data.status || 1, // active
    }),
    transformUpdate: (data) => {
      const updateData = { ...data };
      if (updateData.datePrescribed) {
        updateData.datePrescribed = Timestamp.fromDate(new Date(updateData.datePrescribed));
      }
      if (updateData.nextRefillDate) {
        updateData.nextRefillDate = Timestamp.fromDate(new Date(updateData.nextRefillDate));
      }
      return updateData;
    },
  }),

  /**
   * Doctor Notes repository
   */
  doctorNotes: () => createEntityRepository('doctorNotes', {
    userIdField: 'created.by',
    orderByField: 'created.on',
    orderDirection: 'desc',
  }),

  /**
   * Patients repository
   */
  patients: () => createEntityRepository('patients', {
    userIdField: 'userId',
    orderByField: 'created.on',
    orderDirection: 'desc',
    transformUpdate: (data) => {
      // Remove fields that shouldn't be updated
      const { userId, created, isDeleted, ...updateData } = data;
      return updateData;
    },
  }),

  /**
   * Doctors repository
   */
  doctors: () => createEntityRepository('doctors', {
    userIdField: 'userId',
    orderByField: 'created.on',
    orderDirection: 'desc',
    transformUpdate: (data) => {
      // Remove fields that shouldn't be updated
      const { userId, created, isDeleted, ...updateData } = data;
      return updateData;
    },
  }),

  /**
   * Frequency Options repository (read-only, no user filtering)
   */
  frequencyOptions: () => createEntityRepository('frequencyOptions', {
    userIdField: null, // No user filtering
    orderByField: 'displayOrder',
    orderDirection: 'asc',
  }),
};

/**
 * Get a repository instance for an entity
 * @param {string} entityType - Type of entity (itineraries, appointments, etc.)
 * @returns {BaseRepository} Repository instance
 */
export function getRepository(entityType) {
  const factory = repositoryFactory[entityType];
  if (!factory) {
    throw new Error(`Repository factory not found for entity type: ${entityType}`);
  }
  return factory();
}

