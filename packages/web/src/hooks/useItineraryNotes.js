import { useEntitySubscription } from './useEntitySubscription';

/**
 * Hook for fetching doctor notes for an itinerary
 * Uses generic entity subscription hook with filtering (DRY)
 */
export function useItineraryNotes(itineraryId) {
  const { data: notes, loading } = useEntitySubscription('doctorNotes', null, {
    filterField: 'itineraryId',
    filterValue: itineraryId,
    orderByField: 'created.on',
    orderDirection: 'desc',
  });

  return { notes, loading };
}

