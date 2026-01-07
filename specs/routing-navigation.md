# Routing & Navigation - Project Docto

## Route Structure

```
/ (Dashboard)
├── /auth
│   ├── /login
│   └── /signup
├── /itineraries
│   ├── /create
│   ├── /:id
│   │   ├── /edit
│   │   └── /share
│   └── (list view - default)
├── /appointments
│   ├── /create
│   └── /:id
├── /prescriptions
│   ├── /create
│   └── /:id
├── /calendar
└── /settings
    ├── /profile
    └── /preferences
```

## Route Definitions

### Public Routes
```javascript
/auth/login          // Login page
/auth/signup         // Signup page
```

### Protected Routes (Require Authentication)
```javascript
/                    // Dashboard (default)
/itineraries         // Itineraries list
/itineraries/create  // Create new itinerary
/itineraries/:id     // Itinerary detail
/itineraries/:id/edit // Edit itinerary
/itineraries/:id/share // Share itinerary
/appointments/create  // Create appointment (with itinerary context)
/appointments/:id     // Appointment detail
/prescriptions/create // Create prescription (with itinerary context)
/prescriptions/:id    // Prescription detail
/calendar            // Calendar view
/settings            // Settings page
/settings/profile    // User profile settings
/settings/preferences // User preferences
```

## Navigation Patterns

### 1. Header Navigation
**Desktop**:
- Logo/App Name (links to dashboard)
- Main nav links (Itineraries, Calendar)
- User menu (avatar dropdown)

**Mobile**:
- Back button (context-aware)
- Page title
- User menu icon

### 2. Bottom Navigation (Mobile Only)
**Visible on**: Mobile devices
**Items**:
1. Dashboard (home icon)
2. Itineraries (list icon)
3. Calendar (calendar icon)
4. Settings (gear icon)

**Implementation**:
- Fixed position at bottom
- Active state indicator
- Hide on auth pages

### 3. Breadcrumb Navigation (Desktop)
**Use for**: Deep navigation (detail pages)
**Example**:
```
Dashboard > Itineraries > Mom's Healthcare > Appointments > Annual Checkup
```

### 4. Tab Navigation
**Use for**: Different views of same data
**Example**: Itinerary detail tabs
- Appointments
- Prescriptions
- Notes

## Route Guards

### Authentication Guard
```javascript
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  
  if (loading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/auth/login" />;
  
  return children;
}
```

### Redirect Rules
- Unauthenticated user accessing protected route → `/auth/login`
- Authenticated user accessing auth pages → `/` (dashboard)
- Invalid route → 404 page → redirect to dashboard

## URL Patterns

### Query Parameters
```javascript
/itineraries?filter=active              // Filter itineraries
/itineraries?patient=mother             // Filter by patient relation
/calendar?view=week&itinerary=123       // Calendar view options
```

### Hash Parameters (for deep linking)
```javascript
/itineraries/123#appointments           // Scroll to appointments tab
/itineraries/123#prescription-456       // Scroll to specific prescription
```

## Navigation Hooks

### useNavigation Hook
```javascript
// hooks/useNavigation.js
export function useNavigation() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const goToItinerary = (id) => navigate(`/itineraries/${id}`);
  const goToAppointment = (id) => navigate(`/appointments/${id}`);
  const goBack = () => navigate(-1);
  const goHome = () => navigate('/');
  
  return {
    navigate,
    location,
    goToItinerary,
    goToAppointment,
    goBack,
    goHome,
  };
}
```

### useRouteContext Hook
```javascript
// hooks/useRouteContext.js
export function useRouteContext() {
  const { id } = useParams();
  const location = useLocation();
  
  // Extract context from route
  const isCreating = location.pathname.includes('/create');
  const isEditing = location.pathname.includes('/edit');
  const itineraryId = location.state?.itineraryId || 
                      new URLSearchParams(location.search).get('itineraryId');
  
  return {
    id,
    isCreating,
    isEditing,
    itineraryId,
  };
}
```

## Deep Linking

### Shareable URLs
- Itinerary: `/itineraries/:id`
- Appointment: `/appointments/:id`
- Prescription: `/prescriptions/:id`

### Link Generation
```javascript
function getShareableUrl(type, id) {
  const baseUrl = window.location.origin;
  return `${baseUrl}/${type}/${id}`;
}
```

## Navigation State

### Route State (React Router)
```javascript
// Navigate with state
navigate('/itineraries/create', {
  state: { itineraryId: '123' }
});

// Access state
const location = useLocation();
const itineraryId = location.state?.itineraryId;
```

### URL State (Query Params)
```javascript
// Set query params
const navigate = useNavigate();
navigate('/itineraries', { search: '?filter=active' });

// Read query params
const [searchParams] = useSearchParams();
const filter = searchParams.get('filter');
```

### Persistent State (Zustand)
```javascript
// Store navigation-related state
const useNavStore = create((set) => ({
  lastVisitedItinerary: null,
  setLastVisited: (id) => set({ lastVisitedItinerary: id }),
}));
```

## Mobile Navigation Patterns

### 1. Stack Navigation
**Pattern**: Push/pop navigation stack
**Implementation**: React Router's history stack
```javascript
// Navigate forward
navigate('/itineraries/123');

// Go back
navigate(-1);
```

### 2. Bottom Sheet Navigation
**Pattern**: Slide-up sheets for actions
**Implementation**: Modal/Drawer components
```javascript
<Drawer open={isOpen} onClose={close}>
  <ActionSheet>
    <ActionItem onClick={onEdit}>Edit</ActionItem>
    <ActionItem onClick={onShare}>Share</ActionItem>
    <ActionItem onClick={onDelete} destructive>Delete</ActionItem>
  </ActionSheet>
</Drawer>
```

### 3. Tab Navigation
**Pattern**: Switch between views
**Implementation**: Tab components
```javascript
<Tabs value={activeTab} onValueChange={setActiveTab}>
  <Tab value="appointments">Appointments</Tab>
  <Tab value="prescriptions">Prescriptions</Tab>
  <Tab value="notes">Notes</Tab>
</Tabs>
```

## Navigation Best Practices

### 1. Clear Navigation Paths
- Always provide back button on detail pages
- Breadcrumbs on desktop
- Clear page titles

### 2. Context Preservation
- Maintain scroll position when possible
- Remember selected filters
- Preserve form state (if user navigates away)

### 3. Loading States
- Show loading during route transitions
- Use Suspense boundaries
- Skeleton loaders for data fetching

### 4. Error Handling
- 404 page for invalid routes
- Error boundary for route errors
- Redirect on permission errors

### 5. Performance
- Lazy load routes
- Prefetch on hover (desktop)
- Cache route data

## Route Component Structure

### Page Component Template
```javascript
// pages/ItineraryDetailPage.jsx
import { useParams, useNavigate } from 'react-router-dom';
import { useItinerary } from '@/hooks/useItinerary';
import { PageLayout } from '@/components/layout/PageLayout';
import { ItineraryDetail } from '@/components/features/ItineraryDetail';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';

export function ItineraryDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: itinerary, isLoading, error } = useItinerary(id);
  
  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  if (!itinerary) return <Navigate to="/itineraries" />;
  
  return (
    <PageLayout>
      <ItineraryDetail 
        itinerary={itinerary}
        onEdit={() => navigate(`/itineraries/${id}/edit`)}
        onBack={() => navigate('/itineraries')}
      />
    </PageLayout>
  );
}
```

## Navigation Accessibility

### Keyboard Navigation
- Tab through interactive elements
- Enter/Space to activate
- Escape to close modals
- Arrow keys for navigation (where appropriate)

### Screen Reader Support
- Clear page titles
- ARIA landmarks
- Skip links
- Focus management

### Mobile Gestures
- Swipe back (iOS)
- Pull to refresh (where appropriate)
- Swipe to delete (list items)

