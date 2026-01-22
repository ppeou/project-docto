import { useAuth } from './useAuth';
import { useEntitySubscription } from './useEntitySubscription';

/**
 * Hook for fetching user itineraries
 * Uses generic entity subscription hook (DRY)
 */
export function useItineraries() {
  const { user } = useAuth();
  const { data: itineraries, loading } = useEntitySubscription('itineraries', user?.uid);

  return { itineraries, loading };
}

