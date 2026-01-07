import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { subscribeToUserDoctors } from '@/services/firestore';

export function useDoctors() {
  const { user } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setDoctors([]);
      setLoading(false);
      return;
    }

    const unsubscribe = subscribeToUserDoctors(user.uid, (data) => {
      setDoctors(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  return { doctors, loading };
}

