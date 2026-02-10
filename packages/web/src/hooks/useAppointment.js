import { useDocument } from './useDocument';

export function useAppointment(id) {
  const { data, loading, error } = useDocument('appointments', id);
  return { appointment: data, loading, error };
}
