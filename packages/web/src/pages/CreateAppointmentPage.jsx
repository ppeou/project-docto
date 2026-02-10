import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { createAppointment } from '@/services/firestore';
import { DatePicker } from '@core/components/DatePicker.jsx';
import { useItinerary } from '@/hooks/useItinerary';
import { useDoctors } from '@/hooks/useDoctors';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { FormPageLayout } from '@/components/layouts/FormPageLayout';
import { APPOINTMENT_STATUS_OPTIONS } from '@/lib/constants';
import { Loader2 } from 'lucide-react';

export default function CreateAppointmentPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const itineraryId = searchParams.get('itineraryId');
  const { itinerary } = useItinerary(itineraryId);
  const { doctors, loading: doctorsLoading } = useDoctors();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    itineraryId: itineraryId || '',
    title: '',
    doctorId: '',
    doctorSpecialty: '',
    doctorPhone: '',
    doctorEmail: '',
    clinicName: '',
    appointmentDate: '',
    appointmentTime: '',
    duration: '30',
    purpose: '',
    notes: '',
    status: 1,
    reminderEnabled: true,
    reminderMinutesBefore: '1440',
  });

  useEffect(() => {
    if (itineraryId && !formData.itineraryId) {
      setFormData(prev => ({ ...prev, itineraryId }));
    }
  }, [itineraryId]);

  // Auto-fill doctor details when a doctor is selected
  useEffect(() => {
    if (formData.doctorId && doctors.length > 0) {
      const selectedDoctor = doctors.find(d => d.id === formData.doctorId);
      if (selectedDoctor) {
        setFormData(prev => ({
          ...prev,
          doctorSpecialty: selectedDoctor.specialty || '',
          doctorPhone: selectedDoctor.phones?.[0]?.phone || '',
          doctorEmail: selectedDoctor.emails?.[0]?.email || '',
        }));
      }
    }
  }, [formData.doctorId, doctors]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.doctorId) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please select a doctor',
      });
      return;
    }

    setLoading(true);

    try {
      const selectedDoctor = doctors.find(d => d.id === formData.doctorId);
      if (!selectedDoctor) {
        throw new Error('Selected doctor not found');
      }

      const appointmentDateTime = new Date(`${formData.appointmentDate}T${formData.appointmentTime}`);
      
      const appointmentData = {
        itineraryId: formData.itineraryId,
        title: formData.title,
        doctorId: formData.doctorId,
        doctorSnapshot: {
          name: selectedDoctor.name,
          specialty: formData.doctorSpecialty || selectedDoctor.specialty || undefined,
        },
        clinicName: formData.clinicName || undefined,
        appointmentDate: appointmentDateTime.toISOString(),
        duration: parseInt(formData.duration, 10),
        purpose: formData.purpose || undefined,
        notes: formData.notes || undefined,
        status: parseInt(formData.status, 10),
        reminder: {
          enabled: formData.reminderEnabled,
          minutesBefore: parseInt(formData.reminderMinutesBefore, 10),
        },
      };

      const id = await createAppointment(appointmentData);

      toast({
        title: 'Success',
        description: 'Appointment created successfully!',
      });

      navigate(`/appointments/${id}`);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to create appointment',
      });
    } finally {
      setLoading(false);
    }
  };

  const backUrl = itineraryId ? `/itineraries/${itineraryId}` : '/itineraries';

  return (
    <FormPageLayout
      backTo={backUrl}
      title="Create Appointment"
      description={itinerary ? `For ${itinerary.patient?.name}'s itinerary` : 'Add a new appointment'}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Appointment Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Annual Checkup, Cardiologist Visit"
                  required
                />
              </div>

              <div className="space-y-4 border-t pt-4">
                <h3 className="font-semibold">Doctor Information</h3>
                <div className="space-y-2">
                  <Label htmlFor="doctorId">Doctor *</Label>
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
                      {' '}to create an appointment
                    </p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="doctorSpecialty">Specialty</Label>
                    <Input
                      id="doctorSpecialty"
                      value={formData.doctorSpecialty}
                      onChange={(e) => setFormData({ ...formData, doctorSpecialty: e.target.value })}
                      placeholder="Cardiology, General Practice"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="doctorPhone">Phone</Label>
                    <Input
                      id="doctorPhone"
                      type="tel"
                      value={formData.doctorPhone}
                      onChange={(e) => setFormData({ ...formData, doctorPhone: e.target.value })}
                      placeholder="+1234567890"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="doctorEmail">Email</Label>
                  <Input
                    id="doctorEmail"
                    type="email"
                    value={formData.doctorEmail}
                    onChange={(e) => setFormData({ ...formData, doctorEmail: e.target.value })}
                    placeholder="doctor@clinic.com"
                  />
                </div>
              </div>

              <div className="space-y-4 border-t pt-4">
                <h3 className="font-semibold">Clinic Information</h3>
                <div className="space-y-2">
                  <Label htmlFor="clinicName">Clinic/Hospital Name</Label>
                  <Input
                    id="clinicName"
                    value={formData.clinicName}
                    onChange={(e) => setFormData({ ...formData, clinicName: e.target.value })}
                    placeholder="City Medical Center"
                  />
                </div>
              </div>

              <div className="space-y-4 border-t pt-4">
                <h3 className="font-semibold">Appointment Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="appointmentDate">Date *</Label>
                    <DatePicker
                      id="appointmentDate"
                      name="appointmentDate"
                      value={formData.appointmentDate}
                      onChange={(e) => setFormData({ ...formData, appointmentDate: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="appointmentTime">Time *</Label>
                    <Input
                      id="appointmentTime"
                      type="time"
                      value={formData.appointmentTime}
                      onChange={(e) => setFormData({ ...formData, appointmentTime: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration (minutes)</Label>
                    <Input
                      id="duration"
                      type="number"
                      min="5"
                      max="480"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={formData.status.toString()}
                      onValueChange={(value) => setFormData({ ...formData, status: parseInt(value, 10) })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {APPOINTMENT_STATUS_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value.toString()}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="purpose">Purpose</Label>
                  <Input
                    id="purpose"
                    value={formData.purpose}
                    onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                    placeholder="Follow-up, New patient, Test results"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <textarea
                    id="notes"
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Pre-appointment notes"
                    rows={3}
                  />
                </div>
              </div>

              <div className="space-y-4 border-t pt-4">
                <h3 className="font-semibold">Reminder</h3>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="reminderEnabled"
                    checked={formData.reminderEnabled}
                    onChange={(e) => setFormData({ ...formData, reminderEnabled: e.target.checked })}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <Label htmlFor="reminderEnabled">Enable reminder</Label>
                </div>
                {formData.reminderEnabled && (
                  <div className="space-y-2">
                    <Label htmlFor="reminderMinutesBefore">Remind me before (minutes)</Label>
                    <Input
                      id="reminderMinutesBefore"
                      type="number"
                      min="5"
                      value={formData.reminderMinutesBefore}
                      onChange={(e) => setFormData({ ...formData, reminderMinutesBefore: e.target.value })}
                      placeholder="1440 (24 hours)"
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
                    'Create Appointment'
                  )}
                </Button>
                <Link to={backUrl} className="flex-1">
                  <Button type="button" variant="outline" className="w-full">
                    Cancel
                  </Button>
                </Link>
              </div>
      </form>
    </FormPageLayout>
  );
}

