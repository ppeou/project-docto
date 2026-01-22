import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getPatient, updatePatient, deletePatient, getLatestVitalSigns } from '@/services/firestore';
import { usePatients } from '@/hooks/usePatients';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { ErrorMessage } from '@/components/shared/ErrorMessage';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { ContactForm } from '@/components/forms/ContactForm';
import { ArrowLeft, Edit, Trash2, Phone, Mail, Globe, MapPin, Activity, Plus } from 'lucide-react';
import { formatDate, formatDateTime } from '@/lib/utils';
import { AppHeader } from '@/components/shared/AppHeader';

const getInitialFormData = (patient = null) => ({
  name: patient?.name || '',
  relation: patient?.relation || 'Self',
  phones: patient?.phones || [],
  emails: patient?.emails || [],
  websites: patient?.websites || [],
  addresses: patient?.addresses || [],
});

export default function PatientDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { addVitalSigns } = usePatients();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [formData, setFormData] = useState(() => getInitialFormData());
  const [saving, setSaving] = useState(false);
  const [vitalSignsDialog, setVitalSignsDialog] = useState(false);
  const [vitalSignsForm, setVitalSignsForm] = useState({
    recordedAt: '',
    bloodPressureSystolic: '',
    bloodPressureDiastolic: '',
    weight: '',
    height: '',
    notes: '',
  });
  const [addingVitals, setAddingVitals] = useState(false);

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        setLoading(true);
        const data = await getPatient(id);
        setPatient(data);
        setFormData(getInitialFormData(data));
        setError(null);
      } catch (err) {
        console.error('Error fetching patient:', err);
        setError(err);
        setPatient(null);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPatient();
    }
  }, [id]);

  const handleEdit = () => {
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!formData.name?.trim()) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Patient name is required',
      });
      return;
    }

    setSaving(true);
    try {
      await updatePatient(id, formData);
      // Refetch patient to update UI
      const updated = await getPatient(id);
      setPatient(updated);
      
      toast({
        title: 'Success',
        description: 'Patient updated successfully',
      });
      
      setIsEditDialogOpen(false);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to update patient',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this patient? This action cannot be undone.')) {
      return;
    }

    try {
      await deletePatient(id);
      toast({
        title: 'Success',
        description: 'Patient deleted successfully',
      });
      navigate('/patients');
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to delete patient',
      });
    }
  };

  const handleOpenVitalSigns = () => {
    setVitalSignsDialog(true);
    const now = new Date();
    const localDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
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
      await addVitalSigns(id, {
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
      
      // Refetch patient to update UI
      const updated = await getPatient(id);
      setPatient(updated);
      
      setVitalSignsDialog(false);
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
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className="min-h-screen p-4">
        <ErrorMessage error={error || new Error('Patient not found')} />
      </div>
    );
  }

  const latestVitalSigns = getLatestVitalSigns(patient);

  return (
    <div className="min-h-screen bg-background">
      <AppHeader title="Patient Details" />
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-6">
          <Link to="/patients">
            <Button variant="ghost">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Patients
            </Button>
          </Link>
        </div>

        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold">{patient.name}</h1>
            <p className="text-muted-foreground mt-1">
              {patient.relation}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleEdit}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
            <Button variant="outline" onClick={handleDelete}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {patient.phones && patient.phones.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Phone Numbers</h3>
                  {patient.phones.map((phone, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{phone.phone}</span>
                    </div>
                  ))}
                </div>
              )}
              
              {patient.emails && patient.emails.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Email Addresses</h3>
                  {patient.emails.map((email, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{email.email}</span>
                    </div>
                  ))}
                </div>
              )}
              
              {patient.websites && patient.websites.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Websites</h3>
                  {patient.websites.map((website, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <a href={website.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                        {website.url}
                      </a>
                    </div>
                  ))}
                </div>
              )}
              
              {patient.addresses && patient.addresses.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Addresses</h3>
                  {patient.addresses.map((address, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        {address.street && <div>{address.street}</div>}
                        {address.city && address.state && (
                          <div>{address.city}, {address.state} {address.postalCode}</div>
                        )}
                        {address.country && <div>{address.country}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {(!patient.phones || patient.phones.length === 0) &&
               (!patient.emails || patient.emails.length === 0) &&
               (!patient.websites || patient.websites.length === 0) &&
               (!patient.addresses || patient.addresses.length === 0) && (
                <p className="text-sm text-muted-foreground">No contact information available</p>
              )}
            </CardContent>
          </Card>

          {/* Vital Signs */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Vital Signs</CardTitle>
                <Button variant="outline" size="sm" onClick={handleOpenVitalSigns}>
                  <Plus className="mr-2 h-4 w-4" />
                  Record
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {latestVitalSigns ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium mb-2">Latest Reading</h3>
                    <div className="space-y-2 text-sm">
                      {latestVitalSigns.bloodPressure && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Blood Pressure:</span>
                          <span className="font-medium">
                            {latestVitalSigns.bloodPressure.systolic}/{latestVitalSigns.bloodPressure.diastolic} mmHg
                          </span>
                        </div>
                      )}
                      {latestVitalSigns.weight && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Weight:</span>
                          <span className="font-medium">{latestVitalSigns.weight} kg</span>
                        </div>
                      )}
                      {latestVitalSigns.height && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Height:</span>
                          <span className="font-medium">{latestVitalSigns.height} m</span>
                        </div>
                      )}
                      <div className="text-xs text-muted-foreground pt-2 border-t">
                        Recorded: {formatDateTime(latestVitalSigns.recordedAt)}
                      </div>
                      {latestVitalSigns.notes && (
                        <div className="text-sm text-muted-foreground mt-2">
                          <strong>Notes:</strong> {latestVitalSigns.notes}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {patient.vitalSigns && patient.vitalSigns.length > 1 && (
                    <div className="pt-4 border-t">
                      <p className="text-xs text-muted-foreground">
                        {patient.vitalSigns.length} total reading{patient.vitalSigns.length !== 1 ? 's' : ''} recorded
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground mb-4">No vital signs recorded yet</p>
                  <Button variant="outline" size="sm" onClick={handleOpenVitalSigns}>
                    <Plus className="mr-2 h-4 w-4" />
                    Record First Reading
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Patient</DialogTitle>
              <DialogDescription>
                Update patient information
              </DialogDescription>
            </DialogHeader>
            <div>
              <ContactForm
                formData={formData}
                setFormData={setFormData}
                type="patient"
                onSubmit={handleSaveEdit}
              />
              <div className="flex justify-end gap-2 pt-4 border-t mt-6">
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="button" onClick={handleSaveEdit} disabled={saving}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Vital Signs Dialog */}
        <Dialog open={vitalSignsDialog} onOpenChange={setVitalSignsDialog}>
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
                  onClick={() => setVitalSignsDialog(false)}
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
