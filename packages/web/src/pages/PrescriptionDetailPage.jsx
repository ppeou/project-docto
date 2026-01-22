import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getPrescription, updatePrescription, deletePrescription } from '@/services/firestore';
import { usePrescription } from '@/hooks/usePrescription';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { ErrorMessage } from '@/components/shared/ErrorMessage';
import { useToast } from '@/components/ui/use-toast';
import { ArrowLeft, Edit, Trash2, Pill, Calendar, Phone, User, RefreshCw, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { formatDate, formatDateTime } from '@core/utils';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function PrescriptionDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { prescription, loading, error, markTaken, unmarkTaken, medicationStatus } = usePrescription(id);
  const [isRefillDialogOpen, setIsRefillDialogOpen] = useState(false);
  const [refillDate, setRefillDate] = useState('');
  const [isMarkDialogOpen, setIsMarkDialogOpen] = useState(false);
  const [markNotes, setMarkNotes] = useState('');
  const [marking, setMarking] = useState(false);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this prescription?')) return;

    try {
      await deletePrescription(id);
      toast({
        title: 'Success',
        description: 'Prescription deleted successfully',
      });
      navigate('/itineraries');
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to delete prescription',
      });
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await updatePrescription(id, { status: newStatus });
      toast({
        title: 'Success',
        description: 'Prescription status updated',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to update status',
      });
    }
  };

  const handleRecordRefill = async () => {
    if (!prescription.refills || prescription.refills.remaining <= 0) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No refills remaining',
      });
      return;
    }

    try {
      const newRemaining = prescription.refills.remaining - 1;
      const updateData = {
        refills: {
          ...prescription.refills,
          remaining: newRemaining,
        },
      };

      // If a refill date is provided, update it
      if (refillDate) {
        updateData.nextRefillDate = new Date(refillDate).toISOString();
      }

      await updatePrescription(id, updateData);
      
      toast({
        title: 'Success',
        description: `Refill recorded. ${newRemaining} refill${newRemaining !== 1 ? 's' : ''} remaining.`,
      });
      
      setIsRefillDialogOpen(false);
      setRefillDate('');
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to record refill',
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

  if (error || !prescription) {
    return (
      <div className="min-h-screen p-4">
        <ErrorMessage error={error || new Error('Prescription not found')} />
      </div>
    );
  }

  const statusLabels = {
    1: 'Active',
    2: 'Completed',
    3: 'Discontinued',
  };

  const statusColors = {
    1: 'success',
    2: 'default',
    3: 'destructive',
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <Link to={prescription.itineraryId ? `/itineraries/${prescription.itineraryId}` : '/itineraries'}>
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">{prescription.medicationName}</h1>
              {prescription.genericName && (
                <p className="text-muted-foreground mt-1">Generic: {prescription.genericName}</p>
              )}
              <Badge variant={statusColors[prescription.status]} className="mt-2">
                {statusLabels[prescription.status]}
              </Badge>
            </div>
            <div className="flex gap-2">
              <Link to={`/prescriptions/${id}/edit`}>
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
          {/* Medication Details */}
          <Card>
            <CardHeader>
              <CardTitle>Medication Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Dosage</p>
                <p className="font-medium">{prescription.dosage}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Frequency</p>
                <p className="font-medium">{prescription.frequency?.label || prescription.frequencyText || prescription.frequency || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Quantity</p>
                <p className="font-medium">{prescription.quantity}</p>
              </div>
            </CardContent>
          </Card>

          {/* Prescription Information */}
          <Card>
            <CardHeader>
              <CardTitle>Prescription Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Prescribed By</p>
                <p className="font-medium">{prescription.prescribedBy?.name || 'Not specified'}</p>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Date Prescribed</p>
                  <p className="font-medium">
                    {prescription.datePrescribed ? formatDate(prescription.datePrescribed) : 'Not specified'}
                  </p>
                </div>
              </div>
              {prescription.nextRefillDate && (
                <div>
                  <p className="text-sm text-muted-foreground">Next Refill Date</p>
                  <p className="font-medium">{formatDate(prescription.nextRefillDate)}</p>
                </div>
              )}
              {prescription.rxNumber && (
                <div>
                  <p className="text-sm text-muted-foreground">RX Number</p>
                  <p className="font-medium">{prescription.rxNumber}</p>
                </div>
              )}
              {prescription.corpNumber && (
                <div>
                  <p className="text-sm text-muted-foreground">CORP #</p>
                  <p className="font-medium">{prescription.corpNumber}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Refill Information */}
          <Card>
            <CardHeader>
              <CardTitle>Refill Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {prescription.refills && (
                <>
                  <div>
                    <p className="text-sm text-muted-foreground">Remaining Refills</p>
                    <p className="font-medium text-2xl">{prescription.refills.remaining}</p>
                    <p className="text-sm text-muted-foreground">out of {prescription.refills.total}</p>
                  </div>
                  {prescription.refills.remaining > 0 && prescription.nextRefillDate && (
                    <div>
                      <p className="text-sm text-muted-foreground">Next Refill</p>
                      <p className="font-medium">{formatDate(prescription.nextRefillDate)}</p>
                    </div>
                  )}
                  {prescription.refills.remaining > 0 && (
                    <Dialog open={isRefillDialogOpen} onOpenChange={setIsRefillDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="w-full">
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Record Refill
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Record Refill</DialogTitle>
                          <DialogDescription>
                            Record that you've picked up a refill for this prescription
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="refillDate">Refill Date (Optional)</Label>
                            <Input
                              id="refillDate"
                              type="date"
                              value={refillDate}
                              onChange={(e) => setRefillDate(e.target.value)}
                              placeholder="Leave empty to use today's date"
                            />
                            <p className="text-sm text-muted-foreground">
                              This will update the next refill date. Leave empty to keep current date.
                            </p>
                          </div>
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              onClick={() => {
                                setIsRefillDialogOpen(false);
                                setRefillDate('');
                              }}
                            >
                              Cancel
                            </Button>
                            <Button onClick={handleRecordRefill}>
                              Record Refill
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                </>
              )}
              {prescription.refillReminder?.enabled && (
                <div>
                  <p className="text-sm text-muted-foreground">Reminder</p>
                  <p className="font-medium">
                    {prescription.refillReminder.daysBefore} days before refill date
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pharmacy Information */}
          {(prescription.pharmacyName || prescription.pharmacyPhone) && (
            <Card>
              <CardHeader>
                <CardTitle>Pharmacy</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {prescription.pharmacyName && (
                  <div>
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p className="font-medium">{prescription.pharmacyName}</p>
                  </div>
                )}
                {prescription.pharmacyPhone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <a href={`tel:${prescription.pharmacyPhone}`} className="text-primary hover:underline">
                      {prescription.pharmacyPhone}
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Instructions */}
          {prescription.instructions && (
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Special Instructions</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{prescription.instructions}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Medication Intake Tracking */}
        {prescription.trackingEnabled !== false && prescription.frequency && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Medication Intake Tracking</CardTitle>
              <CardDescription>
                Track when medication is taken
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {medicationStatus && (
                <>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">Today's Status</p>
                      <p className="text-sm text-muted-foreground">
                        {medicationStatus.todayCount > 0 ? (
                          <>Taken {medicationStatus.todayCount} time{medicationStatus.todayCount > 1 ? 's' : ''} today</>
                        ) : (
                          <>Not taken today</>
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {medicationStatus.canMark ? (
                        <Badge variant="default" className="bg-green-500">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Can Mark
                        </Badge>
                      ) : medicationStatus.todayRecords.length > 0 ? (
                        <Badge variant="default" className="bg-blue-500">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Completed
                        </Badge>
                      ) : (
                        <Badge variant="outline">
                          <Clock className="h-3 w-3 mr-1" />
                          Wait
                        </Badge>
                      )}
                    </div>
                  </div>

                  {medicationStatus.canMark && (
                    <Dialog open={isMarkDialogOpen} onOpenChange={setIsMarkDialogOpen}>
                      <DialogTrigger asChild>
                        <Button className="w-full">
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          Mark Medication as Taken
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Mark Medication as Taken</DialogTitle>
                          <DialogDescription>
                            Record that this medication was taken
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="markNotes">Notes (Optional)</Label>
                            <textarea
                              id="markNotes"
                              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                              value={markNotes}
                              onChange={(e) => setMarkNotes(e.target.value)}
                              placeholder="e.g., Taken with breakfast"
                              rows={3}
                            />
                          </div>
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              onClick={() => {
                                setIsMarkDialogOpen(false);
                                setMarkNotes('');
                              }}
                            >
                              Cancel
                            </Button>
                            <Button
                              onClick={async () => {
                                try {
                                  setMarking(true);
                                  await markTaken(markNotes);
                                  setIsMarkDialogOpen(false);
                                  setMarkNotes('');
                                  toast({
                                    title: 'Success',
                                    description: 'Medication marked as taken',
                                  });
                                } catch (err) {
                                  toast({
                                    variant: 'destructive',
                                    title: 'Error',
                                    description: err.message || 'Failed to mark medication',
                                  });
                                } finally {
                                  setMarking(false);
                                }
                              }}
                              disabled={marking}
                            >
                              {marking ? 'Marking...' : 'Mark as Taken'}
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}

                  {medicationStatus.lastTaken && (
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm font-medium">Last Taken</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDateTime(medicationStatus.lastTaken.takenAt)}
                        {medicationStatus.lastTaken.notes && (
                          <> - {medicationStatus.lastTaken.notes}</>
                        )}
                      </p>
                    </div>
                  )}

                  {medicationStatus.todayRecords.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Today's Records</p>
                      <div className="space-y-2">
                        {medicationStatus.todayRecords.map((record, idx) => (
                          <div key={idx} className="flex items-center justify-between p-2 border rounded">
                            <div>
                              <p className="text-sm">{formatDateTime(record.takenAt)}</p>
                              {record.notes && (
                                <p className="text-xs text-muted-foreground">{record.notes}</p>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={async () => {
                                if (confirm('Remove this record?')) {
                                  try {
                                    await unmarkTaken(idx);
                                    toast({
                                      title: 'Success',
                                      description: 'Record removed',
                                    });
                                  } catch (err) {
                                    toast({
                                      variant: 'destructive',
                                      title: 'Error',
                                      description: err.message || 'Failed to remove record',
                                    });
                                  }
                                }
                              }}
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {prescription.intakeRecords && prescription.intakeRecords.length > 0 && (
                    <div className="border-t pt-4">
                      <p className="text-sm font-medium mb-2">Recent History</p>
                      <div className="space-y-1 max-h-48 overflow-y-auto">
                        {prescription.intakeRecords.slice(0, 10).map((record, idx) => {
                          const recordDate = new Date(record.takenAt);
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          const isToday = recordDate >= today;
                          
                          return (
                            <div key={idx} className="text-xs text-muted-foreground p-2 border rounded">
                              {formatDateTime(record.takenAt)}
                              {record.notes && ` - ${record.notes}`}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {prescription.status === 1 && (
                <Button onClick={() => handleStatusChange(2)} variant="outline">
                  Mark as Completed
                </Button>
              )}
              {prescription.status === 1 && (
                <Button onClick={() => handleStatusChange(3)} variant="outline">
                  Mark as Discontinued
                </Button>
              )}
              {prescription.status !== 1 && (
                <Button onClick={() => handleStatusChange(1)} variant="outline">
                  Mark as Active
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

