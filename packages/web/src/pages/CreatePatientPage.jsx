import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createPatient } from '@/services/firestore';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { FormPageLayout } from '@/components/layouts/FormPageLayout';
import { ContactForm } from '@/components/forms/ContactForm';
import { Loader2 } from 'lucide-react';

const getInitialFormData = () => ({
  name: '',
  relation: 'Self',
  phones: [],
  emails: [],
  websites: [],
  addresses: [],
});

export default function CreatePatientPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(getInitialFormData);

  const handleSubmit = async () => {
    if (!formData.name?.trim()) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Patient name is required',
      });
      return;
    }

    setLoading(true);
    try {
      const id = await createPatient(formData);
      toast({
        title: 'Success',
        description: 'Patient created successfully!',
      });
      navigate(`/patients/${id}`);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to create patient',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormPageLayout
      backTo="/patients"
      title="Add Patient"
      description="Add a new patient to your list"
    >
      <div className="space-y-6">
        <ContactForm
          formData={formData}
          setFormData={setFormData}
          type="patient"
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        />
        
        <div className="flex gap-4">
          <Button type="button" onClick={handleSubmit} disabled={loading} className="flex-1">
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Patient
          </Button>
          <Link to="/patients" className="flex-1">
            <Button type="button" variant="outline" className="w-full">
              Cancel
            </Button>
          </Link>
        </div>
      </div>
    </FormPageLayout>
  );
}

