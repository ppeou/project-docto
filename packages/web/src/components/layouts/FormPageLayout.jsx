import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';

/**
 * Layout for create/edit forms: back link, card with title + description, form content.
 * DRY for all form pages.
 */
export function FormPageLayout({
  backTo,
  title,
  description,
  children,
  maxWidth = 'max-w-2xl',
  className = '',
}) {
  return (
    <div className={`min-h-screen bg-background p-4 ${className}`}>
      <div className={`container mx-auto ${maxWidth}`}>
        {backTo && (
          <Link to={backTo} className="inline-block mb-4">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
        )}
        <Card>
          <CardHeader>
            <CardTitle>{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </CardHeader>
          <CardContent>{children}</CardContent>
        </Card>
      </div>
    </div>
  );
}
