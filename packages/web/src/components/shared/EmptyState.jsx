import { FileQuestion } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export function EmptyState({ title, description, action, className }) {
  return (
    <Card className={`p-12 text-center ${className || ''}`}>
      <FileQuestion className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
      <h3 className="text-xl font-semibold mb-2">{title || 'No items yet'}</h3>
      {description && (
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">{description}</p>
      )}
      {action && action}
    </Card>
  );
}

