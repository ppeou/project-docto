import { useEntitySubscription } from './useEntitySubscription';

/**
 * Hook for fetching appointments for an itinerary
 * Uses generic entity subscription hook with filtering (DRY)
 */
export function useItineraryAppointments(itineraryId) {
  const { data: appointments, loading } = useEntitySubscription('appointments', null, {
    filterField: 'itineraryId',
    filterValue: itineraryId,
    orderByField: 'appointmentDate',
    orderDirection: 'asc',
  });

  return { appointments, loading };
}

