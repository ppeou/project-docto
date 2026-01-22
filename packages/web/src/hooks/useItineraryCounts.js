import { useState, useEffect, useMemo } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@core/services/firebase';

/**
 * Hook to get appointment and prescription counts for multiple itineraries
 * Queries appointments/prescriptions for each itinerary and aggregates counts
 */
export function useItineraryCounts(itineraryIds) {
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!itineraryIds || itineraryIds.length === 0) {
      setAppointments([]);
      setPrescriptions([]);
      setLoading(false);
      return;
    }

    const unsubscribes = [];

    // Subscribe to appointments for all itineraries
    // Firestore rules will filter by membership, so we get all appointments user can access
    itineraryIds.forEach((itineraryId) => {
      const appointmentsQuery = query(
        collection(db, 'appointments'),
        where('itineraryId', '==', itineraryId),
        where('isDeleted', '==', false)
      );

      const unsubscribeAppointments = onSnapshot(
        appointmentsQuery,
        (snapshot) => {
          setAppointments((prev) => {
            // Remove old appointments for this itinerary
            const filtered = prev.filter((a) => a.itineraryId !== itineraryId);
            // Add new appointments
            const newAppointments = snapshot.docs.map((doc) => ({
              id: doc.id,
              itineraryId,
              ...doc.data(),
            }));
            return [...filtered, ...newAppointments];
          });
          setLoading(false);
        },
        (error) => {
          console.error(`Error subscribing to appointments for itinerary ${itineraryId}:`, error);
          if (error.code === 'permission-denied') {
            // User doesn't have access to this itinerary's appointments
            setLoading(false);
          }
        }
      );

      unsubscribes.push(unsubscribeAppointments);

      // Subscribe to prescriptions for all itineraries
      const prescriptionsQuery = query(
        collection(db, 'prescriptions'),
        where('itineraryId', '==', itineraryId),
        where('isDeleted', '==', false)
      );

      const unsubscribePrescriptions = onSnapshot(
        prescriptionsQuery,
        (snapshot) => {
          setPrescriptions((prev) => {
            // Remove old prescriptions for this itinerary
            const filtered = prev.filter((p) => p.itineraryId !== itineraryId);
            // Add new prescriptions
            const newPrescriptions = snapshot.docs.map((doc) => ({
              id: doc.id,
              itineraryId,
              ...doc.data(),
            }));
            return [...filtered, ...newPrescriptions];
          });
          setLoading(false);
        },
        (error) => {
          console.error(`Error subscribing to prescriptions for itinerary ${itineraryId}:`, error);
          if (error.code === 'permission-denied') {
            // User doesn't have access to this itinerary's prescriptions
            setLoading(false);
          }
        }
      );

      unsubscribes.push(unsubscribePrescriptions);
    });

    return () => {
      unsubscribes.forEach((unsubscribe) => unsubscribe());
    };
  }, [itineraryIds]);

  // Calculate counts per itinerary
  const counts = useMemo(() => {
    const countsMap = {};
    
    appointments.forEach((appt) => {
      if (appt.itineraryId && !appt.isDeleted) {
        countsMap[appt.itineraryId] = countsMap[appt.itineraryId] || { appointments: 0, prescriptions: 0 };
        countsMap[appt.itineraryId].appointments++;
      }
    });
    
    prescriptions.forEach((rx) => {
      if (rx.itineraryId && !rx.isDeleted) {
        countsMap[rx.itineraryId] = countsMap[rx.itineraryId] || { appointments: 0, prescriptions: 0 };
        countsMap[rx.itineraryId].prescriptions++;
      }
    });
    
    return countsMap;
  }, [appointments, prescriptions]);

  return { counts, loading };
}
