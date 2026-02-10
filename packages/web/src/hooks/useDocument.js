import { useState, useEffect, useCallback } from 'react';
import {
  getItinerary,
  getAppointment,
  getPrescription,
  getDoctorNote,
  getPatient,
  getDoctor,
} from '@/services/firestore';

const getters = {
  itineraries: getItinerary,
  appointments: getAppointment,
  prescriptions: getPrescription,
  doctorNotes: getDoctorNote,
  patients: getPatient,
  doctors: getDoctor,
};

/**
 * Generic hook to fetch a single document by id.
 * Returns refetch to re-load after mutations (e.g. prescription intake).
 */
export function useDocument(entityType, id) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refetchTick, setRefetchTick] = useState(0);

  const refetch = useCallback(() => setRefetchTick((t) => t + 1), []);

  useEffect(() => {
    if (!id) {
      setData(null);
      setLoading(false);
      return;
    }

    const fetchFn = getters[entityType];
    if (!fetchFn) {
      setError(new Error(`Unknown entity: ${entityType}`));
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchFn(id)
      .then((result) => {
        if (!cancelled) {
          setData(result);
          setError(null);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err);
          setData(null);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [entityType, id, refetchTick]);

  return { data, loading, error, refetch };
}
