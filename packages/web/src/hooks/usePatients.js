import { useAuth } from './useAuth';
import { useEntitySubscription } from './useEntitySubscription';
import { 
  addPatientVitalSigns,
  updatePatientVitalSigns,
  deletePatientVitalSigns,
  cleanupPatientVitalSigns,
  getPatient
} from '@/services/firestore';

/**
 * Hook for fetching user patients
 * Uses generic entity subscription hook (DRY)
 * Extends with patient-specific operations (vital signs)
 */
export function usePatients() {
  const { user } = useAuth();
  const { data: patients, loading } = useEntitySubscription('patients', user?.uid);

  const addVitalSigns = async (patientId, vitalSignsData) => {
    try {
      await addPatientVitalSigns(patientId, vitalSignsData);
      // Refetch patient to update UI
      const updated = await getPatient(patientId);
      // Note: The subscription will automatically update, but we can manually update for immediate feedback
    } catch (err) {
      throw err;
    }
  };

  const updateVitalSigns = async (patientId, recordIndex, vitalSignsData) => {
    try {
      await updatePatientVitalSigns(patientId, recordIndex, vitalSignsData);
    } catch (err) {
      throw err;
    }
  };

  const removeVitalSigns = async (patientId, recordIndex) => {
    try {
      await deletePatientVitalSigns(patientId, recordIndex);
    } catch (err) {
      throw err;
    }
  };

  const cleanupVitalSigns = async (patientId, keepRecords = 1000) => {
    try {
      await cleanupPatientVitalSigns(patientId, keepRecords);
      return { success: true };
    } catch (err) {
      throw err;
    }
  };

  return { 
    patients, 
    loading,
    addVitalSigns,
    updateVitalSigns,
    removeVitalSigns,
    cleanupVitalSigns,
  };
}

