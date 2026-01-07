import { useState, useEffect } from 'react';
import { subscribeToAppointmentNotes } from '@/services/firestore';

export function useAppointmentNotes(appointmentId) {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!appointmentId) {
      setNotes([]);
      setLoading(false);
      return;
    }

    const unsubscribe = subscribeToAppointmentNotes(appointmentId, (data) => {
      setNotes(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [appointmentId]);

  return { notes, loading };
}

