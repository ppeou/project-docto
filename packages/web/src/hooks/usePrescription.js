import { useCallback } from 'react';
import { useDocument } from './useDocument';
import { getMedicationStatus, markMedicationTaken, unmarkMedicationTaken } from '@/services/firestore';

export function usePrescription(id) {
  const { data: prescription, loading, error, refetch } = useDocument('prescriptions', id);
  const medicationStatus = prescription ? getMedicationStatus(prescription) : null;

  const markTaken = useCallback(
    async (notes = '') => {
      await markMedicationTaken(id, notes);
      refetch();
    },
    [id, refetch]
  );

  const unmarkTaken = useCallback(
    async (recordIndex = null) => {
      await unmarkMedicationTaken(id, recordIndex);
      refetch();
    },
    [id, refetch]
  );

  return { prescription, loading, error, markTaken, unmarkTaken, medicationStatus };
}
