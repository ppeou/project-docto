# Design Patterns - Project Docto

## Software Design Patterns

### 1. Observer Pattern (React Built-in)
**Use Case**: Component updates when data changes
**Implementation**: React Query subscriptions, Firestore onSnapshot
**Example**:
```javascript
// React Query handles this automatically
const { data } = useItineraries(); // Automatically re-renders on data change
```

### 2. Strategy Pattern
**Use Case**: Different validation strategies, different form layouts
**Implementation**: Validation schemas (Zod), layout variants
**Example**:
```javascript
// Different validation schemas for different forms
const appointmentSchema = z.object({ ... });
const prescriptionSchema = z.object({ ... });

// Different layouts
<FormLayout variant="modal">
<FormLayout variant="page">
```

### 3. Factory Pattern
**Use Case**: Create components based on type
**Implementation**: Component factory for dynamic rendering
**Example**:
```javascript
function FieldFactory({ type, ...props }) {
  const components = {
    text: TextInput,
    email: EmailInput,
    phone: PhoneInput,
    date: DatePicker,
  };
  
  const Component = components[type];
  return <Component {...props} />;
}
```

### 4. Template Method Pattern
**Use Case**: Consistent form structure with variations
**Implementation**: Base form component with customizable sections
**Example**:
```javascript
function BaseForm({ children, onSubmit, title }) {
  return (
    <form onSubmit={onSubmit}>
      <FormHeader>{title}</FormHeader>
      {children} {/* Template method */}
      <FormActions />
    </form>
  );
}
```

### 5. Decorator Pattern (HOCs - Use Sparingly)
**Use Case**: Add functionality to components
**Implementation**: Higher-order components or hooks
**Example**:
```javascript
// Prefer hooks over HOCs
function useWithLoading(Component) {
  return function WrappedComponent(props) {
    const { isLoading } = useQuery(...);
    if (isLoading) return <Spinner />;
    return <Component {...props} />;
  };
}

// Better: Use hook
function MyComponent() {
  const { isLoading, data } = useQuery(...);
  if (isLoading) return <Spinner />;
  return <div>{data}</div>;
}
```

## React-Specific Patterns

### 1. Custom Hooks Pattern
**Purpose**: Reusable logic
**Implementation**: Extract logic to custom hooks
```javascript
// hooks/useItineraryForm.js
export function useItineraryForm(itinerary) {
  const form = useForm({
    resolver: zodResolver(itinerarySchema),
    defaultValues: itinerary || defaultValues,
  });
  
  const mutation = useCreateItinerary();
  
  const onSubmit = async (data) => {
    await mutation.mutateAsync(data);
  };
  
  return { form, onSubmit, isSubmitting: mutation.isLoading };
}
```

### 2. Compound Components Pattern
**Purpose**: Related components that work together
**Example**: See component-architecture.md

### 3. Render Props Pattern (Avoid - Use Hooks Instead)
**Purpose**: Share logic between components
**Preference**: Use custom hooks instead

### 4. Controlled Components Pattern
**Purpose**: Form inputs controlled by React state
**Implementation**: React Hook Form
```javascript
const { register, control } = useForm();
<input {...register('email')} />
```

### 5. Portal Pattern
**Purpose**: Render outside component tree (modals, tooltips)
**Implementation**: React Portal
```javascript
import { createPortal } from 'react-dom';

function Modal({ children, isOpen }) {
  if (!isOpen) return null;
  return createPortal(
    <div className="modal">{children}</div>,
    document.body
  );
}
```

## State Management Patterns

### 1. Flux/Redux Pattern (Simplified with Zustand)
**Purpose**: Unidirectional data flow
**Implementation**: Zustand stores
```javascript
// Store defines actions and state
const useStore = create((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
}));
```

### 2. Observer Pattern (React Query)
**Purpose**: React to data changes
**Implementation**: React Query automatic re-renders

### 3. Optimistic Updates Pattern
**Purpose**: Immediate UI feedback
**Implementation**: React Query mutations
```javascript
const mutation = useMutation({
  mutationFn: updateItinerary,
  onMutate: async (newData) => {
    // Cancel outgoing queries
    await queryClient.cancelQueries(['itinerary', id]);
    
    // Snapshot previous value
    const previous = queryClient.getQueryData(['itinerary', id]);
    
    // Optimistically update
    queryClient.setQueryData(['itinerary', id], newData);
    
    return { previous };
  },
  onError: (err, newData, context) => {
    // Rollback on error
    queryClient.setQueryData(['itinerary', id], context.previous);
  },
});
```

## UI/UX Patterns

### 1. Progressive Disclosure
**Purpose**: Show information gradually
**Implementation**: Collapsible sections, tabs, accordions
```javascript
<Accordion>
  <AccordionItem title="Advanced Options">
    {/* Hidden by default */}
  </AccordionItem>
</Accordion>
```

### 2. Empty States Pattern
**Purpose**: Guide users when no data
**Implementation**: EmptyState component with CTAs
```javascript
{items.length === 0 && (
  <EmptyState
    title="No appointments yet"
    description="Create your first appointment to get started"
    action={<Button onClick={onCreate}>Create Appointment</Button>}
  />
)}
```

### 3. Loading States Pattern
**Purpose**: Show progress, prevent confusion
**Implementation**: Skeleton loaders, spinners
```javascript
{isLoading ? (
  <SkeletonLoader count={3} />
) : (
  <ItemList items={data} />
)}
```

### 4. Error States Pattern
**Purpose**: Handle errors gracefully
**Implementation**: Error boundaries, error components
```javascript
{error && (
  <ErrorMessage
    error={error}
    onRetry={() => refetch()}
  />
)}
```

### 5. Confirmation Pattern
**Purpose**: Prevent accidental actions
**Implementation**: Confirmation dialogs
```javascript
function handleDelete() {
  setConfirmDialog({
    isOpen: true,
    message: "Are you sure?",
    onConfirm: () => deleteItem(),
  });
}
```

## Data Fetching Patterns

### 1. Fetch on Mount
**Purpose**: Load data when component mounts
**Implementation**: React Query `useQuery`
```javascript
const { data } = useQuery(['itineraries'], fetchItineraries);
```

### 2. Fetch on Action
**Purpose**: Load data after user action
**Implementation**: React Query `useMutation` + `invalidateQueries`
```javascript
const mutation = useMutation(createItem);
mutation.mutate(data, {
  onSuccess: () => {
    queryClient.invalidateQueries(['items']);
  },
});
```

### 3. Polling Pattern
**Purpose**: Auto-refresh data
**Implementation**: React Query `refetchInterval`
```javascript
useQuery(['appointments'], fetchAppointments, {
  refetchInterval: 60000, // Every minute
});
```

### 4. Dependent Queries
**Purpose**: Fetch based on previous query
**Implementation**: React Query `enabled` option
```javascript
const { data: itinerary } = useItinerary(id);
const { data: appointments } = useAppointments(itinerary?.id, {
  enabled: !!itinerary?.id,
});
```

### 5. Parallel Queries
**Purpose**: Fetch multiple queries simultaneously
**Implementation**: Multiple `useQuery` hooks
```javascript
const itineraries = useItineraries();
const appointments = useUpcomingAppointments();
// Both fetch in parallel
```

## Form Patterns

### 1. Controlled Forms Pattern
**Purpose**: Full control over form state
**Implementation**: React Hook Form
```javascript
const { register, handleSubmit, formState: { errors } } = useForm();
```

### 2. Dynamic Forms Pattern
**Purpose**: Add/remove fields dynamically
**Implementation**: React Hook Form `useFieldArray`
```javascript
const { fields, append, remove } = useFieldArray({
  control,
  name: "phones",
});
```

### 3. Multi-Step Forms Pattern
**Purpose**: Break complex forms into steps
**Implementation**: Step state + conditional rendering
```javascript
const [step, setStep] = useState(1);
{step === 1 && <Step1 />}
{step === 2 && <Step2 />}
```

### 4. Field-Level Validation Pattern
**Purpose**: Validate as user types
**Implementation**: React Hook Form + Zod
```javascript
const schema = z.object({
  email: z.string().email(),
});
// Real-time validation happens automatically
```

## Navigation Patterns

### 1. Declarative Routing
**Purpose**: Route-based navigation
**Implementation**: React Router
```javascript
<Routes>
  <Route path="/" element={<Dashboard />} />
  <Route path="/itineraries/:id" element={<ItineraryDetail />} />
</Routes>
```

### 2. Programmatic Navigation
**Purpose**: Navigate on user action
**Implementation**: React Router `useNavigate`
```javascript
const navigate = useNavigate();
navigate('/itineraries/123');
```

### 3. Protected Routes Pattern
**Purpose**: Require authentication
**Implementation**: Route wrapper component
```javascript
function ProtectedRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/auth" />;
}
```

## Performance Patterns

### 1. Code Splitting Pattern
**Purpose**: Reduce initial bundle size
**Implementation**: React.lazy + Suspense
```javascript
const ItineraryDetail = lazy(() => import('./ItineraryDetail'));
<Suspense fallback={<Spinner />}>
  <ItineraryDetail />
</Suspense>
```

### 2. Memoization Pattern (Use Sparingly)
**Purpose**: Prevent unnecessary re-renders
**Implementation**: React.memo, useMemo, useCallback
```javascript
// Only if profiling shows performance issue
const MemoizedCard = React.memo(ItineraryCard);
```

### 3. Virtual Scrolling Pattern
**Purpose**: Handle large lists efficiently
**Implementation**: react-window or react-virtualized
```javascript
import { FixedSizeList } from 'react-window';
<FixedSizeList height={600} itemCount={1000} itemSize={50}>
  {ItemRenderer}
</FixedSizeList>
```

### 4. Debouncing Pattern
**Purpose**: Limit API calls
**Implementation**: Debounced callbacks
```javascript
const debouncedSearch = useMemo(
  () => debounce((value) => search(value), 300),
  []
);
```

## Security Patterns

### 1. Input Sanitization
**Purpose**: Prevent XSS attacks
**Implementation**: React's built-in escaping + DOMPurify for HTML
```javascript
// React automatically escapes by default
<div>{userInput}</div> // Safe

// For HTML content
import DOMPurify from 'dompurify';
<div dangerouslySetInnerHTML={{ 
  __html: DOMPurify.sanitize(htmlContent) 
}} />
```

### 2. Authentication Check Pattern
**Purpose**: Verify user before actions
**Implementation**: Check in hooks/mutations
```javascript
function useCreateItinerary() {
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (data) => {
      if (!user) throw new Error('Not authenticated');
      return createItinerary(data);
    },
  });
}
```

### 3. Permission Check Pattern
**Purpose**: Verify user permissions
**Implementation**: Check in components/hooks
```javascript
function ItineraryActions({ itinerary }) {
  const { user } = useAuth();
  const canEdit = itinerary.created.by === user.uid || 
                  isCollaborator(itinerary, user.uid);
  
  return canEdit ? <EditButton /> : null;
}
```

## Testing Patterns

### 1. Arrange-Act-Assert (AAA)
**Purpose**: Structure test cases
```javascript
test('creates itinerary', () => {
  // Arrange
  const formData = { name: 'Test', patient: {...} };
  
  // Act
  const result = createItinerary(formData);
  
  // Assert
  expect(result.id).toBeDefined();
});
```

### 2. Mock Pattern
**Purpose**: Isolate units under test
```javascript
jest.mock('../services/firestore', () => ({
  createItinerary: jest.fn(),
}));
```

### 3. Snapshot Testing Pattern
**Purpose**: Detect UI changes
```javascript
test('renders correctly', () => {
  const { container } = render(<ItineraryCard {...props} />);
  expect(container).toMatchSnapshot();
});
```

