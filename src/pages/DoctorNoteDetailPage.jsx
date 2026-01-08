import { useParams, Link } from 'react-router-dom';
import { useDoctorNote } from '@/hooks/useDoctorNote';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { ErrorMessage } from '@/components/shared/ErrorMessage';
import { ArrowLeft, FileText, Image, File, Download, ExternalLink } from 'lucide-react';
import { formatDateTime } from '@/lib/utils';
import { formatFileSize } from '@/services/storage';

const NOTE_TYPE_LABELS = {
  1: 'General Notes',
  2: 'Test Results',
  3: 'Treatment Plan',
  4: 'Diagnosis',
  5: 'Other',
};

export default function DoctorNoteDetailPage() {
  const { id } = useParams();
  const { note, loading, error } = useDoctorNote(id);

  if (loading) {
    return (
      <div className="min-h-screen p-4">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !note) {
    return (
      <div className="min-h-screen p-4">
        <ErrorMessage error={error || new Error('Note not found')} />
      </div>
    );
  }

  const getFileIcon = (fileType) => {
    switch (fileType) {
      case 'image':
        return <Image className="h-5 w-5" />;
      case 'pdf':
        return <FileText className="h-5 w-5" />;
      default:
        return <File className="h-5 w-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <Link to={note.appointmentId ? `/appointments/${note.appointmentId}` : `/itineraries/${note.itineraryId}`}>
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">{note.title || 'Doctor Note'}</h1>
              <Badge variant="secondary" className="mt-2">
                {NOTE_TYPE_LABELS[note.noteType] || 'Unknown'}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Note Content</CardTitle>
            {note.created?.on && (
              <CardDescription>
                Created: {formatDateTime(note.created.on)}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent>
            <div className="whitespace-pre-wrap text-sm">{note.content}</div>
          </CardContent>
        </Card>

        {note.attachments && note.attachments.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Attachments ({note.attachments.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {note.attachments.map((attachment, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {getFileIcon(attachment.type)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{attachment.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {attachment.type.toUpperCase()}
                          {attachment.size && ` • ${formatFileSize(attachment.size)}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                      >
                        <a href={attachment.url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="mr-2 h-4 w-4" />
                          Open
                        </a>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                      >
                        <a href={attachment.url} download={attachment.name}>
                          <Download className="mr-2 h-4 w-4" />
                          Download
                        </a>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

