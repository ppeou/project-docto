import { Link } from 'react-router-dom';
import { useDoctors } from '@/hooks/useDoctors';
import { deleteDoctor } from '@/services/firestore';
import { useSearch } from '@/hooks/useSearch';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Edit, Trash2, Phone, Mail, Globe, Search, Plus } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export default function DoctorsPage() {
  const { doctors, loading } = useDoctors();
  const { toast } = useToast();

  const { searchQuery, setSearchQuery, filteredItems: filteredDoctors } = useSearch(doctors, ['name', 'specialty']);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this doctor?')) return;
    try {
      await deleteDoctor(id);
      toast({ title: 'Doctor deleted' });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to delete doctor',
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen p-4">
        <div className="flex items-center justify-center h-screen">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex justify-between items-center mb-6">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search doctors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Link to="/doctors/create">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Doctor
            </Button>
          </Link>
        </div>

        {filteredDoctors.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {searchQuery ? 'No matching doctors' : 'No doctors yet'}
            </p>
            {!searchQuery && (
              <p className="text-sm text-muted-foreground mt-2">
                Add your first doctor to get started
              </p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDoctors.map((doctor) => (
              <Card key={doctor.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{doctor.name}</CardTitle>
                      {(doctor.specialties && doctor.specialties.length > 0) || doctor.specialty ? (
                        <CardDescription>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {(doctor.specialties || (doctor.specialty ? [doctor.specialty] : [])).map((spec, idx) => (
                              <span key={idx} className="text-xs bg-secondary px-2 py-0.5 rounded">
                                {spec}
                              </span>
                            ))}
                          </div>
                        </CardDescription>
                      ) : null}
                    </div>
                    <div className="flex gap-2">
                      <Link to={`/doctors/${doctor.id}/edit`}>
                        <Button
                          variant="ghost"
                          size="icon"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(doctor.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {doctor.phones && doctor.phones.length > 0 && (
                    <div className="space-y-1 mb-2">
                      {doctor.phones.slice(0, 2).map((phone, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          {phone.phone}
                        </div>
                      ))}
                    </div>
                  )}
                  {doctor.emails && doctor.emails.length > 0 && (
                    <div className="space-y-1 mb-2">
                      {doctor.emails.slice(0, 2).map((email, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Mail className="h-3 w-3" />
                          {email.email}
                        </div>
                      ))}
                    </div>
                  )}
                  {doctor.websites && doctor.websites.length > 0 && (
                    <div className="space-y-1">
                      {doctor.websites.slice(0, 1).map((website, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Globe className="h-3 w-3" />
                          <a href={website.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                            {website.url}
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
