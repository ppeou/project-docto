import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { createDoctorNote } from '@/services/firestore';
import { uploadFiles } from '@/services/storage';
import { useAuth } from '@/hooks/useAuth';
import { useAppointment } from '@/hooks/useAppointment';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileUpload } from '@/components/forms/FileUpload';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, ArrowLeft } from 'lucide-react';

const NOTE_TYPES = [
  { value: 1, label: 'General Notes' },
  { value: 2, label: 'Test Results' },
  { value: 3, label: 'Treatment Plan' },
  { value: 4, label: 'Diagnosis' },
  { value: 5, label: 'Other' },
];

export default function CreateDoctorNotePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const appointmentId = searchParams.get('appointmentId');
  const { user } = useAuth();
  const { appointment } = useAppointment(appointmentId);
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [files, setFiles] = useState([]);
  const [formData, setFormData] = useState({
    appointmentId: appointmentId || '',
    itineraryId: appointment?.itineraryId || '',
    title: '',
    content: '',
    noteType: 1,
  });

  useEffect(() => {
    if (appointmentId && !formData.appointmentId) {
      setFormData(prev => ({ ...prev, appointmentId }));
    }
    if (appointment?.itineraryId && !formData.itineraryId) {
      setFormData(prev => ({ ...prev, itineraryId: appointment.itineraryId }));
    }
  }, [appointmentId, appointment]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let attachments = [];

      // Upload files if any
      if (files.length > 0) {
        setUploading(true);
        const storagePath = `doctor-notes/${user.uid}/${Date.now()}/`;
        const uploadedFiles = await uploadFiles(files, storagePath);
        attachments = uploadedFiles.map((file) => ({
          name: file.name,
          url: file.url,
          type: file.type,
        }));
        setUploading(false);
      }

      const noteData = {
        ...formData,
        appointmentId: formData.appointmentId,
        itineraryId: formData.itineraryId,
        noteType: parseInt(formData.noteType, 10),
        attachments: attachments.length > 0 ? attachments : undefined,
      };

      const id = await createDoctorNote(noteData);

      toast({
        title: 'Success',
        description: 'Doctor note created successfully!',
      });

      // Navigate back to appointment or itinerary
      if (appointmentId) {
        navigate(`/appointments/${appointmentId}`);
      } else if (formData.itineraryId) {
        navigate(`/itineraries/${formData.itineraryId}`);
      } else {
        navigate('/itineraries');
      }
    } catch (error) {
      setUploading(false);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to create doctor note',
      });
    } finally {
      setLoading(false);
    }
  };

  const backUrl = appointmentId
    ? `/appointments/${appointmentId}`
    : formData.itineraryId
    ? `/itineraries/${formData.itineraryId}`
    : '/itineraries';

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
            <CardTitle>Create Doctor Note</CardTitle>
            <CardDescription>
              {appointment ? `For appointment: ${appointment.title}` : 'Add a new doctor note'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="noteType">Note Type *</Label>
                <Select
                  value={formData.noteType.toString()}
                  onValueChange={(value) => setFormData({ ...formData, noteType: parseInt(value, 10) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {NOTE_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value.toString()}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Test Results, Treatment Plan"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Content *</Label>
                <textarea
                  id="content"
                  className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Enter note content..."
                  rows={6}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Attachments (Optional)</Label>
                <FileUpload files={files} onFilesChange={setFiles} maxFiles={5} />
                <p className="text-xs text-muted-foreground">
                  Supported: PDF, Images (JPG, PNG, GIF), Word docs, TXT. Max 10MB per file.
                </p>
              </div>

              <div className="flex gap-4">
                <Button type="submit" disabled={loading || uploading} className="flex-1">
                  {(loading || uploading) ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {uploading ? 'Uploading files...' : 'Creating...'}
                    </>
                  ) : (
                    'Create Note'
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

