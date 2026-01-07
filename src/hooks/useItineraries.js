import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { subscribeToUserItineraries } from '@/services/firestore';

export function useItineraries() {
  const { user } = useAuth();
  const [itineraries, setItineraries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setItineraries([]);
      setLoading(false);
      return;
    }

    const unsubscribe = subscribeToUserItineraries(user.uid, (data) => {
      setItineraries(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  return { itineraries, loading };
}

