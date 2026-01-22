import { useEntitySubscription } from './useEntitySubscription';

/**
 * Hook for fetching doctor notes for an appointment
 * Uses generic entity subscription hook with filtering (DRY)
 */
export function useAppointmentNotes(appointmentId) {
  const { data: notes, loading } = useEntitySubscription('doctorNotes', null, {
    filterField: 'appointmentId',
    filterValue: appointmentId,
    orderByField: 'created.on',
    orderDirection: 'desc',
  });

  return { notes, loading };
}

