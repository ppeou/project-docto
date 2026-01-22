import { useState } from 'react';
import { usePatients } from '@/hooks/usePatients';
import { createPatient, updatePatient, deletePatient, getLatestVitalSigns } from '@/services/firestore';
import { useEntityCRUD } from '@/hooks/useEntityCRUD';
import { useEntityDialog } from '@/hooks/useEntityDialog';
import { useSearch } from '@/hooks/useSearch';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ContactForm } from '@/components/forms/ContactForm';
import { Edit, Trash2, Phone, Mail, Globe, MapPin, Pill, Search, Plus, Activity } from 'lucide-react';
import { AppHeader } from '@/components/shared/AppHeader';
import { Link } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { formatDate, formatDateTime } from '@/lib/utils';

const getInitialFormData = (patient = null) => ({
  name: patient?.name || '',
  relation: patient?.relation || 'Self',
  phones: patient?.phones || [],
  emails: patient?.emails || [],
  websites: patient?.websites || [],
  addresses: patient?.addresses || [],
});

export default function PatientsPage() {
  const { patients, loading, addVitalSigns } = usePatients();
  const { toast } = useToast();
  const [formData, setFormData] = useState(() => getInitialFormData());
  const [vitalSignsDialog, setVitalSignsDialog] = useState({ open: false, patientId: null });
  const [vitalSignsForm, setVitalSignsForm] = useState({
    recordedAt: '',
    bloodPressureSystolic: '',
    bloodPressureDiastolic: '',
    weight: '',
    height: '',
    notes: '',
  });
  const [addingVitals, setAddingVitals] = useState(false);

  const { searchQuery, setSearchQuery, filteredItems: filteredPatients } = useSearch(patients, ['name', 'relation']);
  
  const { isOpen, editingEntity, open, close, openForEdit } = useEntityDialog(() => {
    setFormData(getInitialFormData());
  });

  const validateForm = (data) => {
    if (!data.name?.trim()) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Patient name is required',
      });
      return false;
    }
    return true;
  };

  const { create, update, remove, loading: crudLoading } = useEntityCRUD({
    createFn: createPatient,
    updateFn: updatePatient,
    deleteFn: deletePatient,
    validateFn: validateForm,
    entityName: 'Patient',
  });

  const handleEdit = (patient) => {
    setFormData(getInitialFormData(patient));
    openForEdit(patient);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!validateForm(formData)) return;

    const result = editingEntity
      ? await update(editingEntity.id, formData)
      : await create(formData);

    if (result.success) {
      close();
    }
  };

  const handleDelete = async (id) => {
    await remove(id, { confirmMessage: 'Are you sure you want to delete this patient?' });
  };

  const handleOpenVitalSigns = (patientId) => {
    setVitalSignsDialog({ open: true, patientId });
    // Default to current datetime, but user can change it
    const now = new Date();
    const localDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16); // Format: YYYY-MM-DDTHH:mm
    setVitalSignsForm({
      recordedAt: localDateTime,
      bloodPressureSystolic: '',
      bloodPressureDiastolic: '',
      weight: '',
      height: '',
      notes: '',
    });
  };

  const handleAddVitalSigns = async () => {
    if (!vitalSignsForm.recordedAt) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please provide a date and time',
      });
      return;
    }

    if (!vitalSignsForm.bloodPressureSystolic && !vitalSignsForm.weight && !vitalSignsForm.height) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please provide at least one vital sign measurement',
      });
      return;
    }

    try {
      setAddingVitals(true);
      await addVitalSigns(vitalSignsDialog.patientId, {
        recordedAt: vitalSignsForm.recordedAt,
        bloodPressure: vitalSignsForm.bloodPressureSystolic || vitalSignsForm.bloodPressureDiastolic
          ? {
              systolic: vitalSignsForm.bloodPressureSystolic ? parseInt(vitalSignsForm.bloodPressureSystolic) : undefined,
              diastolic: vitalSignsForm.bloodPressureDiastolic ? parseInt(vitalSignsForm.bloodPressureDiastolic) : undefined,
            }
          : undefined,
        weight: vitalSignsForm.weight ? parseFloat(vitalSignsForm.weight) : undefined,
        height: vitalSignsForm.height ? parseFloat(vitalSignsForm.height) : undefined,
        notes: vitalSignsForm.notes || undefined,
      });
      
      toast({
        title: 'Success',
        description: 'Vital signs recorded successfully',
      });
      
      setVitalSignsDialog({ open: false, patientId: null });
      setVitalSignsForm({
        recordedAt: '',
        bloodPressureSystolic: '',
        bloodPressureDiastolic: '',
        weight: '',
        height: '',
        notes: '',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to record vital signs',
      });
    } finally {
      setAddingVitals(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen p-4">
        <div className="flex items-center justify-center h-screen">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader title="Patients" />

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex justify-between items-center mb-6">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search patients..."
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
              Add Patient
            </Button>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingEntity ? 'Edit Patient' : 'Add Patient'}</DialogTitle>
                <DialogDescription>
                  {editingEntity ? 'Update patient information' : 'Add a new patient to your list'}
                </DialogDescription>
              </DialogHeader>
              <div>
                <ContactForm
                  formData={formData}
                  setFormData={setFormData}
                  type="patient"
                  onSubmit={handleSave}
                />
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

        {filteredPatients.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {searchQuery ? 'No matching patients' : 'No patients yet'}
            </p>
            {!searchQuery && (
              <p className="text-sm text-muted-foreground mt-2">
                Add your first patient to get started
              </p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPatients.map((patient) => (
              <Link key={patient.id} to={`/patients/${patient.id}`} className="block">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{patient.name}</CardTitle>
                        <CardDescription>{patient.relation}</CardDescription>
                      </div>
                      <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleEdit(patient);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleDelete(patient.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4 space-y-2" onClick={(e) => e.stopPropagation()}>
                    <Link to={`/prescriptions/create?patientId=${patient.id}`}>
                      <Button variant="outline" size="sm" className="w-full">
                        <Pill className="mr-2 h-4 w-4" />
                        Add Prescription
                      </Button>
                    </Link>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={(e) => {
                        e.preventDefault();
                        handleOpenVitalSigns(patient.id);
                      }}
                    >
                      <Activity className="mr-2 h-4 w-4" />
                      Record Vital Signs
                    </Button>
                  </div>

                  {/* Latest Vital Signs */}
                  {patient.vitalSigns && patient.vitalSigns.length > 0 && (
                    <div className="mb-4 p-3 bg-muted rounded-lg">
                      <p className="text-xs font-medium mb-2">Latest Vital Signs</p>
                      {(() => {
                        const latest = getLatestVitalSigns(patient);
                        if (!latest) return null;
                        return (
                          <div className="space-y-1 text-xs">
                            {latest.bloodPressure && (
                              <div>
                                <span className="text-muted-foreground">BP: </span>
                                <span className="font-medium">
                                  {latest.bloodPressure.systolic}/{latest.bloodPressure.diastolic} mmHg
                                </span>
                              </div>
                            )}
                            {latest.weight && (
                              <div>
                                <span className="text-muted-foreground">Weight: </span>
                                <span className="font-medium">{latest.weight} kg</span>
                              </div>
                            )}
                            {latest.height && (
                              <div>
                                <span className="text-muted-foreground">Height: </span>
                                <span className="font-medium">{latest.height} m</span>
                              </div>
                            )}
                            <div className="text-xs text-muted-foreground mt-1">
                              {formatDate(latest.recordedAt)}
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}
                  
                  {patient.phones && patient.phones.length > 0 && (
                    <div className="space-y-1 mb-2">
                      {patient.phones.slice(0, 2).map((phone, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          {phone.phone}
                        </div>
                      ))}
                    </div>
                  )}
                  {patient.emails && patient.emails.length > 0 && (
                    <div className="space-y-1 mb-2">
                      {patient.emails.slice(0, 2).map((email, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Mail className="h-3 w-3" />
                          {email.email}
                        </div>
                      ))}
                    </div>
                  )}
                  {patient.websites && patient.websites.length > 0 && (
                    <div className="space-y-1 mb-2">
                      {patient.websites.slice(0, 1).map((website, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Globe className="h-3 w-3" />
                          <a href={website.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                            {website.url}
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
                  {patient.addresses && patient.addresses.length > 0 && (
                    <div className="space-y-1">
                      {patient.addresses.slice(0, 1).map((address, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-3 w-3 mt-0.5" />
                          <div>
                            {address.street && <div>{address.street}</div>}
                            {address.city && address.state && (
                              <div>{address.city}, {address.state}</div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {/* Vital Signs Dialog */}
        <Dialog 
          open={vitalSignsDialog.open} 
          onOpenChange={(open) => setVitalSignsDialog({ open, patientId: null })}
        >
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Record Vital Signs</DialogTitle>
              <DialogDescription>
                Record patient's vital signs. Date/time defaults to now but can be adjusted.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="recordedAt">Date & Time *</Label>
                <Input
                  id="recordedAt"
                  type="datetime-local"
                  value={vitalSignsForm.recordedAt}
                  onChange={(e) => setVitalSignsForm({ ...vitalSignsForm, recordedAt: e.target.value })}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Defaults to current date/time. Adjust if recording for a different time.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bloodPressureSystolic">Blood Pressure - Systolic</Label>
                  <Input
                    id="bloodPressureSystolic"
                    type="number"
                    min="50"
                    max="250"
                    value={vitalSignsForm.bloodPressureSystolic}
                    onChange={(e) => setVitalSignsForm({ ...vitalSignsForm, bloodPressureSystolic: e.target.value })}
                    placeholder="e.g., 120"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bloodPressureDiastolic">Blood Pressure - Diastolic</Label>
                  <Input
                    id="bloodPressureDiastolic"
                    type="number"
                    min="30"
                    max="150"
                    value={vitalSignsForm.bloodPressureDiastolic}
                    onChange={(e) => setVitalSignsForm({ ...vitalSignsForm, bloodPressureDiastolic: e.target.value })}
                    placeholder="e.g., 80"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.1"
                    min="0.1"
                    max="1000"
                    value={vitalSignsForm.weight}
                    onChange={(e) => setVitalSignsForm({ ...vitalSignsForm, weight: e.target.value })}
                    placeholder="e.g., 70.5"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="height">Height (m)</Label>
                  <Input
                    id="height"
                    type="number"
                    step="0.01"
                    min="0.1"
                    max="3"
                    value={vitalSignsForm.height}
                    onChange={(e) => setVitalSignsForm({ ...vitalSignsForm, height: e.target.value })}
                    placeholder="e.g., 1.75"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="vitalNotes">Notes</Label>
                <textarea
                  id="vitalNotes"
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={vitalSignsForm.notes}
                  onChange={(e) => setVitalSignsForm({ ...vitalSignsForm, notes: e.target.value })}
                  placeholder="Optional notes about the vital signs reading"
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setVitalSignsDialog({ open: false, patientId: null })}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleAddVitalSigns}
                  disabled={addingVitals}
                >
                  {addingVitals ? 'Recording...' : 'Record Vital Signs'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
