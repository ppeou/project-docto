import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';

/**
 * Reusable hook for CRUD operations on entities (patients, doctors, specialties, etc.)
 * Follows DRY principle by extracting common patterns
 * 
 * @param {Object} config - Configuration object
 * @param {Function} config.createFn - Function to create entity
 * @param {Function} config.updateFn - Function to update entity
 * @param {Function} config.deleteFn - Function to delete entity
 * @param {Function} config.validateFn - Optional validation function
 * @param {string} config.entityName - Name of entity for toast messages (e.g., "Patient", "Doctor")
 * @returns {Object} CRUD operations and state
 */
export function useEntityCRUD({ createFn, updateFn, deleteFn, validateFn, entityName = 'Entity' }) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const create = async (data) => {
    if (validateFn && !validateFn(data)) {
      return { success: false };
    }

    setLoading(true);
    try {
      const id = await createFn(data);
      toast({
        title: 'Success',
        description: `${entityName} created successfully!`,
      });
      return { success: true, id };
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || `Failed to create ${entityName.toLowerCase()}`,
      });
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  const update = async (id, data) => {
    if (validateFn && !validateFn(data)) {
      return { success: false };
    }

    setLoading(true);
    try {
      await updateFn(id, data);
      toast({
        title: 'Success',
        description: `${entityName} updated successfully!`,
      });
      return { success: true };
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || `Failed to update ${entityName.toLowerCase()}`,
      });
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  const remove = async (id, options = {}) => {
    const { confirmMessage = `Are you sure you want to delete this ${entityName.toLowerCase()}?` } = options;
    
    if (!confirm(confirmMessage)) {
      return { success: false, cancelled: true };
    }

    setLoading(true);
    try {
      await deleteFn(id);
      toast({
        title: 'Success',
        description: `${entityName} deleted successfully!`,
      });
      return { success: true };
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || `Failed to delete ${entityName.toLowerCase()}`,
      });
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  return {
    create,
    update,
    remove,
    loading,
  };
}

