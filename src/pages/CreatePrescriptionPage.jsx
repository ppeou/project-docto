import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { createPrescription } from '@/services/firestore';
import { useItinerary } from '@/hooks/useItinerary';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, ArrowLeft } from 'lucide-react';

const STATUS_OPTIONS = [
  { value: 1, label: 'Active' },
  { value: 2, label: 'Completed' },
  { value: 3, label: 'Discontinued' },
];

export default function CreatePrescriptionPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const itineraryId = searchParams.get('itineraryId');
  const appointmentId = searchParams.get('appointmentId');
  const { itinerary } = useItinerary(itineraryId);
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    itineraryId: itineraryId || '',
    appointmentId: appointmentId || '',
    medicationName: '',
    genericName: '',
    dosage: '',
    frequency: '',
    quantity: '30',
    prescribedBy: '',
    pharmacyName: '',
    pharmacyPhone: '',
    datePrescribed: '',
    refillsTotal: '0',
    refillsRemaining: '0',
    nextRefillDate: '',
    instructions: '',
    status: 1,
    refillReminderEnabled: true,
    refillReminderDaysBefore: '7',
  });

  useEffect(() => {
    if (itineraryId && !formData.itineraryId) {
      setFormData(prev => ({ ...prev, itineraryId }));
    }
    if (appointmentId && !formData.appointmentId) {
      setFormData(prev => ({ ...prev, appointmentId }));
    }
  }, [itineraryId, appointmentId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const prescriptionData = {
        itineraryId: formData.itineraryId,
        appointmentId: formData.appointmentId || undefined,
        medicationName: formData.medicationName,
        genericName: formData.genericName || undefined,
        dosage: formData.dosage,
        frequency: formData.frequency,
        quantity: parseInt(formData.quantity, 10),
        prescribedBy: {
          name: formData.prescribedBy,
        },
        pharmacyName: formData.pharmacyName || undefined,
        pharmacyPhone: formData.pharmacyPhone || undefined,
        datePrescribed: new Date(formData.datePrescribed).toISOString(),
        refills: {
          total: parseInt(formData.refillsTotal, 10),
          remaining: parseInt(formData.refillsRemaining, 10),
        },
        nextRefillDate: formData.nextRefillDate ? new Date(formData.nextRefillDate).toISOString() : undefined,
        instructions: formData.instructions || undefined,
        status: parseInt(formData.status, 10),
        refillReminder: {
          enabled: formData.refillReminderEnabled,
          daysBefore: parseInt(formData.refillReminderDaysBefore, 10),
        },
      };

      const id = await createPrescription(prescriptionData);

      toast({
        title: 'Success',
        description: 'Prescription created successfully!',
      });

      navigate(`/prescriptions/${id}`);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to create prescription',
      });
    } finally {
      setLoading(false);
    }
  };

  const backUrl = itineraryId ? `/itineraries/${itineraryId}` : '/itineraries';

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="container mx-auto max-w-2xl">
        <Link to={backUrl}>
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </Link>

        <Card>
          <CardHeader>
            <CardTitle>Create Prescription</CardTitle>
            <CardDescription>
              {itinerary ? `For ${itinerary.patient?.name}'s itinerary` : 'Add a new prescription'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="medicationName">Medication Name *</Label>
                  <Input
                    id="medicationName"
                    value={formData.medicationName}
                    onChange={(e) => setFormData({ ...formData, medicationName: e.target.value })}
                    placeholder="e.g., Aspirin"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="genericName">Generic Name</Label>
                  <Input
                    id="genericName"
                    value={formData.genericName}
                    onChange={(e) => setFormData({ ...formData, genericName: e.target.value })}
                    placeholder="e.g., Acetylsalicylic acid"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dosage">Dosage *</Label>
                  <Input
                    id="dosage"
                    value={formData.dosage}
                    onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                    placeholder="e.g., 10mg, 1 tablet"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="frequency">Frequency *</Label>
                  <Input
                    id="frequency"
                    value={formData.frequency}
                    onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                    placeholder="e.g., Twice daily"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="prescribedBy">Prescribed By (Doctor Name) *</Label>
                <Input
                  id="prescribedBy"
                  value={formData.prescribedBy}
                  onChange={(e) => setFormData({ ...formData, prescribedBy: e.target.value })}
                  placeholder="Dr. John Smith"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity *</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="datePrescribed">Date Prescribed *</Label>
                  <Input
                    id="datePrescribed"
                    type="date"
                    value={formData.datePrescribed}
                    onChange={(e) => setFormData({ ...formData, datePrescribed: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-4 border-t pt-4">
                <h3 className="font-semibold">Refill Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="refillsTotal">Total Refills</Label>
                    <Input
                      id="refillsTotal"
                      type="number"
                      min="0"
                      value={formData.refillsTotal}
                      onChange={(e) => {
                        const total = e.target.value;
                        setFormData(prev => ({
                          ...prev,
                          refillsTotal: total,
                          refillsRemaining: prev.refillsRemaining > total ? total : prev.refillsRemaining,
                        }));
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="refillsRemaining">Remaining Refills</Label>
                    <Input
                      id="refillsRemaining"
                      type="number"
                      min="0"
                      max={formData.refillsTotal}
                      value={formData.refillsRemaining}
                      onChange={(e) => setFormData({ ...formData, refillsRemaining: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nextRefillDate">Next Refill Date</Label>
                  <Input
                    id="nextRefillDate"
                    type="date"
                    value={formData.nextRefillDate}
                    onChange={(e) => setFormData({ ...formData, nextRefillDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-4 border-t pt-4">
                <h3 className="font-semibold">Pharmacy Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="pharmacyName">Pharmacy Name</Label>
                    <Input
                      id="pharmacyName"
                      value={formData.pharmacyName}
                      onChange={(e) => setFormData({ ...formData, pharmacyName: e.target.value })}
                      placeholder="CVS Pharmacy"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pharmacyPhone">Pharmacy Phone</Label>
                    <Input
                      id="pharmacyPhone"
                      type="tel"
                      value={formData.pharmacyPhone}
                      onChange={(e) => setFormData({ ...formData, pharmacyPhone: e.target.value })}
                      placeholder="+1234567890"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="instructions">Special Instructions</Label>
                <textarea
                  id="instructions"
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={formData.instructions}
                  onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                  placeholder="e.g., Take with food, Avoid alcohol"
                  rows={3}
                />
              </div>

              <div className="space-y-4 border-t pt-4">
                <h3 className="font-semibold">Refill Reminder</h3>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="refillReminderEnabled"
                    checked={formData.refillReminderEnabled}
                    onChange={(e) => setFormData({ ...formData, refillReminderEnabled: e.target.checked })}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <Label htmlFor="refillReminderEnabled">Enable refill reminder</Label>
                </div>
                {formData.refillReminderEnabled && (
                  <div className="space-y-2">
                    <Label htmlFor="refillReminderDaysBefore">Remind me before (days)</Label>
                    <Input
                      id="refillReminderDaysBefore"
                      type="number"
                      min="1"
                      max="30"
                      value={formData.refillReminderDaysBefore}
                      onChange={(e) => setFormData({ ...formData, refillReminderDaysBefore: e.target.value })}
                    />
                  </div>
                )}
              </div>

              <div className="flex gap-4">
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Prescription'
                  )}
                </Button>
                <Link to={backUrl} className="flex-1">
                  <Button type="button" variant="outline" className="w-full">
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

