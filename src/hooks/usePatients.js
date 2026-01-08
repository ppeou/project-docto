import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { 
  subscribeToUserPatients, 
  addPatientVitalSigns,
  updatePatientVitalSigns,
  deletePatientVitalSigns,
  cleanupPatientVitalSigns,
  getPatient
} from '@/services/firestore';

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

  const addVitalSigns = async (patientId, vitalSignsData) => {
    try {
      await addPatientVitalSigns(patientId, vitalSignsData);
      // Refetch patient to update UI
      const updated = await getPatient(patientId);
      setPatients(prev => prev.map(p => p.id === patientId ? updated : p));
    } catch (err) {
      throw err;
    }
  };

  const updateVitalSigns = async (patientId, recordIndex, vitalSignsData) => {
    try {
      await updatePatientVitalSigns(patientId, recordIndex, vitalSignsData);
      const updated = await getPatient(patientId);
      setPatients(prev => prev.map(p => p.id === patientId ? updated : p));
    } catch (err) {
      throw err;
    }
  };

  const removeVitalSigns = async (patientId, recordIndex) => {
    try {
      await deletePatientVitalSigns(patientId, recordIndex);
      const updated = await getPatient(patientId);
      setPatients(prev => prev.map(p => p.id === patientId ? updated : p));
    } catch (err) {
      throw err;
    }
  };

  const cleanupVitalSigns = async (patientId, keepRecords = 1000) => {
    try {
      await cleanupPatientVitalSigns(patientId, keepRecords);
      const updated = await getPatient(patientId);
      setPatients(prev => prev.map(p => p.id === patientId ? updated : p));
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

