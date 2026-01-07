import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export function useDoctorNote(id) {
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    const fetchNote = async () => {
      try {
        setLoading(true);
        const docRef = doc(db, 'doctorNotes', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setNote({ id: docSnap.id, ...docSnap.data() });
          setError(null);
        } else {
          setError(new Error('Note not found'));
          setNote(null);
        }
      } catch (err) {
        setError(err);
        setNote(null);
      } finally {
        setLoading(false);
      }
    };

    fetchNote();
  }, [id]);

  return { note, loading, error };
}

