import { useState } from 'react';
import { collection, doc, setDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useSpecialties } from '@/hooks/useSpecialties';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { EmptyState } from '@/components/shared/EmptyState';
import { useToast } from '@/components/ui/use-toast';
import { AppHeader } from '@/components/shared/AppHeader';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';

export default function SpecialtiesPage() {
  const { specialties, loading } = useSpecialties();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [editingSpecialty, setEditingSpecialty] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [specialtyName, setSpecialtyName] = useState('');

  const filteredSpecialties = specialties.filter((specialty) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return specialty.name?.toLowerCase().includes(query);
  });

  const resetForm = () => {
    setSpecialtyName('');
    setEditingSpecialty(null);
  };

  const handleEdit = (specialty) => {
    setEditingSpecialty(specialty);
    setSpecialtyName(specialty.name);
    setIsDialogOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!specialtyName.trim()) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Specialty name is required',
      });
      return;
    }

    try {
      const docId = specialtyName.toLowerCase().replace(/\s+/g, '-');
      const docRef = doc(collection(db, 'specialties'), docId);

      if (editingSpecialty) {
        // Update existing
        await setDoc(docRef, {
          name: specialtyName,
          createdAt: editingSpecialty.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }, { merge: true });
        toast({
          title: 'Success',
          description: 'Specialty updated successfully',
        });
      } else {
        // Check if already exists
        const existingDoc = await getDoc(docRef);
        if (existingDoc.exists()) {
          toast({
            variant: 'destructive',
            title: 'Error',
            description: 'A specialty with this name already exists',
          });
          return;
        }

        // Create new
        await setDoc(docRef, {
          name: specialtyName,
          createdAt: new Date().toISOString(),
        });
        toast({
          title: 'Success',
          description: 'Specialty created successfully',
        });
      }

      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to save specialty',
      });
    }
  };

  const handleDelete = async (specialty) => {
    if (!confirm(`Are you sure you want to delete "${specialty.name}"?`)) return;

    try {
      await deleteDoc(doc(db, 'specialties', specialty.id));
      toast({
        title: 'Success',
        description: 'Specialty deleted successfully',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to delete specialty',
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
      <AppHeader title="Specialties" />

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex justify-between items-center mb-6">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search specialties..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button onClick={() => resetForm()}>
                <Plus className="mr-2 h-4 w-4" />
                Add Specialty
              </Button>
            </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingSpecialty ? 'Edit Specialty' : 'Add Specialty'}</DialogTitle>
                  <DialogDescription>
                    {editingSpecialty ? 'Update specialty name' : 'Add a new medical specialty'}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSave} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="specialtyName">Specialty Name *</Label>
                    <Input
                      id="specialtyName"
                      value={specialtyName}
                      onChange={(e) => setSpecialtyName(e.target.value)}
                      placeholder="e.g., Cardiology, General Practice"
                      required
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Save</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
        </div>

        {filteredSpecialties.length === 0 ? (
          <EmptyState
            title={searchQuery ? 'No matching specialties' : 'No specialties yet'}
            description={
              searchQuery
                ? 'Try a different search term'
                : 'Initialize common specialties or add your first specialty'
            }
          />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {filteredSpecialties.map((specialty) => (
              <Card key={specialty.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-3">
                  <div className="flex justify-between items-center gap-2">
                    <CardTitle className="text-sm font-medium truncate flex-1">
                      {specialty.name}
                    </CardTitle>
                    <div className="flex gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => handleEdit(specialty)}
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => handleDelete(specialty)}
                      >
                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

