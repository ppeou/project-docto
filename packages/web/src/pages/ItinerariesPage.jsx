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
import { PageLayout } from '@/components/layouts/PageLayout';
import { Plus, Search, FilePlusCorner } from 'lucide-react';
import { formatDate } from '@core/utils';

export default function ItinerariesPage() {
  const { itineraries, loading: itinerariesLoading } = useItineraries();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const itineraryIds = useMemo(() => itineraries.map((it) => it.id), [itineraries]);
  const { counts, loading: countsLoading } = useItineraryCounts(itineraryIds);
  const loading = itinerariesLoading || countsLoading;

  const filtered = itineraries.filter((it) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return it.name?.toLowerCase().includes(q) || it.patient?.name?.toLowerCase().includes(q);
  });

  if (loading) {
    return (
      <div className="min-h-screen p-4 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <PageLayout
      title="Healthcare Itineraries"
      actions={
        <Link to="/itineraries/create">
          <Button size="icon" title="New Itinerary">
            <FilePlusCorner className="h-5 w-5" />
          </Button>
        </Link>
      }
    >
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search itineraries..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title={searchQuery ? 'No matching itineraries' : 'No itineraries yet'}
          description={searchQuery ? 'Try a different search term' : 'Create your first healthcare itinerary to get started'}
          action={
            !searchQuery && (
              <Link to="/itineraries/create">
                <Button><Plus className="mr-2 h-4 w-4" />Create Itinerary</Button>
              </Link>
            )
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((it) => {
            const isOwner = it.ownerId && user?.uid === it.ownerId;
            const isMember = Array.isArray(it.memberIds) && it.memberIds.includes(user?.uid);
            const c = counts[it.id];
            return (
              <Link key={it.id} to={`/itineraries/${it.id}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <CardHeader>
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <CardTitle className="text-lg">{it.name}</CardTitle>
                        <CardDescription>{it.patient?.name} ({it.patient?.relation})</CardDescription>
                      </div>
                      {user && (
                        <Badge variant="outline">{isOwner ? 'Owner' : isMember ? 'Shared' : 'Itinerary'}</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {it.startDate && (
                      <p className="text-sm text-muted-foreground mb-2">
                        {formatDate(it.startDate)}
                        {it.endDate && ` – ${formatDate(it.endDate)}`}
                      </p>
                    )}
                    <div className="flex gap-2">
                      <Badge variant="secondary">{c?.appointments ?? 0} appointments</Badge>
                      <Badge variant="secondary">{c?.prescriptions ?? 0} prescriptions</Badge>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </PageLayout>
  );
}
