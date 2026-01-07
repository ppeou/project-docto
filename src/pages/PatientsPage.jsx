import { useState } from 'react';
import { usePatients } from '@/hooks/usePatients';
import { createPatient, updatePatient, deletePatient } from '@/services/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { EmptyState } from '@/components/shared/EmptyState';
import { useToast } from '@/components/ui/use-toast';
import { ContactForm } from '@/components/forms/ContactForm';
import { Plus, Search, Edit, Trash2, Phone, Mail, Globe, MapPin } from 'lucide-react';
import { AppHeader } from '@/components/shared/AppHeader';

export default function PatientsPage() {
  const { patients, loading } = usePatients();
  const { toast } = useToast();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [editingPatient, setEditingPatient] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [patientForm, setPatientForm] = useState({
    name: '',
    relation: 'Self',
    phones: [],
    emails: [],
    websites: [],
    addresses: [],
  });

  const filteredPatients = patients.filter((patient) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return patient.name?.toLowerCase().includes(query) ||
           patient.relation?.toLowerCase().includes(query);
  });

  const resetForm = () => {
    setPatientForm({
      name: '',
      relation: 'Self',
      phones: [],
      emails: [],
      websites: [],
      addresses: [],
    });
    setEditingPatient(null);
  };

  const handleEdit = (patient) => {
    setEditingPatient(patient);
    setPatientForm({
      name: patient.name || '',
      relation: patient.relation || 'Self',
      phones: patient.phones || [],
      emails: patient.emails || [],
      websites: patient.websites || [],
      addresses: patient.addresses || [],
    });
    setIsDialogOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!patientForm.name.trim()) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Patient name is required',
      });
      return;
    }

    try {
      if (editingPatient) {
        await updatePatient(editingPatient.id, patientForm);
        toast({
          title: 'Success',
          description: 'Patient updated successfully',
        });
      } else {
        await createPatient(patientForm);
        toast({
          title: 'Success',
          description: 'Patient created successfully',
        });
      }
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to save patient',
      });
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this patient?')) return;
    
    try {
      await deletePatient(id);
      toast({
        title: 'Success',
        description: 'Patient deleted successfully',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to delete patient',
      });
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
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

          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button onClick={() => resetForm()}>
                <Plus className="mr-2 h-4 w-4" />
                Add Patient
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingPatient ? 'Edit Patient' : 'Add Patient'}</DialogTitle>
                <DialogDescription>
                  {editingPatient ? 'Update patient information' : 'Add a new patient to your list'}
                </DialogDescription>
              </DialogHeader>
              <div>
                <ContactForm
                  formData={patientForm}
                  setFormData={setPatientForm}
                  type="patient"
                  onSubmit={handleSave}
                />
                <div className="flex justify-end gap-2 pt-4 border-t mt-6">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="button" onClick={handleSave}>Save</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {filteredPatients.length === 0 ? (
          <EmptyState
            title={searchQuery ? 'No matching patients' : 'No patients yet'}
            description={
              searchQuery
                ? 'Try a different search term'
                : 'Add your first patient to get started'
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPatients.map((patient) => (
              <Card key={patient.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{patient.name}</CardTitle>
                      <CardDescription>{patient.relation}</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(patient)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(patient.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
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
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

