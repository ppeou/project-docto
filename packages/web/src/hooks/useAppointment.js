import { useState, useEffect } from 'react';
import { getAppointment } from '@/services/firestore';

export function useAppointment(id) {
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    const fetchAppointment = async () => {
      try {
        setLoading(true);
        const data = await getAppointment(id);
        setAppointment(data);
        setError(null);
      } catch (err) {
        setError(err);
        setAppointment(null);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointment();
  }, [id]);

  return { appointment, loading, error };
}

