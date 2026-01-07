import { useState, useEffect } from 'react';
import { getPrescription } from '@/services/firestore';

export function usePrescription(id) {
  const [prescription, setPrescription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    const fetchPrescription = async () => {
      try {
        setLoading(true);
        const data = await getPrescription(id);
        setPrescription(data);
        setError(null);
      } catch (err) {
        setError(err);
        setPrescription(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPrescription();
  }, [id]);

  return { prescription, loading, error };
}

