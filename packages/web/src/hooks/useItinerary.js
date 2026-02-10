import { useDocument } from './useDocument';

export function useItinerary(id) {
  const { data, loading, error } = useDocument('itineraries', id);
  return { itinerary: data, loading, error };
}
