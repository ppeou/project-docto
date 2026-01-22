import { useState } from 'react';
import { collection, doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '@core/services/firebase';
import { useFrequencyOptions } from '@/hooks/useFrequencyOptions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { useToast } from '@/components/ui/use-toast';
import { CheckCircle2, AlertCircle, Loader2, Database } from 'lucide-react';

const FREQUENCY_OPTIONS = [
  // Hourly intervals
  { label: "Every 4 hours", intervalValue: 4, intervalUnit: "hour", displayOrder: 1 },
  { label: "Every 6 hours", intervalValue: 6, intervalUnit: "hour", displayOrder: 2 },
  { label: "Every 8 hours", intervalValue: 8, intervalUnit: "hour", displayOrder: 3 },
  { label: "Every 12 hours", intervalValue: 12, intervalUnit: "hour", displayOrder: 4 },
  
  // Multiple times per day
  { label: "4 times per day", intervalValue: 6, intervalUnit: "hour", displayOrder: 5 },
  { label: "3 times per day", intervalValue: 8, intervalUnit: "hour", displayOrder: 6 },
  { label: "2 times per day", intervalValue: 12, intervalUnit: "hour", displayOrder: 7 },
  
  // Daily
  { label: "Once daily", intervalValue: 1, intervalUnit: "day", displayOrder: 8 },
  { label: "Once per day", intervalValue: 1, intervalUnit: "day", displayOrder: 9 },
  
  // Weekly
  { label: "Once per week", intervalValue: 7, intervalUnit: "day", displayOrder: 10 },
  { label: "Twice per week", intervalValue: 3.5, intervalUnit: "day", displayOrder: 11 },
  { label: "Every 2 weeks", intervalValue: 14, intervalUnit: "day", displayOrder: 12 },
  
  // Monthly
  { label: "Once per month", intervalValue: 1, intervalUnit: "month", displayOrder: 13 },
  { label: "Every 2 months", intervalValue: 2, intervalUnit: "month", displayOrder: 14 },
  
  // As needed - using 0 as intervalValue since schema requires a number
  { label: "As needed", intervalValue: 0, intervalUnit: "as_needed", displayOrder: 15 },
];

export default function InitializeFrequencyOptionsPage() {
  const { frequencyOptions, loading } = useFrequencyOptions();
  const { toast } = useToast();
  const [isInitializing, setIsInitializing] = useState(false);
  const [results, setResults] = useState({ added: 0, skipped: 0, errors: [] });

  const handleInitialize = async () => {
    // Wait for auth to be ready
    await new Promise((resolve) => {
      const unsubscribe = auth.onAuthStateChanged((user) => {
        unsubscribe();
        resolve(user);
      });
    });

    const user = auth.currentUser;
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'You must be logged in to initialize frequency options',
      });
      return;
    }

    console.log('User authenticated:', user.uid);

    if (!confirm(`This will initialize ${FREQUENCY_OPTIONS.length} frequency options. Continue?`)) {
      return;
    }

    setIsInitializing(true);
    setResults({ added: 0, skipped: 0, errors: [] });

    let added = 0;
    let skipped = 0;
    const errors = [];

    for (const option of FREQUENCY_OPTIONS) {
      try {
        // Verify user is still authenticated before each request
        if (!auth.currentUser) {
          throw new Error('User authentication lost');
        }

        // Create a document ID from the label
        const docId = option.label.toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^a-z0-9-]/g, '');
        
        const docRef = doc(collection(db, 'frequencyOptions'), docId);
        const docSnap = await getDoc(docRef);
        
        if (!docSnap.exists()) {
          // Explicitly structure the data according to schema
          // All fields are required: label, intervalValue (number), intervalUnit, displayOrder
          const docData = {
            label: option.label,
            intervalValue: option.intervalValue, // Must be a number (minimum 0)
            intervalUnit: option.intervalUnit,
            displayOrder: option.displayOrder,
            isActive: true,
            created: {
              by: user.uid,
              on: serverTimestamp(),
            },
            updated: {
              by: user.uid,
              on: serverTimestamp(),
            },
          };
          
          console.log('Creating frequency option:', docId, docData);
          await setDoc(docRef, docData);
          added++;
        } else {
          skipped++;
        }
      } catch (error) {
        errors.push({ label: option.label, error: error.message });
        console.error(`Error adding ${option.label}:`, error);
      }
    }

    setResults({ added, skipped, errors });
    setIsInitializing(false);

    if (errors.length === 0) {
      toast({
        title: 'Success',
        description: `Initialized ${added} frequency options. ${skipped} already existed.`,
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Partial Success',
        description: `Added ${added}, skipped ${skipped}, ${errors.length} errors occurred.`,
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen p-4">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Frequency Options Initialization
            </CardTitle>
            <CardDescription>
              Initialize the default frequency options used for prescriptions. 
              This operation will only add options that don't already exist.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Current options in database: <strong>{frequencyOptions.length}</strong>
                </p>
                <p className="text-sm text-muted-foreground">
                  Options to initialize: <strong>{FREQUENCY_OPTIONS.length}</strong>
                </p>
              </div>
              <Button
                onClick={handleInitialize}
                disabled={isInitializing}
                size="lg"
              >
                {isInitializing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Initializing...
                  </>
                ) : (
                  <>
                    <Database className="mr-2 h-4 w-4" />
                    Initialize Frequency Options
                  </>
                )}
              </Button>
            </div>

            {results.added > 0 || results.skipped > 0 || results.errors.length > 0 ? (
              <div className="mt-4 p-4 bg-muted rounded-lg space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span>Added: {results.added}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                  <span>Skipped (already exists): {results.skipped}</span>
                </div>
                {results.errors.length > 0 && (
                  <div className="flex items-start gap-2 text-sm text-destructive">
                    <AlertCircle className="h-4 w-4 mt-0.5" />
                    <div>
                      <span className="font-medium">Errors: {results.errors.length}</span>
                      <ul className="list-disc list-inside mt-1 ml-2">
                        {results.errors.map((err, idx) => (
                          <li key={idx}>
                            {err.label}: {err.error}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Frequency Options List</CardTitle>
            <CardDescription>
              All frequency options that will be initialized
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {FREQUENCY_OPTIONS.map((option, idx) => {
                const exists = frequencyOptions.some(
                  fo => fo.label === option.label
                );
                return (
                  <div
                    key={idx}
                    className={`flex items-center justify-between p-3 rounded border ${
                      exists ? 'bg-green-50 border-green-200' : 'bg-muted'
                    }`}
                  >
                    <div>
                      <p className="font-medium">{option.label}</p>
                      <p className="text-xs text-muted-foreground">
                        {option.intervalUnit === "as_needed" 
                          ? "As needed" 
                          : `${option.intervalValue} ${option.intervalUnit}`}
                      </p>
                    </div>
                    {exists && (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

