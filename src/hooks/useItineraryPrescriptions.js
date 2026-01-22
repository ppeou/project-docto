import { useEntitySubscription } from './useEntitySubscription';

/**
 * Hook for fetching prescriptions for an itinerary
 * Uses generic entity subscription hook with filtering (DRY)
 */
export function useItineraryPrescriptions(itineraryId) {
  const { data: prescriptions, loading } = useEntitySubscription('prescriptions', null, {
    filterField: 'itineraryId',
    filterValue: itineraryId,
    orderByField: 'datePrescribed',
    orderDirection: 'desc',
  });

  return { prescriptions, loading };
}

