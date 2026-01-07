# Component Architecture - Project Docto

## Architecture Principles

### Component Organization
```
src/
├── components/
│   ├── ui/              # Base UI components (shadcn/ui)
│   ├── forms/           # Form components (reusable)
│   ├── display/         # Display components
│   ├── layout/          # Layout components
│   ├── features/        # Feature-specific components
│   └── shared/          # Shared utilities/components
├── pages/               # Page components (route handlers)
├── hooks/               # Custom React hooks
├── lib/                 # Utilities and helpers
├── store/               # Zustand stores
└── services/            # API/Firebase services
```

## Component Patterns

### 1. Container/Presenter Pattern (Where Needed)

**Container Component**: Handles data fetching and business logic
```javascript
// ItineraryListContainer.jsx
function ItineraryListContainer() {
  const { data, isLoading, error } = useItineraries();
  const [filters, setFilters] = useState({});
  
  return <ItineraryList 
    itineraries={data}
    loading={isLoading}
    error={error}
    filters={filters}
    onFilterChange={setFilters}
  />;
}
```

**Presenter Component**: Pure UI component
```javascript
// ItineraryList.jsx
function ItineraryList({ itineraries, loading, error, filters, onFilterChange }) {
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  if (itineraries.length === 0) return <EmptyState />;
  
  return (
    <div>
      <FilterPanel filters={filters} onChange={onFilterChange} />
      <div className="grid">
        {itineraries.map(item => (
          <ItineraryCard key={item.id} itinerary={item} />
        ))}
      </div>
    </div>
  );
}
```

**When to use**: Complex data fetching + multiple child components
**When NOT to use**: Simple components (KISS - keep it simple)

### 2. Compound Components Pattern

**Example: FormField**
```javascript
// FormField.jsx - Compound component
function FormField({ children, label, required, error, hint }) {
  return (
    <div className="form-field">
      {label && <FormFieldLabel required={required}>{label}</FormFieldLabel>}
      <FormFieldInput error={error}>{children}</FormFieldInput>
      {hint && <FormFieldHint>{hint}</FormFieldHint>}
      {error && <FormFieldError>{error}</FormFieldError>}
    </div>
  );
}

FormField.Label = FormFieldLabel;
FormField.Input = FormFieldInput;
FormField.Hint = FormFieldHint;
FormField.Error = FormFieldError;

// Usage
<FormField label="Email" required error={errors.email}>
  <FormField.Input>
    <input type="email" {...register('email')} />
  </FormField.Input>
  <FormField.Hint>We'll never share your email</FormField.Hint>
</FormField>
```

**Use for**: Complex components with multiple sub-parts that work together

### 3. Render Props Pattern (Use Sparingly)

**Example: Data Fetcher**
```javascript
// Only if React Query hooks aren't sufficient
function ItineraryDataFetcher({ itineraryId, children }) {
  const query = useQuery(['itinerary', itineraryId], () => 
    fetchItinerary(itineraryId)
  );
  
  return children(query);
}

// Usage (prefer hooks instead)
<ItineraryDataFetcher itineraryId={id}>
  {({ data, isLoading, error }) => (
    isLoading ? <Spinner /> : <ItineraryView data={data} />
  )}
</ItineraryDataFetcher>
```

**Prefer hooks over render props** (simpler, more React-idiomatic)

### 4. Custom Hooks Pattern

**Data Fetching Hooks**
```javascript
// hooks/useItineraries.js
export function useItineraries(filters = {}) {
  return useQuery({
    queryKey: ['itineraries', filters],
    queryFn: () => fetchItineraries(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// hooks/useItinerary.js
export function useItinerary(id) {
  return useQuery({
    queryKey: ['itinerary', id],
    queryFn: () => fetchItinerary(id),
    enabled: !!id,
  });
}

// hooks/useCreateItinerary.js
export function useCreateItinerary() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createItinerary,
    onSuccess: () => {
      queryClient.invalidateQueries(['itineraries']);
    },
  });
}
```

**UI State Hooks**
```javascript
// hooks/useModal.js
export function useModal() {
  const [isOpen, setIsOpen] = useState(false);
  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);
  const toggle = () => setIsOpen(!isOpen);
  
  return { isOpen, open, close, toggle };
}

// hooks/useForm.js (wrapper around react-hook-form)
export function useAppForm(schema, defaultValues) {
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues,
  });
  
  return form;
}
```

## Component Categories

### 1. Atomic Components (ui/)
**Smallest building blocks**
- Button
- Input
- Label
- Card
- Badge
- Avatar
- Icon

**Characteristics**:
- No business logic
- Highly reusable
- Props-based API
- Styled with Tailwind

### 2. Molecular Components (forms/, display/)
**Composed of atomic components**
- FormField
- TextInput
- Select
- DatePicker
- ItineraryCard
- AppointmentCard
- PrescriptionCard

**Characteristics**:
- Composed of atomic components
- Some business logic (validation)
- Reusable across features
- Domain-agnostic where possible

### 3. Organism Components (features/)
**Feature-specific components**
- ItineraryList
- AppointmentForm
- PrescriptionForm
- ShareItineraryModal
- CalendarView

**Characteristics**:
- Feature-specific
- Composed of molecular components
- Business logic included
- Use custom hooks for data

### 4. Template Components (layout/)
**Page layout structures**
- PageLayout
- DashboardLayout
- AuthLayout
- ModalLayout

**Characteristics**:
- Layout structure
- Slot-based (children)
- Reusable across pages

### 5. Page Components (pages/)
**Route handlers**
- DashboardPage
- ItinerariesPage
- ItineraryDetailPage
- AppointmentDetailPage

**Characteristics**:
- Top-level route components
- Data fetching
- Composition of organisms
- Use custom hooks

## Component Design Rules

### 1. Single Responsibility
✅ **Good**: One component, one purpose
```javascript
function AppointmentCard({ appointment }) {
  return <Card>{/* display appointment */}</Card>;
}
```

❌ **Bad**: Multiple responsibilities
```javascript
function AppointmentCard({ appointment }) {
  // Fetching data, displaying, editing, deleting - TOO MUCH
}
```

### 2. Props Interface
✅ **Good**: Clear, minimal props
```javascript
function ItineraryCard({ 
  itinerary,      // Required data
  onEdit,         // Callback
  onShare,        // Callback
  className       // Styling override
}) { }
```

❌ **Bad**: Too many props, unclear API
```javascript
function ItineraryCard({ 
  id, name, patientName, relation, startDate, endDate,
  onCreate, onUpdate, onDelete, onShare, onArchive,
  showActions, showDates, showPatient, ...rest 
}) { }
```

### 3. Composition over Configuration
✅ **Good**: Composable
```javascript
<Card>
  <Card.Header>
    <Card.Title>{title}</Card.Title>
    <Card.Actions>
      <Button onClick={onEdit}>Edit</Button>
    </Card.Actions>
  </Card.Header>
  <Card.Body>{content}</Card.Body>
</Card>
```

❌ **Bad**: Configurable props
```javascript
<Card 
  hasHeader={true}
  hasActions={true}
  headerContent={title}
  bodyContent={content}
  showEditButton={true}
/>
```

### 4. Controlled vs Uncontrolled
**Form Inputs**: Controlled (React Hook Form)
```javascript
<input {...register('email')} />
```

**UI Components**: Uncontrolled where possible
```javascript
<Modal isOpen={isOpen} onClose={close}>
  {/* Modal manages its own focus, etc. */}
</Modal>
```

## State Management Patterns

### 1. Server State (React Query)
**What**: Data from Firestore
**Where**: Custom hooks
**Pattern**: 
- `useQuery` for fetching
- `useMutation` for mutations
- `useQueryClient` for cache invalidation

### 2. Global UI State (Zustand)
**What**: UI state shared across components
**Where**: Store files
**Pattern**:
```javascript
// store/ui.js
export const useUIStore = create((set) => ({
  selectedItineraryId: null,
  setSelectedItinerary: (id) => set({ selectedItineraryId: id }),
  
  isSidebarOpen: false,
  toggleSidebar: () => set((state) => ({ 
    isSidebarOpen: !state.isSidebarOpen 
  })),
}));
```

### 3. Form State (React Hook Form)
**What**: Form inputs and validation
**Where**: Component level
**Pattern**: Use `useForm` hook with Zod resolver

### 4. Local State (useState)
**What**: Component-specific UI state
**Where**: Component
**Pattern**: Simple `useState` for toggles, selections

## File Naming Conventions

### Components
- **PascalCase**: `ItineraryCard.jsx`
- **One component per file**: Component name matches file name
- **Index files**: Export for cleaner imports

### Hooks
- **camelCase with `use` prefix**: `useItineraries.js`
- **One hook per file**

### Utilities
- **camelCase**: `formatDate.js`, `validateEmail.js`
- **One function or related functions per file**

### Stores
- **camelCase with `Store` suffix**: `uiStore.js`, `userStore.js`

## Component Template

### Standard Component Structure
```javascript
// components/features/ItineraryCard.jsx
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

/**
 * ItineraryCard displays a summary of a healthcare itinerary
 * 
 * @param {Object} props
 * @param {Object} props.itinerary - The itinerary data
 * @param {Function} props.onClick - Callback when card is clicked
 * @param {Function} props.onEdit - Callback for edit action
 */
export function ItineraryCard({ itinerary, onClick, onEdit }) {
  // 1. Hooks
  // 2. Computed values
  // 3. Event handlers
  // 4. Render
  return (
    <Card onClick={onClick}>
      {/* Content */}
    </Card>
  );
}

// PropTypes or TypeScript types
ItineraryCard.propTypes = {
  itinerary: PropTypes.object.isRequired,
  onClick: PropTypes.func,
  onEdit: PropTypes.func,
};
```

## Best Practices

### 1. Keep Components Small
- **Rule of thumb**: < 200 lines
- Split if it grows beyond

### 2. Extract Logic to Hooks
- **Business logic**: Custom hooks
- **UI logic**: Component or custom hook

### 3. Memoization (Use Sparingly)
- **React.memo**: For expensive renders, props don't change often
- **useMemo**: For expensive calculations
- **useCallback**: For stable function references (rarely needed)

### 4. Error Boundaries
- **Page level**: Catch errors in page components
- **Feature level**: Catch errors in feature components

### 5. Testing
- **Unit tests**: Utilities, hooks
- **Component tests**: UI components
- **Integration tests**: User flows

## Anti-Patterns to Avoid

### 1. Prop Drilling
❌ **Avoid**: Passing props through many levels
✅ **Use**: Context or Zustand for deep state

### 2. God Components
❌ **Avoid**: One component doing everything
✅ **Split**: Into smaller, focused components

### 3. Inline Styles
❌ **Avoid**: `style={{ ... }}`
✅ **Use**: Tailwind classes

### 4. Direct DOM Manipulation
❌ **Avoid**: `document.querySelector`, `ref.current.innerHTML`
✅ **Use**: React state and declarative rendering

### 5. Side Effects in Render
❌ **Avoid**: API calls, mutations in render
✅ **Use**: useEffect, event handlers, mutations

