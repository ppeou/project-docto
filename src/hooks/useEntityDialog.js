import { useState } from 'react';

/**
 * Reusable hook for managing dialog state for entity forms
 * Follows KISS principle by simplifying dialog state management
 * 
 * @param {Function} resetFormFn - Function to reset form to initial state
 * @returns {Object} Dialog state and handlers
 */
export function useEntityDialog(resetFormFn) {
  const [isOpen, setIsOpen] = useState(false);
  const [editingEntity, setEditingEntity] = useState(null);

  const open = () => {
    setIsOpen(true);
  };

  const close = () => {
    setIsOpen(false);
    setEditingEntity(null);
    if (resetFormFn) {
      resetFormFn();
    }
  };

  const openForEdit = (entity) => {
    setEditingEntity(entity);
    setIsOpen(true);
  };

  return {
    isOpen,
    editingEntity,
    open,
    close,
    openForEdit,
    setIsOpen, // For controlled dialogs
  };
}

