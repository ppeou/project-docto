import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { useAuth } from './useAuth';

export function useSpecialties() {
  const { user } = useAuth();
  const [specialties, setSpecialties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setSpecialties([]);
      setLoading(false);
      return;
    }

    let unsubscribe;
    
    try {
      const q = query(
        collection(db, 'specialties'),
        orderBy('name', 'asc')
      );
      
      unsubscribe = onSnapshot(
        q, 
        (snapshot) => {
          const data = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setSpecialties(data);
          setLoading(false);
        }, 
        (error) => {
          console.error('Error fetching specialties:', error);
          // If permission denied or collection doesn't exist, set empty array
          if (error.code === 'permission-denied' || error.code === 'failed-precondition') {
            setSpecialties([]);
          }
          setLoading(false);
        }
      );
    } catch (error) {
      console.error('Error setting up specialties query:', error);
      setSpecialties([]);
      setLoading(false);
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [user]);

  return { specialties, loading };
}

