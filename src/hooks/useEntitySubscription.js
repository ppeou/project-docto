/**
 * Generic hook for entity subscriptions
 * Follows DRY principle by extracting common subscription pattern
 * Template Method Pattern: Defines skeleton of subscription logic
 * 
 * @param {string} entityType - Type of entity (itineraries, patients, etc.)
 * @param {string} userId - User ID to filter by
 * @param {Object} options - Additional options
 * @returns {Object} { data, loading, error }
 */

import { useState, useEffect } from 'react';
import { getRepository } from '@/services/repositories/EntityRepositoryFactory';

export function useEntitySubscription(entityType, userId, options = {}) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      const repository = getRepository(entityType);
      const { orderByField, orderDirection, filterField, filterValue } = options;

      let unsubscribe;

      if (filterField && filterValue) {
        // Subscribe to filtered documents (e.g., appointments by itinerary)
        // This works even without userId - Firestore rules will handle permissions
        unsubscribe = repository.subscribeToFilteredDocuments(
          filterField,
          filterValue,
          (items) => {
            setData(items);
            setLoading(false);
            setError(null);
          },
          orderByField,
          orderDirection
        );
      } else if (userId) {
        // Subscribe to user's documents (requires userId)
        unsubscribe = repository.subscribeToUserDocuments(
          userId,
          (items) => {
            setData(items);
            setLoading(false);
            setError(null);
          },
          orderByField,
          orderDirection
        );
      } else {
        // No userId and no filter - can't query
        setData([]);
        setLoading(false);
        return;
      }

      return () => {
        if (unsubscribe) unsubscribe();
      };
    } catch (err) {
      console.error(`Error in useEntitySubscription (${entityType}):`, err);
      setError(err);
      setLoading(false);
      setData([]);
    }
  }, [entityType, userId, JSON.stringify(options)]);

  return { data, loading, error };
}

