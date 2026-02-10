import { Link } from 'react-router-dom';
import { useItineraries } from '@/hooks/useItineraries';
import { useItineraryCounts } from '@/hooks/useItineraryCounts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { EmptyState } from '@/components/shared/EmptyState';
import { Plus, Calendar, Pill, Users, FilePlusCorner } from 'lucide-react';
import { formatDate } from '@core/utils';

export default function DashboardPage() {
  const { itineraries, loading } = useItineraries();
  const itineraryIds = itineraries.map((it) => it.id);
  const { counts, loading: countsLoading } = useItineraryCounts(itineraryIds);

  if (loading || countsLoading) {
    return (
      <div className="min-h-screen p-4 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  const totalAppointments = Object.values(counts).reduce((sum, c) => sum + (c?.appointments ?? 0), 0);
  const totalPrescriptions = Object.values(counts).reduce((sum, c) => sum + (c?.prescriptions ?? 0), 0);

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Itineraries</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{itineraries.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Appointments</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalAppointments}</div>
              <p className="text-xs text-muted-foreground">Across all itineraries</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Prescriptions</CardTitle>
              <Pill className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalPrescriptions}</div>
              <p className="text-xs text-muted-foreground">Across all itineraries</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Healthcare Itineraries</CardTitle>
                <CardDescription>Manage your family&apos;s healthcare plans</CardDescription>
              </div>
              <Link to="/itineraries/create">
                <Button size="icon" title="New Itinerary">
                  <FilePlusCorner className="h-5 w-5" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {itineraries.length === 0 ? (
              <EmptyState
                title="No itineraries yet"
                description="Create your first healthcare itinerary to get started"
                action={
                  <Link to="/itineraries/create">
                    <Button><Plus className="mr-2 h-4 w-4" />Create Itinerary</Button>
                  </Link>
                }
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {itineraries.map((it) => (
                  <Link key={it.id} to={`/itineraries/${it.id}`}>
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                      <CardHeader>
                        <CardTitle className="text-lg">{it.name}</CardTitle>
                        <CardDescription>
                          {it.patient?.name} ({it.patient?.relation})
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {it.startDate && (
                          <p className="text-sm text-muted-foreground mb-2">
                            {formatDate(it.startDate)}
                            {it.endDate && ` – ${formatDate(it.endDate)}`}
                          </p>
                        )}
                        <div className="flex gap-2">
                          <Badge variant="secondary">{counts[it.id]?.appointments ?? 0} appointments</Badge>
                          <Badge variant="secondary">{counts[it.id]?.prescriptions ?? 0} prescriptions</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
