import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useDoctor } from '@/hooks/useDoctor';
import { updateDoctor } from '@/services/firestore';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { FormPageLayout } from '@/components/layouts/FormPageLayout';
import { ContactForm } from '@/components/forms/ContactForm';
import { Loader2 } from 'lucide-react';

const getInitialFormData = (doctor = null) => {
  const specialties = doctor?.specialties || (doctor?.specialty ? [doctor.specialty] : []);
  return {
    name: doctor?.name || '',
    specialty: doctor?.specialty || specialties.join(', '),
    specialties,
    phones: doctor?.phones || [],
    emails: doctor?.emails || [],
    websites: doctor?.websites || [],
  };
};

export default function EditDoctorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { doctor, loading, error } = useDoctor(id);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState(getInitialFormData);

  useEffect(() => {
    if (doctor) {
      setFormData(getInitialFormData(doctor));
    }
  }, [doctor]);

  const handleSubmit = async () => {
    if (!formData.name?.trim()) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Doctor name is required',
      });
      return;
    }

    setSaving(true);
    try {
      await updateDoctor(id, formData);
      toast({
        title: 'Success',
        description: 'Doctor updated successfully!',
      });
      navigate('/doctors');
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: err.message || 'Failed to update doctor',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !doctor) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-muted-foreground">
          {error?.message || 'Doctor not found'}
        </p>
      </div>
    );
  }

  return (
    <FormPageLayout
      backTo="/doctors"
      title="Edit Doctor"
      description="Update doctor information"
    >
      <div className="space-y-6">
        <ContactForm
          formData={formData}
          setFormData={setFormData}
          type="doctor"
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        />

        <div className="flex gap-4">
          <Button type="button" onClick={handleSubmit} disabled={saving} className="flex-1">
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
          <Link to="/doctors" className="flex-1">
            <Button type="button" variant="outline" className="w-full">
              Cancel
            </Button>
          </Link>
        </div>
      </div>
    </FormPageLayout>
  );
}