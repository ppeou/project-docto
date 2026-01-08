import { useState, useEffect } from 'react';
import { subscribeToFrequencyOptions } from '@/services/firestore';
import { useAuth } from './useAuth';

export function useFrequencyOptions() {
  const { user } = useAuth();
  const [frequencyOptions, setFrequencyOptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setFrequencyOptions([]);
      setLoading(false);
      return;
    }

    const unsubscribe = subscribeToFrequencyOptions((data) => {
      setFrequencyOptions(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  return { frequencyOptions, loading };
}

