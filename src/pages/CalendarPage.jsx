import { useState } from 'react';
import { useItineraries } from '@/hooks/useItineraries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { AppHeader } from '@/components/shared/AppHeader';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';

export default function CalendarPage() {
  const { itineraries, loading } = useItineraries();
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [selectedItineraryId, setSelectedItineraryId] = useState('all');

  // This is a simplified calendar - in production, you'd want a proper calendar component
  const currentMonth = selectedMonth.toLocaleString('default', { month: 'long', year: 'numeric' });

  if (loading) {
    return (
      <div className="min-h-screen p-4">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <AppHeader title="Calendar" />
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Calendar</h1>
          <div className="flex gap-4 items-center">
            <Select value={selectedItineraryId} onValueChange={setSelectedItineraryId}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by itinerary" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Itineraries</SelectItem>
                {itineraries.map((itinerary) => (
                  <SelectItem key={itinerary.id} value={itinerary.id}>
                    {itinerary.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() - 1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="font-medium min-w-[150px] text-center">{currentMonth}</span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Monthly View</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <CalendarIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">
                Calendar view is a simplified implementation. 
                Full calendar component would be integrated here.
              </p>
              <p className="text-sm text-muted-foreground">
                Navigate to individual itineraries to see appointment lists and details.
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

