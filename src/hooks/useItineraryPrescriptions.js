import { useState, useEffect } from 'react';
import { subscribeToItineraryPrescriptions } from '@/services/firestore';

export function useItineraryPrescriptions(itineraryId) {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!itineraryId) {
      setPrescriptions([]);
      setLoading(false);
      return;
    }

    const unsubscribe = subscribeToItineraryPrescriptions(itineraryId, (data) => {
      setPrescriptions(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [itineraryId]);

  return { prescriptions, loading };
}

