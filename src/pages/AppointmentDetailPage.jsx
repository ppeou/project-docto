import { useParams, Link, useNavigate } from 'react-router-dom';
import { getAppointment, updateAppointment, deleteAppointment } from '@/services/firestore';
import { useAppointment } from '@/hooks/useAppointment';
import { useAppointmentNotes } from '@/hooks/useAppointmentNotes';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { ErrorMessage } from '@/components/shared/ErrorMessage';
import { useToast } from '@/components/ui/use-toast';
import { ArrowLeft, Edit, Trash2, Calendar, Phone, Mail, MapPin, FileText } from 'lucide-react';
import { formatDateTime } from '@/lib/utils';

const NOTE_TYPE_LABELS = {
  1: 'General Notes',
  2: 'Test Results',
  3: 'Treatment Plan',
  4: 'Diagnosis',
  5: 'Other',
};

export default function AppointmentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { appointment, loading, error } = useAppointment(id);
  const { notes, loading: notesLoading } = useAppointmentNotes(id);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this appointment?')) return;

    try {
      await deleteAppointment(id);
      toast({
        title: 'Success',
        description: 'Appointment deleted successfully',
      });
      navigate('/itineraries');
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to delete appointment',
      });
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await updateAppointment(id, { status: newStatus });
      toast({
        title: 'Success',
        description: 'Appointment status updated',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to update status',
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

  if (error || !appointment) {
    return (
      <div className="min-h-screen p-4">
        <ErrorMessage error={error || new Error('Appointment not found')} />
      </div>
    );
  }

  const statusLabels = {
    1: 'Scheduled',
    2: 'Completed',
    3: 'Cancelled',
    4: 'Rescheduled',
  };

  const statusColors = {
    1: 'default',
    2: 'success',
    3: 'destructive',
    4: 'warning',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <Link to={appointment.itineraryId ? `/itineraries/${appointment.itineraryId}` : '/itineraries'}>
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">{appointment.title}</h1>
              <Badge variant={statusColors[appointment.status]} className="mt-2">
                {statusLabels[appointment.status]}
              </Badge>
            </div>
            <div className="flex gap-2">
              <Link to={`/appointments/${id}/edit`}>
                <Button variant="outline">
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
              </Link>
              <Button variant="destructive" onClick={handleDelete}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Doctor Information */}
          <Card>
            <CardHeader>
              <CardTitle>Doctor Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-medium">{appointment.doctor?.name || 'Not specified'}</p>
              </div>
              {appointment.doctor?.specialty && (
                <div>
                  <p className="text-sm text-muted-foreground">Specialty</p>
                  <p className="font-medium">{appointment.doctor.specialty}</p>
                </div>
              )}
              {appointment.doctor?.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <a href={`tel:${appointment.doctor.phone}`} className="text-primary hover:underline">
                    {appointment.doctor.phone}
                  </a>
                </div>
              )}
              {appointment.doctor?.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <a href={`mailto:${appointment.doctor.email}`} className="text-primary hover:underline">
                    {appointment.doctor.email}
                  </a>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Appointment Details */}
          <Card>
            <CardHeader>
              <CardTitle>Appointment Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Date & Time</p>
                  <p className="font-medium">
                    {appointment.appointmentDate ? formatDateTime(appointment.appointmentDate) : 'Not specified'}
                  </p>
                </div>
              </div>
              {appointment.duration && (
                <div>
                  <p className="text-sm text-muted-foreground">Duration</p>
                  <p className="font-medium">{appointment.duration} minutes</p>
                </div>
              )}
              {appointment.purpose && (
                <div>
                  <p className="text-sm text-muted-foreground">Purpose</p>
                  <p className="font-medium">{appointment.purpose}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Clinic Information */}
          {appointment.clinicName && (
            <Card>
              <CardHeader>
                <CardTitle>Clinic Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                  <div>
                    <p className="font-medium">{appointment.clinicName}</p>
                    {appointment.clinicAddress && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {[
                          appointment.clinicAddress.street,
                          appointment.clinicAddress.city,
                          appointment.clinicAddress.state,
                          appointment.clinicAddress.postalCode,
                        ].filter(Boolean).join(', ')}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Pre-Appointment Notes */}
          {appointment.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Pre-Appointment Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{appointment.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Doctor Notes */}
        <Card className="mt-6">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Doctor Notes ({notes.length})</CardTitle>
              <Link to={`/notes/create?appointmentId=${id}`}>
                <Button size="sm">
                  <FileText className="mr-2 h-4 w-4" />
                  Add Note
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {notesLoading ? (
              <LoadingSpinner />
            ) : notes.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">No doctor notes yet</p>
                <Link to={`/notes/create?appointmentId=${id}`}>
                  <Button variant="outline">
                    <FileText className="mr-2 h-4 w-4" />
                    Add First Note
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {notes.map((note) => (
                  <Link key={note.id} to={`/notes/${note.id}`}>
                    <Card className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">{note.title || 'Doctor Note'}</CardTitle>
                            <CardDescription>
                              {formatDateTime(note.created?.on)} • {NOTE_TYPE_LABELS[note.noteType]}
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
          </CardContent>
        </Card>

        {/* Actions */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {appointment.status === 1 && (
                <Button onClick={() => handleStatusChange(2)} variant="outline">
                  Mark as Completed
                </Button>
              )}
              {appointment.status === 1 && (
                <Button onClick={() => handleStatusChange(3)} variant="outline">
                  Cancel Appointment
                </Button>
              )}
              {appointment.status !== 1 && (
                <Button onClick={() => handleStatusChange(1)} variant="outline">
                  Mark as Scheduled
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

