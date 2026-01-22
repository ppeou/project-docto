import { useAuth } from './useAuth';
import { useEntitySubscription } from './useEntitySubscription';

/**
 * Hook for fetching user doctors
 * Uses generic entity subscription hook (DRY)
 */
export function useDoctors() {
  const { user } = useAuth();
  const { data: doctors, loading } = useEntitySubscription('doctors', user?.uid);

  return { doctors, loading };
}

