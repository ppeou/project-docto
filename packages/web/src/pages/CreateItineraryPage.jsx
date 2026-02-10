import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createItinerary } from '@/services/firestore';
import { usePatients } from '@/hooks/usePatients';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { FormPageLayout } from '@/components/layouts/FormPageLayout';
import { Loader2 } from 'lucide-react';

export default function CreateItineraryPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { patients, loading: patientsLoading } = usePatients();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    patientId: '',
    startDate: '',
    endDate: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.patientId) {
      toast({ variant: 'destructive', title: 'Error', description: 'Please select a patient' });
      return;
    }
    const selectedPatient = patients.find((p) => p.id === formData.patientId);
    if (!selectedPatient) {
      toast({ variant: 'destructive', title: 'Error', description: 'Selected patient not found' });
      return;
    }

    setLoading(true);
    try {
      const id = await createItinerary({
        name: formData.name,
        description: formData.description || null,
        patient: { name: selectedPatient.name, relation: selectedPatient.relation },
        startDate: formData.startDate ? new Date(formData.startDate).toISOString() : null,
        endDate: formData.endDate ? new Date(formData.endDate).toISOString() : null,
      });
      toast({ title: 'Success', description: 'Itinerary created successfully!' });
      navigate(`/itineraries/${id}`);
    } catch (err) {
      toast({ variant: 'destructive', title: 'Error', description: err.message || 'Failed to create itinerary' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormPageLayout
      backTo="/itineraries"
      title="Create Healthcare Itinerary"
      description="Create a new healthcare itinerary for yourself or a family member"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name">Itinerary Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Mom's Healthcare - 2024"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="patientId">Patient *</Label>
          <Select
            value={formData.patientId}
            onValueChange={(v) => setFormData({ ...formData, patientId: v })}
            disabled={patientsLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder={patientsLoading ? 'Loading...' : 'Select a patient'} />
            </SelectTrigger>
            <SelectContent>
              {patients.length === 0 ? (
                <SelectItem value="__none__" disabled>No patients. Add one first.</SelectItem>
              ) : (
                patients.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.name} ({p.relation})</SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          {patients.length === 0 && (
            <p className="text-sm text-muted-foreground">
              <Link to="/patients" className="text-primary hover:underline">Add a patient</Link> to create an itinerary.
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <textarea
            id="description"
            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Optional"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="startDate">Start Date</Label>
            <Input
              id="startDate"
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="endDate">End Date</Label>
            <Input
              id="endDate"
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            />
          </div>
        </div>

        <div className="flex gap-4">
          <Button type="submit" disabled={loading} className="flex-1">
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Itinerary
          </Button>
          <Link to="/itineraries" className="flex-1">
            <Button type="button" variant="outline" className="w-full">Cancel</Button>
          </Link>
        </div>
      </form>
    </FormPageLayout>
  );
}
