import { useState, useEffect } from 'react';
import { getDoctor } from '@/services/firestore';

export function useDoctor(doctorId) {
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!doctorId) {
      setDoctor(null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    getDoctor(doctorId)
      .then((data) => {
        if (!cancelled) setDoctor(data ? { id: doctorId, ...data } : null);
      })
      .catch((err) => { if (!cancelled) setError(err); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [doctorId]);

  return { doctor, loading, error };
}
