import { useState, useEffect } from 'react';
import { getItinerary } from '@/services/firestore';

export function useItinerary(id) {
  const [itinerary, setItinerary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    const fetchItinerary = async () => {
      try {
        setLoading(true);
        const data = await getItinerary(id);
        setItinerary(data);
        setError(null);
      } catch (err) {
        setError(err);
        setItinerary(null);
      } finally {
        setLoading(false);
      }
    };

    fetchItinerary();
  }, [id]);

  return { itinerary, loading, error };
}

