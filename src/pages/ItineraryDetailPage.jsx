import { useParams, Link } from 'react-router-dom';
import { useItinerary } from '@/hooks/useItinerary';
import { useItineraryAppointments } from '@/hooks/useItineraryAppointments';
import { useItineraryPrescriptions } from '@/hooks/useItineraryPrescriptions';
import { useItineraryNotes } from '@/hooks/useItineraryNotes';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { ErrorMessage } from '@/components/shared/ErrorMessage';
import { ArrowLeft, Plus, Calendar, Pill, FileText } from 'lucide-react';
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="bg-white border-b sticky top-0 z-10">
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
            </div>
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
                          Dosage: {prescription.dosage} | Frequency: {prescription.frequency}
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

