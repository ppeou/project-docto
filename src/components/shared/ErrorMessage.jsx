import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export function ErrorMessage({ error, onRetry, className }) {
  return (
    <Card className={`p-6 text-center ${className || ''}`}>
      <AlertCircle className="mx-auto h-12 w-12 text-destructive mb-4" />
      <h3 className="text-lg font-semibold mb-2">Something went wrong</h3>
      <p className="text-muted-foreground mb-4">{error?.message || 'An unexpected error occurred'}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline">
          Try Again
        </Button>
      )}
    </Card>
  );
}

