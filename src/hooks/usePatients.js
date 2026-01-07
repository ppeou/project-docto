import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { subscribeToUserPatients } from '@/services/firestore';

export function usePatients() {
  const { user } = useAuth();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setPatients([]);
      setLoading(false);
      return;
    }

    const unsubscribe = subscribeToUserPatients(user.uid, (data) => {
      setPatients(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  return { patients, loading };
}

