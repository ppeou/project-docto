import { useDocument } from './useDocument';

export function useDoctorNote(id) {
  const { data, loading, error } = useDocument('doctorNotes', id);
  return { note: data, loading, error };
}
