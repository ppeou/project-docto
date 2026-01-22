import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useItineraries } from '@/hooks/useItineraries';
import { useAuth } from '@/hooks/useAuth';
import { useItineraryCounts } from '@/hooks/useItineraryCounts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { EmptyState } from '@/components/shared/EmptyState';
import { Plus, Search, FilePlusCorner } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { AppHeader } from '@/components/shared/AppHeader';

export default function ItinerariesPage() {
  const { itineraries, loading: itinerariesLoading } = useItineraries();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  // Get all itinerary IDs the user has access to
  const itineraryIds = useMemo(() => {
    return itineraries.map(it => it.id);
  }, [itineraries]);

  // Get counts for all itineraries
  const { counts: itineraryCounts, loading: countsLoading } = useItineraryCounts(itineraryIds);

  const loading = itinerariesLoading || countsLoading;

  const filteredItineraries = itineraries.filter((itinerary) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      itinerary.name?.toLowerCase().includes(query) ||
      itinerary.patient?.name?.toLowerCase().includes(query)
    );
  });

  if (loading) {
    return (
      <div className="min-h-screen p-4">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader title="Itineraries" />
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Healthcare Itineraries</h1>
          <Link to="/itineraries/create">
            <Button size="icon" title="New Itinerary">
              <FilePlusCorner className="h-5 w-5" />
            </Button>
          </Link>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search itineraries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {filteredItineraries.length === 0 ? (
          <EmptyState
            title={searchQuery ? 'No matching itineraries' : 'No itineraries yet'}
            description={
              searchQuery
                ? 'Try a different search term'
                : 'Create your first healthcare itinerary to get started'
            }
            action={
              !searchQuery && (
                <Link to="/itineraries/create">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Itinerary
                  </Button>
                </Link>
              )
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredItineraries.map((itinerary) => {
              const isOwner = itinerary.ownerId && user?.uid === itinerary.ownerId;
              const isMember = Array.isArray(itinerary.memberIds) && itinerary.memberIds.includes(user?.uid);

              return (
                <Link key={itinerary.id} to={`/itineraries/${itinerary.id}`}>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                    <CardHeader>
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <CardTitle className="text-lg">{itinerary.name}</CardTitle>
                          <CardDescription>
                            {itinerary.patient?.name} ({itinerary.patient?.relation})
                          </CardDescription>
                        </div>
                        {user && (
                          <Badge variant="outline">
                            {isOwner ? 'Owner' : isMember ? 'Shared' : 'Itinerary'}
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      {itinerary.startDate && (
                        <p className="text-sm text-muted-foreground mb-2">
                          {formatDate(itinerary.startDate)}
                          {itinerary.endDate && ` - ${formatDate(itinerary.endDate)}`}
                        </p>
                      )}
                      <div className="flex gap-2">
                        <Badge variant="secondary">
                          {itineraryCounts[itinerary.id]?.appointments || 0} appointment{(itineraryCounts[itinerary.id]?.appointments || 0) !== 1 ? 's' : ''}
                        </Badge>
                        <Badge variant="secondary">
                          {itineraryCounts[itinerary.id]?.prescriptions || 0} prescription{(itineraryCounts[itinerary.id]?.prescriptions || 0) !== 1 ? 's' : ''}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

