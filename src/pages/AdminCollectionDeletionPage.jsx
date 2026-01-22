import { useState, useEffect } from 'react';
import { AppHeader } from '@/components/shared/AppHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { ErrorMessage } from '@/components/shared/ErrorMessage';
import { useToast } from '@/components/ui/use-toast';
import { deleteCollection, getCollectionCount, COLLECTIONS } from '@/services/admin';
import { Trash2, RefreshCw, AlertTriangle } from 'lucide-react';

export default function AdminCollectionDeletionPage() {
  // Pre-select all collections except users, specialties, and frequencyOptions
  const excludedCollections = ['users', 'specialties', 'frequencyOptions'];
  const initialSelected = new Set(
    COLLECTIONS.filter(col => !excludedCollections.includes(col))
  );
  const [selectedCollections, setSelectedCollections] = useState(initialSelected);
  const [collectionCounts, setCollectionCounts] = useState({});
  const [loading, setLoading] = useState(false);
  const [loadingCounts, setLoadingCounts] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { toast } = useToast();

  const loadCounts = async () => {
    setLoadingCounts(true);
    try {
      const counts = {};
      for (const collectionName of COLLECTIONS) {
        try {
          counts[collectionName] = await getCollectionCount(collectionName);
        } catch (error) {
          console.error(`Error loading count for ${collectionName}:`, error);
          counts[collectionName] = 'Error';
        }
      }
      setCollectionCounts(counts);
    } catch (error) {
      console.error('Error loading counts:', error);
      toast({
        title: 'Warning',
        description: 'Some collection counts could not be loaded due to permissions',
        variant: 'destructive',
      });
    } finally {
      setLoadingCounts(false);
    }
  };

  const handleToggleCollection = (collectionName) => {
    const newSelected = new Set(selectedCollections);
    if (newSelected.has(collectionName)) {
      newSelected.delete(collectionName);
    } else {
      newSelected.add(collectionName);
    }
    setSelectedCollections(newSelected);
  };

  const handleDeleteSelected = async () => {
    if (selectedCollections.size === 0) {
      toast({
        title: 'No Selection',
        description: 'Please select at least one collection to delete',
        variant: 'destructive',
      });
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete ${selectedCollections.size} collection(s)? This action cannot be undone!`
    );

    if (!confirmed) return;

    setDeleting(true);
    const results = [];

    try {
      for (const collectionName of selectedCollections) {
        try {
          const result = await deleteCollection(collectionName);
          results.push({ collection: collectionName, ...result });
        } catch (error) {
          console.error(`Error deleting ${collectionName}:`, error);
          results.push({
            collection: collectionName,
            success: false,
            error: error.message,
          });
        }
      }

      // Refresh counts
      await loadCounts();

      // Show results
      const successCount = results.filter((r) => r.success).length;
      const failCount = results.length - successCount;

      if (failCount === 0) {
        toast({
          title: 'Success',
          description: `Successfully deleted ${successCount} collection(s)`,
        });
      } else {
        toast({
          title: 'Partial Success',
          description: `Deleted ${successCount} collection(s), ${failCount} failed`,
          variant: 'destructive',
        });
      }

      setSelectedCollections(new Set());
    } catch (error) {
      console.error('Error during deletion:', error);
      toast({
        title: 'Error',
        description: 'An error occurred during deletion',
        variant: 'destructive',
      });
    } finally {
      setDeleting(false);
    }
  };

  // Load counts on mount
  useEffect(() => {
    loadCounts();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <AppHeader title="Admin - Collection Deletion" />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Collection Deletion</CardTitle>
                <CardDescription>
                  Select collections to delete. This will permanently remove all documents from the selected collections.
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={loadCounts}
                disabled={loadingCounts}
              >
                <RefreshCw className={`h-4 w-4 ${loadingCounts ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-2 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  <strong>Warning:</strong> This action cannot be undone. All documents in the selected collections will be permanently deleted.
                </p>
              </div>

              <div className="space-y-2">
                {COLLECTIONS.map((collectionName) => {
                  const isSelected = selectedCollections.has(collectionName);
                  const count = collectionCounts[collectionName] ?? '...';

                  return (
                    <div
                      key={collectionName}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => handleToggleCollection(collectionName)}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleCollection(collectionName)}
                          className="h-4 w-4"
                        />
                        <div>
                          <div className="font-medium">{collectionName}</div>
                          <div className="text-sm text-muted-foreground">
                            {loadingCounts ? 'Loading...' : `${count} document(s)`}
                          </div>
                        </div>
                      </div>
                      {isSelected && (
                        <Trash2 className="h-5 w-5 text-destructive" />
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  variant="destructive"
                  onClick={handleDeleteSelected}
                  disabled={selectedCollections.size === 0 || deleting}
                  className="flex-1"
                >
                  {deleting ? (
                    <>
                      <LoadingSpinner className="mr-2 h-4 w-4" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Selected ({selectedCollections.size})
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setSelectedCollections(new Set())}
                  disabled={selectedCollections.size === 0}
                >
                  Clear Selection
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

