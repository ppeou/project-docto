import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { createPrescription } from '@/services/firestore';
import { useItinerary } from '@/hooks/useItinerary';
import { usePatients } from '@/hooks/usePatients';
import { useDoctors } from '@/hooks/useDoctors';
import { useFrequencyOptions } from '@/hooks/useFrequencyOptions';
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
  const patientIdParam = searchParams.get('patientId');
  const { itinerary } = useItinerary(itineraryId);
  const { patients, loading: patientsLoading } = usePatients();
  const { doctors, loading: doctorsLoading } = useDoctors();
  const { frequencyOptions, loading: frequencyOptionsLoading } = useFrequencyOptions();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    itineraryId: itineraryId || '',
    appointmentId: appointmentId || '',
    patientId: '',
    medicationName: '',
    genericName: '',
    dosage: '',
    frequency: null, // Will store frequency object
    quantity: '30',
    trackingStartDate: '',
    trackingEndDate: '',
    trackingEnabled: true,
    doctorId: '',
    pharmacyName: '',
    pharmacyPhone: '',
    rxNumber: '',
    corpNumber: '',
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
    // Auto-select patient from URL parameter if available
    if (patientIdParam && !formData.patientId) {
      setFormData(prev => ({ ...prev, patientId: patientIdParam }));
    }
    // Auto-select patient from itinerary if available (fallback)
    else if (itinerary?.patient && !formData.patientId && patients.length > 0) {
      const matchingPatient = patients.find(
        p => p.name === itinerary.patient?.name && p.relation === itinerary.patient?.relation
      );
      if (matchingPatient) {
        setFormData(prev => ({ ...prev, patientId: matchingPatient.id }));
      }
    }
  }, [itineraryId, appointmentId, patientIdParam, itinerary, patients]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.patientId) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please select a patient',
      });
      return;
    }

    if (!formData.doctorId) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please select a doctor',
      });
      return;
    }

    if (!formData.frequency) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please select a frequency',
      });
      return;
    }

    setLoading(true);

    try {
      const selectedDoctor = doctors.find(d => d.id === formData.doctorId);
      if (!selectedDoctor) {
        throw new Error('Selected doctor not found');
      }

      const prescriptionData = {
        itineraryId: formData.itineraryId,
        appointmentId: formData.appointmentId || undefined,
        patientId: formData.patientId,
        medicationName: formData.medicationName,
        genericName: formData.genericName || undefined,
        dosage: formData.dosage,
        frequency: formData.frequency, // Frequency object { label, intervalValue, intervalUnit }
        quantity: parseInt(formData.quantity, 10),
        trackingStartDate: formData.trackingStartDate || undefined,
        trackingEndDate: formData.trackingEndDate || undefined,
        trackingEnabled: formData.trackingEnabled,
        prescribedBy: {
          name: selectedDoctor.name,
          specialty: selectedDoctor.specialty || undefined,
        },
        pharmacyName: formData.pharmacyName || undefined,
        pharmacyPhone: formData.pharmacyPhone || undefined,
        rxNumber: formData.rxNumber || undefined,
        corpNumber: formData.corpNumber || undefined,
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
    <div className="min-h-screen bg-background p-4">
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
              {/* Patient Selection */}
              <div className="space-y-4 border-b pb-4">
                <h3 className="font-semibold">Patient Information</h3>
                <div className="space-y-2">
                  <Label htmlFor="patientId">Patient *</Label>
                  <Select
                    value={formData.patientId}
                    onValueChange={(value) => setFormData({ ...formData, patientId: value })}
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
                      {' '}to create a prescription
                    </p>
                  )}
                </div>
              </div>

              {/* Prescription Information */}
              <div className="space-y-4 border-b pb-4">
                <h3 className="font-semibold">Prescription Information</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="medicationName">Drug Name *</Label>
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
                    <Label htmlFor="dosage">Dose *</Label>
                    <Input
                      id="dosage"
                      value={formData.dosage}
                      onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                      placeholder="e.g., 10mg, 1 tablet"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="frequency">Intake Frequency *</Label>
                    <Select
                      value={formData.frequency ? JSON.stringify(formData.frequency) : ''}
                      onValueChange={(value) => {
                        const frequency = JSON.parse(value);
                        setFormData({ ...formData, frequency });
                      }}
                      disabled={frequencyOptionsLoading}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={frequencyOptionsLoading ? "Loading frequencies..." : "Select frequency"} />
                      </SelectTrigger>
                      <SelectContent>
                        {frequencyOptions.length === 0 ? (
                          <SelectItem value="no-frequencies" disabled>
                            {frequencyOptionsLoading ? "Loading..." : "No frequencies available"}
                          </SelectItem>
                        ) : (
                          frequencyOptions.map((freq) => (
                            <SelectItem key={freq.id} value={JSON.stringify({ label: freq.label, intervalValue: freq.intervalValue, intervalUnit: freq.intervalUnit })}>
                              {freq.label}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="doctorId">Prescribed By Doctor *</Label>
                    <Select
                      value={formData.doctorId}
                      onValueChange={(value) => setFormData({ ...formData, doctorId: value })}
                      disabled={doctorsLoading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={doctorsLoading ? "Loading doctors..." : "Select a doctor"} />
                      </SelectTrigger>
                      <SelectContent>
                        {doctors.length === 0 ? (
                          <SelectItem value="no-doctors" disabled>
                            No doctors found. Please add a doctor first.
                          </SelectItem>
                        ) : (
                          doctors.map((doctor) => (
                            <SelectItem key={doctor.id} value={doctor.id}>
                              {doctor.name} {doctor.specialty && `- ${doctor.specialty}`}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    {doctors.length === 0 && (
                      <p className="text-sm text-muted-foreground">
                        <Link to="/doctors" className="text-primary hover:underline">
                          Add a doctor
                        </Link>
                        {' '}to continue
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="refillsTotal">Refill Many Times? *</Label>
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
                      placeholder="Number of refills allowed"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="rxNumber">RX Number</Label>
                    <Input
                      id="rxNumber"
                      value={formData.rxNumber}
                      onChange={(e) => setFormData({ ...formData, rxNumber: e.target.value })}
                      placeholder="Prescription number from pharmacy"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="corpNumber">CORP #</Label>
                    <Input
                      id="corpNumber"
                      value={formData.corpNumber}
                      onChange={(e) => setFormData({ ...formData, corpNumber: e.target.value })}
                      placeholder="Corporate/Group number"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4 border-b pb-4">
                <h3 className="font-semibold">Additional Information</h3>
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
                <h3 className="font-semibold">Medication Tracking</h3>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="trackingEnabled"
                    checked={formData.trackingEnabled}
                    onChange={(e) => setFormData({ ...formData, trackingEnabled: e.target.checked })}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <Label htmlFor="trackingEnabled">Enable medication intake tracking</Label>
                </div>
                {formData.trackingEnabled && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="trackingStartDate">Tracking Start Date</Label>
                      <Input
                        id="trackingStartDate"
                        type="date"
                        value={formData.trackingStartDate}
                        onChange={(e) => setFormData({ ...formData, trackingStartDate: e.target.value })}
                      />
                      <p className="text-xs text-muted-foreground">Leave empty to start from today</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="trackingEndDate">Tracking End Date (Optional)</Label>
                      <Input
                        id="trackingEndDate"
                        type="date"
                        value={formData.trackingEndDate}
                        onChange={(e) => setFormData({ ...formData, trackingEndDate: e.target.value })}
                      />
                      <p className="text-xs text-muted-foreground">For limited-time medications (e.g., painkillers after surgery)</p>
                    </div>
                  </div>
                )}
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

