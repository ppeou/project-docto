import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { signOut } from '@/services/auth';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { User, Stethoscope, Calendar, List, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

export function AppHeader({ title }) {
  const { user, userProfile } = useAuth();
  const location = useLocation();

  const initials = userProfile?.displayName
    ? userProfile.displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.[0].toUpperCase() || 'U';

  const handleSignOut = async () => {
    await signOut();
  };

  const navItems = [
    { path: '/', icon: List, label: 'Dashboard' },
    { path: '/itineraries', icon: FileText, label: 'Itineraries' },
    { path: '/patients', icon: User, label: 'Patients' },
    { path: '/doctors', icon: Stethoscope, label: 'Doctors' },
    { path: '/calendar', icon: Calendar, label: 'Calendar' },
  ];

  return (
    <header className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 sticky top-0 z-10">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center gap-6">
          <Link to="/">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              {title || 'Project Docto'}
            </h1>
          </Link>
          <nav className="hidden md:flex items-center gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.path === '/' 
                ? location.pathname === '/'
                : location.pathname.startsWith(item.path);
              return (
                <Link key={item.path} to={item.path}>
                  <Button
                    variant={isActive ? 'default' : 'ghost'}
                    size="icon"
                    className={cn(
                      'h-10 w-10',
                      isActive && 'bg-[#74C947] hover:bg-[#66b83d] text-white'
                    )}
                    title={item.label}
                  >
                    <Icon className="h-5 w-5" />
                  </Button>
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground hidden sm:inline">
            {user?.email}
          </span>
          <Link to="/settings" className="cursor-pointer">
            <Avatar className="cursor-pointer hover:opacity-80 transition-opacity">
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
          </Link>
          <Button variant="outline" onClick={handleSignOut}>
            Sign Out
          </Button>
        </div>
      </div>
    </header>
  );
}

