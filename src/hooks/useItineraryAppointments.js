import { useState, useEffect } from 'react';
import { subscribeToItineraryAppointments } from '@/services/firestore';

export function useItineraryAppointments(itineraryId) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!itineraryId) {
      setAppointments([]);
      setLoading(false);
      return;
    }

    const unsubscribe = subscribeToItineraryAppointments(itineraryId, (data) => {
      setAppointments(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [itineraryId]);

  return { appointments, loading };
}

