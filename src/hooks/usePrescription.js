import { useState, useEffect } from 'react';
import { 
  getPrescription, 
  markMedicationTaken, 
  unmarkMedicationTaken,
  getMedicationStatus 
} from '@/services/firestore';

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

  const markTaken = async (notes = '') => {
    if (!prescription) return;
    try {
      await markMedicationTaken(id, notes);
      // Refetch to update UI
      const updated = await getPrescription(id);
      setPrescription(updated);
    } catch (err) {
      throw err;
    }
  };

  const unmarkTaken = async (recordIndex = null) => {
    if (!prescription) return;
    try {
      await unmarkMedicationTaken(id, recordIndex);
      const updated = await getPrescription(id);
      setPrescription(updated);
    } catch (err) {
      throw err;
    }
  };

  const medicationStatus = prescription ? getMedicationStatus(prescription) : null;

  return { 
    prescription, 
    loading, 
    error, 
    markTaken, 
    unmarkTaken, 
    medicationStatus 
  };
}

