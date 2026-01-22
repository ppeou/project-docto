import { useState } from 'react';
import { useEntityCRUD } from '@/hooks/useEntityCRUD';
import { useEntityDialog } from '@/hooks/useEntityDialog';
import { useSearch } from '@/hooks/useSearch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { EmptyState } from '@/components/shared/EmptyState';
import { Search, Plus, Edit, Trash2 } from 'lucide-react';

/**
 * Reusable component for managing entities (patients, doctors, specialties, etc.)
 * Follows DRY and SOLID principles by extracting common CRUD UI patterns
 * 
 * @param {Object} props
 * @param {string} props.title - Page title
 * @param {Array} props.items - Array of items to display
 * @param {boolean} props.loading - Loading state
 * @param {Function} props.createFn - Function to create entity
 * @param {Function} props.updateFn - Function to update entity
 * @param {Function} props.deleteFn - Function to delete entity
 * @param {Function} props.validateFn - Optional validation function
 * @param {string} props.entityName - Entity name for messages
 * @param {Array|Function} props.searchFields - Fields to search in
 * @param {Function} props.renderForm - Function to render form component
 * @param {Function} props.renderCard - Function to render card component
 * @param {Function} props.getInitialFormData - Function to get initial form data
 * @param {Function} props.onFormDataChange - Optional callback when form data changes
 */
export function EntityManagementPage({
  title,
  items = [],
  loading = false,
  createFn,
  updateFn,
  deleteFn,
  validateFn,
  entityName = 'Entity',
  searchFields = ['name'],
  renderForm,
  renderCard,
  getInitialFormData,
  onFormDataChange,
  emptyStateTitle,
  emptyStateDescription,
  gridCols = 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
}) {
  const [formData, setFormData] = useState(() => getInitialFormData ? getInitialFormData() : {});

  const { searchQuery, setSearchQuery, filteredItems } = useSearch(items, searchFields);
  
  const { isOpen, editingEntity, open, close, openForEdit } = useEntityDialog(() => {
    setFormData(getInitialFormData ? getInitialFormData() : {});
  });

  const { create, update, remove, loading: crudLoading } = useEntityCRUD({
    createFn,
    updateFn,
    deleteFn,
    validateFn,
    entityName,
  });

  const handleEdit = (entity) => {
    const initialData = getInitialFormData ? getInitialFormData(entity) : entity;
    setFormData(initialData);
    openForEdit(entity);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    
    const result = editingEntity
      ? await update(editingEntity.id, formData)
      : await create(formData);

    if (result.success) {
      close();
    }
  };

  const handleDelete = async (id) => {
    await remove(id);
  };

  const handleFormDataChange = (newData) => {
    setFormData(newData);
    if (onFormDataChange) {
      onFormDataChange(newData);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen p-4">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex justify-between items-center mb-6">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={`Search ${entityName.toLowerCase()}s...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Dialog open={isOpen} onOpenChange={(open) => {
            if (!open) close();
          }}>
            <Button onClick={open}>
              <Plus className="mr-2 h-4 w-4" />
              Add {entityName}
            </Button>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingEntity ? `Edit ${entityName}` : `Add ${entityName}`}</DialogTitle>
                <DialogDescription>
                  {editingEntity ? `Update ${entityName.toLowerCase()} information` : `Add a new ${entityName.toLowerCase()} to your list`}
                </DialogDescription>
              </DialogHeader>
              <div>
                {renderForm({
                  formData,
                  setFormData: handleFormDataChange,
                  onSubmit: handleSave,
                  loading: crudLoading,
                  editingEntity,
                })}
                <div className="flex justify-end gap-2 pt-4 border-t mt-6">
                  <Button type="button" variant="outline" onClick={close}>
                    Cancel
                  </Button>
                  <Button type="button" onClick={handleSave} disabled={crudLoading}>
                    Save
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {filteredItems.length === 0 ? (
          <EmptyState
            title={emptyStateTitle || (searchQuery ? `No matching ${entityName.toLowerCase()}s` : `No ${entityName.toLowerCase()}s yet`)}
            description={
              emptyStateDescription ||
              (searchQuery
                ? 'Try a different search term'
                : `Add your first ${entityName.toLowerCase()} to get started`)
            }
          />
        ) : (
          <div className={`grid ${gridCols} gap-4`}>
            {filteredItems.map((item) => renderCard({
              item,
              onEdit: () => handleEdit(item),
              onDelete: () => handleDelete(item.id),
            }))}
          </div>
        )}
      </main>
    </div>
  );
}

