import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useItineraries } from '@/hooks/useItineraries';
import { signOut } from '@/services/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { EmptyState } from '@/components/shared/EmptyState';
import { Plus, Calendar, Pill, Users } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default function DashboardPage() {
  const { user, userProfile } = useAuth();
  const { itineraries, loading } = useItineraries();

  const handleSignOut = async () => {
    await signOut();
  };

  if (loading) {
    return (
      <div className="min-h-screen p-4">
        <LoadingSpinner />
      </div>
    );
  }

  const initials = userProfile?.displayName
    ? userProfile.displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.[0].toUpperCase() || 'U';

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Project Docto
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:inline">
              {user?.email}
            </span>
            <Avatar>
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <Button variant="outline" onClick={handleSignOut}>
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
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
              <CardTitle className="text-sm font-medium">Upcoming Appointments</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">Next 7 days</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Refills Needed</CardTitle>
              <Pill className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">Next 14 days</p>
            </CardContent>
          </Card>
        </div>

        {/* Itineraries Section */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Healthcare Itineraries</CardTitle>
                <CardDescription>Manage your family's healthcare plans</CardDescription>
              </div>
              <Link to="/itineraries/create">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  New Itinerary
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
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Itinerary
                    </Button>
                  </Link>
                }
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {itineraries.map((itinerary) => (
                  <Link key={itinerary.id} to={`/itineraries/${itinerary.id}`}>
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                      <CardHeader>
                        <CardTitle className="text-lg">{itinerary.name}</CardTitle>
                        <CardDescription>
                          {itinerary.patient?.name} ({itinerary.patient?.relation})
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {itinerary.startDate && (
                          <p className="text-sm text-muted-foreground mb-2">
                            {formatDate(itinerary.startDate)}
                            {itinerary.endDate && ` - ${formatDate(itinerary.endDate)}`}
                          </p>
                        )}
                        <div className="flex gap-2">
                          <Badge variant="secondary">0 appointments</Badge>
                          <Badge variant="secondary">0 prescriptions</Badge>
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

