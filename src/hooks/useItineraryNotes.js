import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export function useItineraryNotes(itineraryId) {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!itineraryId) {
      setNotes([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'doctorNotes'),
      where('itineraryId', '==', itineraryId),
      where('isDeleted', '==', false),
      orderBy('created.on', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setNotes(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [itineraryId]);

  return { notes, loading };
}

