import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

/**
 * Standard page shell: optional back link, title, and actions.
 * Keeps pages consistent (KISS).
 */
export function PageLayout({ backTo, title, actions, children, className = '' }) {
  return (
    <div className={`min-h-screen bg-background ${className}`}>
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {(backTo || title || actions) && (
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              {backTo && (
                <Link to={backTo}>
                  <Button variant="ghost" size="sm">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                </Link>
              )}
              {title && <h1 className="text-2xl font-bold">{title}</h1>}
            </div>
            {actions && <div className="flex items-center gap-2">{actions}</div>}
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
