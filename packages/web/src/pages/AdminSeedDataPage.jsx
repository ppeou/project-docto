import { useState } from 'react';
import { getDocs, collection } from 'firebase/firestore';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { useToast } from '@/components/ui/use-toast';
import { db } from '@core/services/firebase';
import {
  generateSeedPatients,
  generateSeedDoctors,
  generateSeedItineraries,
  generateSeedAppointments,
  generateSeedPrescriptions,
  generateSeedDoctorNotes,
  generateSeedInvitations,
  generateSeedItineraryShares,
  generateAllSeedData,
  initializeFrequencyOptions,
  ADMIN_USER_IDS,
} from '@/services/admin';
import { Database, Users, Stethoscope, FileText, Calendar, Pill, FileEdit, Play, Clock, Mail, Share2, Bell } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminSeedDataPage() {
  const { user } = useAuth();
  const isAdmin = user && ADMIN_USER_IDS.includes(user.uid);
  
  const [counts, setCounts] = useState({
    patients: 10,
    doctors: 10,
    itineraries: 10,
    appointments: 20,
    prescriptions: 15,
    notes: 20,
    invitations: 10,
    itineraryShares: 10,
  });
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(null);
  const { toast } = useToast();

  const handleGenerateAll = async () => {
    setLoading(true);
    setGenerating('all');
    try {
      // Use current authenticated user ID - must be an admin
      if (!user) {
        throw new Error('You must be logged in to generate seed data');
      }
      if (!isAdmin) {
        throw new Error('You must be an admin to generate seed data');
      }
      const targetUserId = user.uid;
      console.log('Generating seed data as admin user:', targetUserId);
      const results = await generateAllSeedData(counts, targetUserId);
      
      const summary = Object.entries(results)
        .map(([key, value]) => `${key}: ${value.length}`)
        .join(', ');

      toast({
        title: 'Success',
        description: `Generated seed data: ${summary}`,
      });
    } catch (error) {
      console.error('Error generating all seed data:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to generate seed data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
      setGenerating(null);
    }
  };

  const handleInitializeFrequencyOptions = async () => {
    setGenerating('frequencyOptions');
    try {
      const result = await initializeFrequencyOptions();
      
      if (result.errors.length === 0) {
        toast({
          title: 'Success',
          description: `Initialized ${result.added} frequency options. ${result.skipped} already existed.`,
        });
      } else {
        toast({
          title: 'Partial Success',
          description: `Added ${result.added}, skipped ${result.skipped}, ${result.errors.length} errors occurred.`,
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error initializing frequency options:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to initialize frequency options',
        variant: 'destructive',
      });
    } finally {
      setGenerating(null);
    }
  };

  const handleGenerateIndividual = async (type, generator) => {
    setGenerating(type);
    try {
      // Use current authenticated user ID - must be an admin
      if (!user) {
        toast({
          title: 'Error',
          description: 'You must be logged in to generate seed data',
          variant: 'destructive',
        });
        return;
      }
      if (!isAdmin) {
        toast({
          title: 'Error',
          description: 'You must be an admin to generate seed data',
          variant: 'destructive',
        });
        return;
      }
      const targetUserId = user.uid;
      let result;
      const count = counts[type] || 10;

      if (type === 'itineraries') {
        // Need to get existing patients
        const patientsSnapshot = await getDocs(collection(db, 'patients'));
        const patientIds = patientsSnapshot.docs.map((doc) => doc.id);
        
        if (patientIds.length === 0) {
          toast({
            title: 'Error',
            description: 'Please generate patients first',
            variant: 'destructive',
          });
          return;
        }

        result = await generator(count, patientIds, [], targetUserId);
      } else if (type === 'appointments') {
        // Need to get existing itineraries and doctors
        const [itinerariesSnapshot, doctorsSnapshot] = await Promise.all([
          getDocs(collection(db, 'itineraries')),
          getDocs(collection(db, 'doctors')),
        ]);
        const itineraryIds = itinerariesSnapshot.docs.map((doc) => doc.id);
        const doctorIds = doctorsSnapshot.docs.map((doc) => doc.id);

        if (itineraryIds.length === 0 || doctorIds.length === 0) {
          toast({
            title: 'Error',
            description: 'Please generate itineraries and doctors first',
            variant: 'destructive',
          });
          return;
        }

        result = await generator(count, itineraryIds, doctorIds, targetUserId);
      } else if (type === 'prescriptions') {
        // Need to get existing itineraries and doctors
        const [itinerariesSnapshot, doctorsSnapshot] = await Promise.all([
          getDocs(collection(db, 'itineraries')),
          getDocs(collection(db, 'doctors')),
        ]);
        const itineraryIds = itinerariesSnapshot.docs.map((doc) => doc.id);
        const doctorIds = doctorsSnapshot.docs.map((doc) => doc.id);

        if (itineraryIds.length === 0 || doctorIds.length === 0) {
          toast({
            title: 'Error',
            description: 'Please generate itineraries and doctors first',
            variant: 'destructive',
          });
          return;
        }

        result = await generator(count, itineraryIds, doctorIds, targetUserId);
      } else if (type === 'notes') {
        // Need to get existing appointments and itineraries
        const [appointmentsSnapshot, itinerariesSnapshot] = await Promise.all([
          getDocs(collection(db, 'appointments')),
          getDocs(collection(db, 'itineraries')),
        ]);
        const appointmentIds = appointmentsSnapshot.docs.map((doc) => doc.id);
        const itineraryIds = itinerariesSnapshot.docs.map((doc) => doc.id);

        if (appointmentIds.length === 0 || itineraryIds.length === 0) {
          toast({
            title: 'Error',
            description: 'Please generate appointments and itineraries first',
            variant: 'destructive',
          });
          return;
        }

        result = await generator(count, appointmentIds, itineraryIds, targetUserId);
      } else if (type === 'invitations') {
        // Need to get existing itineraries
        const itinerariesSnapshot = await getDocs(collection(db, 'itineraries'));
        const itineraryIds = itinerariesSnapshot.docs.map((doc) => doc.id);

        if (itineraryIds.length === 0) {
          toast({
            title: 'Error',
            description: 'Please generate itineraries first',
            variant: 'destructive',
          });
          return;
        }

        result = await generator(count, itineraryIds, targetUserId);
      } else if (type === 'itineraryShares') {
        // Need to get existing itineraries
        const itinerariesSnapshot = await getDocs(collection(db, 'itineraries'));
        const itineraryIds = itinerariesSnapshot.docs.map((doc) => doc.id);

        if (itineraryIds.length === 0) {
          toast({
            title: 'Error',
            description: 'Please generate itineraries first',
            variant: 'destructive',
          });
          return;
        }

        result = await generator(count, itineraryIds, [], targetUserId);
      } else {
        // For patients and doctors, pass targetUserId
        result = await generator(count, targetUserId);
      }

      toast({
        title: 'Success',
        description: `Generated ${result.length} ${type}`,
      });
    } catch (error) {
      console.error(`Error generating ${type}:`, error);
      toast({
        title: 'Error',
        description: error.message || `Failed to generate ${type}`,
        variant: 'destructive',
      });
    } finally {
      setGenerating(null);
    }
  };

  const seedGenerators = [
    {
      type: 'patients',
      label: 'Patients',
      icon: Users,
      generator: generateSeedPatients,
      description: 'Generate patient records',
    },
    {
      type: 'doctors',
      label: 'Doctors',
      icon: Stethoscope,
      generator: generateSeedDoctors,
      description: 'Generate doctor records',
    },
    {
      type: 'itineraries',
      label: 'Itineraries',
      icon: FileText,
      generator: generateSeedItineraries,
      description: 'Generate healthcare itineraries (requires patients)',
    },
    {
      type: 'appointments',
      label: 'Appointments',
      icon: Calendar,
      generator: generateSeedAppointments,
      description: 'Generate appointments (requires itineraries and doctors)',
    },
    {
      type: 'prescriptions',
      label: 'Prescriptions',
      icon: Pill,
      generator: generateSeedPrescriptions,
      description: 'Generate prescriptions (requires itineraries and doctors)',
    },
    {
      type: 'notes',
      label: 'Doctor Notes',
      icon: FileEdit,
      generator: generateSeedDoctorNotes,
      description: 'Generate doctor notes (requires appointments and itineraries)',
    },
    {
      type: 'invitations',
      label: 'Invitations',
      icon: Mail,
      generator: generateSeedInvitations,
      description: 'Generate itinerary invitations (requires itineraries)',
    },
    {
      type: 'itineraryShares',
      label: 'Itinerary Shares',
      icon: Share2,
      generator: generateSeedItineraryShares,
      description: 'Generate itinerary shares (requires itineraries)',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-6 flex gap-4">
          <Link to="/admin/notifications">
            <Button variant="outline">
              <Bell className="mr-2 h-4 w-4" />
              Notification Settings
            </Button>
          </Link>
        </div>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Seed Data Generation</CardTitle>
              <CardDescription>
                Generate seed data for testing. Data will be created using these user IDs as owners/maintainers:
                <div className="mt-2 text-xs font-mono bg-muted p-2 rounded">
                  {ADMIN_USER_IDS.join(', ')}
                </div>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {Object.entries(counts).map(([key, value]) => (
                    <div key={key}>
                      <Label htmlFor={key} className="capitalize">
                        {key}
                      </Label>
                      <Input
                        id={key}
                        type="number"
                        min="0"
                        value={value}
                        onChange={(e) =>
                          setCounts({ ...counts, [key]: parseInt(e.target.value) || 0 })
                        }
                        className="mt-1"
                      />
                    </div>
                  ))}
                </div>

                <Button
                  onClick={handleGenerateAll}
                  disabled={loading}
                  className="w-full"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <LoadingSpinner className="mr-2 h-4 w-4" />
                      Generating All...
                    </>
                  ) : (
                    <>
                      <Database className="mr-2 h-4 w-4" />
                      Generate All Seed Data
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                <CardTitle>Frequency Options</CardTitle>
              </div>
              <CardDescription>
                Initialize frequency options for prescriptions. These are reference data that only need to be set up once.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={handleInitializeFrequencyOptions}
                disabled={generating === 'frequencyOptions'}
                className="w-full"
                variant="outline"
              >
                {generating === 'frequencyOptions' ? (
                  <>
                    <LoadingSpinner className="mr-2 h-4 w-4" />
                    Initializing...
                  </>
                ) : (
                  <>
                    <Clock className="mr-2 h-4 w-4" />
                    Initialize Frequency Options
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {seedGenerators.map(({ type, label, icon: Icon, generator, description }) => (
              <Card key={type}>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Icon className="h-5 w-5" />
                    <CardTitle className="text-lg">{label}</CardTitle>
                  </div>
                  <CardDescription>{description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor={`${type}-count`}>Count</Label>
                      <Input
                        id={`${type}-count`}
                        type="number"
                        min="0"
                        value={counts[type] || 0}
                        onChange={(e) =>
                          setCounts({ ...counts, [type]: parseInt(e.target.value) || 0 })
                        }
                        className="mt-1"
                      />
                    </div>
                    <Button
                      onClick={() => handleGenerateIndividual(type, generator)}
                      disabled={generating === type}
                      className="w-full"
                      variant="outline"
                    >
                      {generating === type ? (
                        <>
                          <LoadingSpinner className="mr-2 h-4 w-4" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Play className="mr-2 h-4 w-4" />
                          Generate {label}
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

