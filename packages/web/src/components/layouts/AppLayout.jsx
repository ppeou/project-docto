import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Settings, LogOut, User, Stethoscope, Calendar, FileText, Logs, Home } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '@core/services/firebase';
import { store } from '@core/store';
import { logout } from '@core/stores/authStore';
import { ADMIN_USER_IDS } from '@/services/admin';
import Avatar from '../ui/Avatar';
import Logo from '../ui/Logo';
import { cn } from '@core/utils';
import './AppLayout.scss';

const AppLayout = () => {
  const user = useSelector((state) => state.auth.user);
  const navigate = useNavigate();
  const location = useLocation();

  const isAdmin = user && ADMIN_USER_IDS.includes(user.uid);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      store.dispatch(logout());
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/itineraries', icon: FileText, label: 'Itineraries' },
    { path: '/patients', icon: User, label: 'Patients' },
    { path: '/doctors', icon: Stethoscope, label: 'Doctors' },
    { path: '/calendar', icon: Calendar, label: 'Calendar' },
  ];

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="app-layout">
      <main id="main-content" className="app-layout__main" role="main">
        <Outlet />
      </main>
      <nav
        className="app-layout__nav"
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="app-layout__nav-content">
          <div className="app-layout__logo">
            <Link to="/">
              <Logo size="default" showText={false} />
            </Link>
          </div>
          <div className="app-layout__tabs">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    'app-layout__tab',
                    active && 'app-layout__tab--active'
                  )}
                  aria-label={item.label}
                  title={item.label}
                >
                  <Icon className="h-5 w-5" />
                  <span className="app-layout__tab-label">{item.label}</span>
                </Link>
              );
            })}
          </div>
          <div className="app-layout__user-menu">
            {user && (
              <div className="app-layout__user-menu-container">
                <button
                  className="app-layout__user-button"
                  aria-label="User menu"
                  aria-expanded="false"
                  aria-haspopup="true"
                  title={user.displayName || user.email || 'User'}
                >
                  <Avatar
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    fallback={user.displayName || user.email}
                    size="sm"
                  />
                </button>
                <div className="app-layout__user-dropdown" role="menu">
                  <button
                    className="app-layout__user-menu-item"
                    onClick={() => navigate('/settings')}
                    role="menuitem"
                    aria-label="Settings"
                  >
                    <Settings className="h-4 w-4" />
                    Settings
                  </button>
                  {isAdmin && (
                    <button
                      className="app-layout__user-menu-item"
                      onClick={() => navigate('/specialties')}
                      role="menuitem"
                      aria-label="Specialties"
                    >
                      <Logs className="h-4 w-4" />
                      Specialties
                    </button>
                  )}
                  <button
                    className="app-layout__user-menu-item"
                    onClick={handleSignOut}
                    role="menuitem"
                    aria-label="Sign out"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>
    </div>
  );
};

export default AppLayout;
