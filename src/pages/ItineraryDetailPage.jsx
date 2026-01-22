import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useItinerary } from '@/hooks/useItinerary';
import { useItineraryAppointments } from '@/hooks/useItineraryAppointments';
import { useItineraryPrescriptions } from '@/hooks/useItineraryPrescriptions';
import { useItineraryNotes } from '@/hooks/useItineraryNotes';
import { usePatients } from '@/hooks/usePatients';
import { updateItinerary } from '@/services/firestore';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { ErrorMessage } from '@/components/shared/ErrorMessage';
import { useToast } from '@/components/ui/use-toast';
import { ArrowLeft, Plus, Calendar, Pill, FileText, Edit } from 'lucide-react';
import { formatDate, formatDateTime } from '@/lib/utils';

const NOTE_TYPE_LABELS = {
  1: 'General Notes',
  2: 'Test Results',
  3: 'Treatment Plan',
  4: 'Diagnosis',
  5: 'Other',
};

export default function ItineraryDetailPage() {
  const { id } = useParams();
  const { itinerary, loading, error } = useItinerary(id);
  const { appointments, loading: appointmentsLoading } = useItineraryAppointments(id);
  const { prescriptions, loading: prescriptionsLoading } = useItineraryPrescriptions(id);
  const { notes, loading: notesLoading } = useItineraryNotes(id);
  const { patients, loading: patientsLoading } = usePatients();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    patientId: '',
    startDate: '',
    endDate: '',
  });
  const [saving, setSaving] = useState(false);
  const isOwner = itinerary && user && itinerary.ownerId === user.uid;
  const isMember = itinerary && user && Array.isArray(itinerary.memberIds) && itinerary.memberIds.includes(user.uid);
  const canEdit = !!user && (isOwner || isMember);

  // Helper function to convert date to YYYY-MM-DD format
  const dateToInputFormat = (date) => {
    if (!date) return '';
    try {
      // Handle Firestore Timestamp
      const d = date.toDate ? date.toDate() : (date instanceof Date ? date : new Date(date));
      if (isNaN(d.getTime())) return '';
      return d.toISOString().split('T')[0];
    } catch (error) {
      console.error('Error converting date:', error);
      return '';
    }
  };

  // Initialize form when itinerary loads
  useEffect(() => {
    if (itinerary && patients.length > 0) {
      // Find patient by matching name and relation
      const matchingPatient = patients.find(
        p => p.name === itinerary.patient?.name && p.relation === itinerary.patient?.relation
      );
      
      setEditForm({
        name: itinerary.name || '',
        description: itinerary.description || '',
        patientId: matchingPatient?.id || '',
        startDate: dateToInputFormat(itinerary.startDate),
        endDate: dateToInputFormat(itinerary.endDate),
      });
    }
  }, [itinerary, patients]);

  const handleEdit = () => {
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editForm.name.trim() || !editForm.patientId) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Itinerary name and patient are required',
      });
      return;
    }

    setSaving(true);
    try {
      const selectedPatient = patients.find(p => p.id === editForm.patientId);
      if (!selectedPatient) {
        throw new Error('Selected patient not found');
      }

      const updateData = {
        name: editForm.name,
        description: editForm.description || null,
        patient: {
          name: selectedPatient.name,
          relation: selectedPatient.relation,
        },
        startDate: editForm.startDate ? new Date(editForm.startDate).toISOString() : null,
        endDate: editForm.endDate ? new Date(editForm.endDate).toISOString() : null,
      };

      await updateItinerary(id, updateData);
      
      toast({
        title: 'Success',
        description: 'Itinerary updated successfully',
      });
      
      setIsEditDialogOpen(false);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to update itinerary',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen p-4">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !itinerary) {
    return (
      <div className="min-h-screen p-4">
        <ErrorMessage error={error || new Error('Itinerary not found')} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <Link to="/itineraries">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">{itinerary.name}</h1>
              <p className="text-muted-foreground mt-1">
                {itinerary.patient?.name} ({itinerary.patient?.relation})
              </p>
              {user && (
                <p className="text-xs text-muted-foreground mt-1">
                  {isOwner ? 'You are the owner of this itinerary.' : 'You are collaborating on this itinerary.'}
                </p>
              )}
            </div>
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" onClick={handleEdit} disabled={!canEdit}>
                  <Edit className="mr-2 h-4 w-4" />
                  {canEdit ? 'Edit' : 'View only'}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Edit Itinerary</DialogTitle>
                  <DialogDescription>
                    Update the itinerary information
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSaveEdit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="editName">Itinerary Name *</Label>
                    <Input
                      id="editName"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="editPatientId">Patient *</Label>
                    <Select
                      value={editForm.patientId}
                      onValueChange={(value) => setEditForm({ ...editForm, patientId: value })}
                      disabled={patientsLoading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={patientsLoading ? "Loading patients..." : "Select a patient"} />
                      </SelectTrigger>
                      <SelectContent>
                        {patients.length === 0 ? (
                          <SelectItem value="no-patients" disabled>
                            No patients found. Please add a patient first.
                          </SelectItem>
                        ) : (
                          patients.map((patient) => (
                            <SelectItem key={patient.id} value={patient.id}>
                              {patient.name} ({patient.relation})
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    {patients.length === 0 && (
                      <p className="text-sm text-muted-foreground">
                        <Link to="/patients" className="text-primary hover:underline">
                          Add a patient
                        </Link>
                        {' '}to continue
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="editDescription">Description</Label>
                    <textarea
                      id="editDescription"
                      className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={editForm.description}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                      placeholder="Optional description"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="editStartDate">Start Date</Label>
                      <Input
                        id="editStartDate"
                        type="date"
                        value={editForm.startDate}
                        onChange={(e) => setEditForm({ ...editForm, startDate: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="editEndDate">End Date</Label>
                      <Input
                        id="editEndDate"
                        type="date"
                        value={editForm.endDate}
                        onChange={(e) => setEditForm({ ...editForm, endDate: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={saving}>
                      {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Itinerary Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {itinerary.description && (
              <p className="text-muted-foreground">{itinerary.description}</p>
            )}
            {itinerary.startDate && (
              <p className="text-sm">
                <span className="font-medium">Date Range: </span>
                {formatDate(itinerary.startDate)}
                {itinerary.endDate && ` - ${formatDate(itinerary.endDate)}`}
              </p>
            )}
          </CardContent>
        </Card>

        <Tabs defaultValue="appointments" className="space-y-4">
          <TabsList>
            <TabsTrigger value="appointments">
              <Calendar className="mr-2 h-4 w-4" />
              Appointments ({appointments.length})
            </TabsTrigger>
            <TabsTrigger value="prescriptions">
              <Pill className="mr-2 h-4 w-4" />
              Prescriptions ({prescriptions.length})
            </TabsTrigger>
            <TabsTrigger value="notes">
              <FileText className="mr-2 h-4 w-4" />
              Notes ({notes.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="appointments" className="space-y-4">
            <div className="flex justify-end">
              <Link to={`/appointments/create?itineraryId=${id}`}>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Appointment
                </Button>
              </Link>
            </div>
            {appointmentsLoading ? (
              <LoadingSpinner />
            ) : appointments.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">No appointments yet</p>
                  <Link to={`/appointments/create?itineraryId=${id}`} className="mt-4 inline-block">
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Appointment
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {appointments.map((appointment) => (
                  <Link key={appointment.id} to={`/appointments/${appointment.id}`}>
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle>{appointment.title}</CardTitle>
                            <CardDescription>
                              {appointment.doctor?.name || 'No doctor specified'}
                            </CardDescription>
                          </div>
                          <Badge>
                            {appointment.status === 1 && 'Scheduled'}
                            {appointment.status === 2 && 'Completed'}
                            {appointment.status === 3 && 'Cancelled'}
                            {appointment.status === 4 && 'Rescheduled'}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {appointment.appointmentDate && (
                          <p className="text-sm text-muted-foreground">
                            {formatDate(appointment.appointmentDate)}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="prescriptions" className="space-y-4">
            <div className="flex justify-end">
              <Link to={`/prescriptions/create?itineraryId=${id}`}>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Prescription
                </Button>
              </Link>
            </div>
            {prescriptionsLoading ? (
              <LoadingSpinner />
            ) : prescriptions.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">No prescriptions yet</p>
                  <Link to={`/prescriptions/create?itineraryId=${id}`} className="mt-4 inline-block">
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Prescription
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {prescriptions.map((prescription) => (
                  <Link key={prescription.id} to={`/prescriptions/${prescription.id}`}>
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle>{prescription.medicationName}</CardTitle>
                            <CardDescription>
                              {prescription.prescribedBy?.name || 'No doctor specified'}
                            </CardDescription>
                          </div>
                          <Badge>
                            {prescription.status === 1 && 'Active'}
                            {prescription.status === 2 && 'Completed'}
                            {prescription.status === 3 && 'Discontinued'}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">
                          Dosage: {prescription.dosage} | Frequency: {prescription.frequency?.label || prescription.frequencyText || 'Not specified'}
                        </p>
                        {prescription.refills && (
                          <p className="text-sm text-muted-foreground mt-1">
                            Refills: {prescription.refills.remaining} / {prescription.refills.total}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="notes" className="space-y-4">
            <div className="flex justify-end">
              <Link to={`/notes/create?itineraryId=${id}`}>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Note
                </Button>
              </Link>
            </div>
            {notesLoading ? (
              <LoadingSpinner />
            ) : notes.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">No doctor notes yet</p>
                  <Link to={`/notes/create?itineraryId=${id}`} className="mt-4 inline-block">
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Note
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {notes.map((note) => (
                  <Link key={note.id} to={`/notes/${note.id}`}>
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle>{note.title || 'Doctor Note'}</CardTitle>
                            <CardDescription>
                              {note.created?.on && formatDateTime(note.created.on)} • {NOTE_TYPE_LABELS[note.noteType] || 'Unknown'}
                            </CardDescription>
                          </div>
                          {note.attachments && note.attachments.length > 0 && (
                            <Badge variant="secondary">
                              {note.attachments.length} file{note.attachments.length > 1 ? 's' : ''}
                            </Badge>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {note.content}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

