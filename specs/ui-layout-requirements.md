# UI Layout & Component Requirements - Project Docto

## Design Principles

### KISS (Keep It Simple, Stupid)
- Simple, intuitive interface for all ages (including elderly users)
- Clear labels and instructions
- Minimal cognitive load
- Obvious action buttons

### DRY (Don't Repeat Yourself)
- Reusable form components across different contexts
- Shared UI components (buttons, inputs, cards)
- Centralized styling with Tailwind utilities
- Single source of truth for form validation schemas

### SOLID Principles
- **Single Responsibility**: Each component has one clear purpose
- **Open/Closed**: Components extensible without modification
- **Liskov Substitution**: Interchangeable form components
- **Interface Segregation**: Small, focused component APIs
- **Dependency Inversion**: Components depend on abstractions (props), not concrete implementations

### YAGNI (You Aren't Gonna Need It)
- Build only what's needed for MVP
- Avoid over-engineering
- Progressive enhancement
- Simple solutions first

## Layout Structure

### App Shell
```
┌─────────────────────────────────────┐
│ Header (fixed)                      │
│ - App Logo/Title                    │
│ - User Menu                         │
├─────────────────────────────────────┤
│                                     │
│ Main Content Area (scrollable)      │
│ - Route-specific content            │
│                                     │
├─────────────────────────────────────┤
│ Bottom Nav (mobile, fixed)          │
│ - Dashboard | Itineraries | Calendar│
└─────────────────────────────────────┘
```

### Responsive Breakpoints
- **Mobile**: < 768px (primary target)
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

## Page Layouts

### 1. Dashboard Page (`/`)
**Purpose**: Overview and quick access

**Layout**:
```
Header
├─ App Title
└─ User Menu (avatar + dropdown)

Quick Stats Cards (3 columns on desktop, stacked on mobile)
├─ Active Itineraries Count
├─ Upcoming Appointments (next 7 days)
└─ Prescriptions Needing Refills

Upcoming Appointments Widget
└─ List of next 5 appointments with quick actions

Refill Reminders Widget
└─ List of prescriptions needing refills soon

Floating Action Button (FAB)
└─ Quick Create Menu (Itinerary, Appointment, Prescription)
```

### 2. Itineraries List Page (`/itineraries`)
**Purpose**: Browse and manage all itineraries

**Layout**:
```
Header
├─ Page Title: "Healthcare Itineraries"
├─ Search Bar
└─ Filter Button (toggle filter panel)

Filter Panel (collapsible sidebar on desktop, modal on mobile)
├─ By Patient Relation
├─ By Date Range
└─ Show Archived (toggle)

Itinerary Cards (grid: 1 col mobile, 2 cols tablet, 3 cols desktop)
├─ Patient Name & Relation
├─ Itinerary Name
├─ Date Range
├─ Appointment Count Badge
├─ Prescription Count Badge
└─ Actions Menu (View, Edit, Share, Archive)

FAB: Create New Itinerary
```

### 3. Itinerary Detail Page (`/itineraries/:id`)
**Purpose**: View and manage single itinerary

**Layout**:
```
Header
├─ Back Button
├─ Itinerary Name (editable)
└─ Actions Menu (Edit, Share, Archive)

Itinerary Info Card
├─ Patient: [Name] ([Relation])
├─ Date Range
└─ Description

Tabs (Appointments | Prescriptions | Notes)
├─ Appointments Tab
│  ├─ Calendar View (toggle: month/week/list)
│  └─ Appointment List
│     └─ Appointment Cards
├─ Prescriptions Tab
│  ├─ Active Prescriptions
│  └─ Completed/Discontinued
└─ Notes Tab
   └─ Doctor Notes List

FAB: Quick Add (context-aware: appointment/prescription/note)
```

### 4. Appointment Detail Page (`/appointments/:id`)
**Purpose**: View/edit appointment details

**Layout**:
```
Header
├─ Back Button
├─ Appointment Title
└─ Actions Menu (Edit, Delete)

Appointment Info
├─ Title
├─ Doctor (with contact info)
├─ Clinic Name & Address (with map links)
├─ Date & Time
├─ Duration
├─ Purpose
├─ Status Badge
└─ Reminder Settings

Linked Prescriptions
└─ List of prescriptions from this appointment

Doctor Notes
└─ List of notes from this appointment

Actions
├─ Edit Button
├─ Mark as Completed
└─ Delete Button
```

### 5. Prescription Detail Page (`/prescriptions/:id`)
**Purpose**: View/edit prescription details

**Layout**:
```
Header
├─ Back Button
├─ Medication Name
└─ Actions Menu (Edit, Delete)

Prescription Info
├─ Medication Name (brand & generic)
├─ Dosage & Frequency
├─ Quantity
├─ Prescribed By (doctor with contact)
├─ Pharmacy Info
├─ Date Prescribed
├─ Refills (remaining/total)
├─ Next Refill Date
├─ Instructions
└─ Status Badge

Refill Tracking
├─ Refill History
└─ Reminder Settings

Linked Appointment
└─ Link to appointment where prescribed

Actions
├─ Edit Button
├─ Mark as Completed
├─ Add Refill
└─ Delete Button
```

### 6. Calendar Page (`/calendar`)
**Purpose**: Calendar view of all appointments

**Layout**:
```
Header
├─ Calendar Controls (prev/next month)
├─ View Toggle (month/week/day)
└─ Filter Button

Filter Panel
├─ Select Itineraries (multi-select)
└─ Show Completed (toggle)

Calendar View
├─ Month View (default)
├─ Week View
└─ Day View

Appointment Events
└─ Click to view details

Upcoming Events Sidebar (desktop only)
└─ List of next appointments
```

## Core UI Components

### 1. Form Components (Reusable)

#### FormField (Generic wrapper)
```javascript
<FormField
  label="Label text"
  required={true}
  error="Error message"
  hint="Helpful hint text"
>
  {children} {/* Input component */}
</FormField>
```

#### TextInput
- Standard text input
- Supports validation states (error, success)
- Clear button on focus

#### TextArea
- Multi-line text input
- Character counter (if maxLength)
- Auto-resize option

#### Select
- Dropdown select
- Searchable (for long lists)
- Supports multi-select (where needed)

#### DatePicker
- Calendar picker
- Date range support
- Preset options (today, next week, etc.)

#### DateTimePicker
- Combined date and time picker
- Timezone handling

#### PhoneInput
- Phone number input with country code selector
- Auto-formatting
- E.164 format validation

#### EmailInput
- Email validation
- Multiple emails (array field)

#### AddressInput
- Full address fields
- Auto-complete (future)
- Map URL inputs

### 2. Display Components

#### Card
- Container with shadow and border
- Supports header, body, footer sections
- Hover states

#### Badge
- Status indicators
- Color-coded (success, warning, error, info)

#### Avatar
- User/patient photo or initials
- Fallback icon

#### EmptyState
- Friendly empty state message
- Optional illustration
- Call-to-action button

#### LoadingSpinner
- Loading indicator
- Inline or overlay

#### ErrorMessage
- Error display component
- Retry button support

### 3. List Components

#### List
- Generic list container
- Supports headers, items, actions

#### ListItem
- List item with actions
- Swipe actions (mobile)
- Drag handle (for reordering)

#### CardList (Grid)
- Responsive grid of cards
- Auto-layout based on screen size

### 4. Navigation Components

#### Header
- Fixed header
- Logo/title
- User menu
- Back button (context-aware)

#### BottomNav (Mobile)
- Fixed bottom navigation
- 3-4 main sections
- Active state indicator

#### Sidebar (Desktop)
- Collapsible sidebar
- Navigation links
- Filters

#### Tabs
- Tab navigation
- Active tab indicator
- Scrollable (if many tabs)

### 5. Modal/Dialog Components

#### Modal
- Overlay modal
- Close button
- Escape key to close
- Focus trap

#### Dialog
- Confirmation dialogs
- Action buttons (confirm/cancel)

#### Drawer (Mobile)
- Slide-in drawer from bottom/right
- For forms and filters

### 6. Action Components

#### Button
- Primary, secondary, ghost, destructive variants
- Icon support
- Loading state
- Disabled state

#### IconButton
- Icon-only button
- Tooltip on hover

#### FAB (Floating Action Button)
- Fixed position
- Primary action
- Speed dial (multiple actions)

#### Menu/Dropdown
- Context menu
- Dropdown menu
- Nested menus

## Component Hierarchy

### Page Components
```
Page
├─ Layout (Header, Content, Footer/Nav)
├─ PageHeader
├─ PageContent
│  └─ Route-specific components
└─ FAB (context-aware)
```

### Form Components
```
Form
├─ FormHeader
├─ FormFields
│  ├─ FormField (reusable wrapper)
│  │  └─ Input/Select/etc.
│  └─ ArrayField (for arrays)
│     └─ FormField[]
└─ FormActions (Save, Cancel)
```

### List Components
```
ListContainer
├─ ListHeader (title, filters, actions)
├─ ListContent
│  ├─ EmptyState (if empty)
│  ├─ LoadingSpinner (if loading)
│  └─ ListItems[]
└─ ListPagination (if needed)
```

## State Management Strategy

### Global State (Zustand)
- Current user
- Selected itinerary ID
- UI state (modals, drawers, filters)
- Theme preferences

### Server State (React Query)
- Itineraries (query + mutations)
- Appointments (by itinerary)
- Prescriptions (by itinerary)
- Doctor notes (by appointment)
- User data

### Local State (Component)
- Form inputs
- UI interactions (dropdowns, toggles)
- Temporary selections

### Form State (React Hook Form)
- All form inputs
- Validation
- Submit handlers

## Validation Strategy

### Client-Side (React Hook Form + Zod)
- Required fields
- Format validation (email, phone, URL)
- Length constraints
- Custom validation rules
- Real-time validation feedback

### Validation Schemas
- One schema per form type
- Reusable schemas for common fields
- Schema composition for complex forms

## Accessibility Requirements

### WCAG 2.1 AA Compliance
- **Contrast**: Minimum 4.5:1 for text
- **Touch Targets**: Minimum 44x44px
- **Font Size**: Minimum 16px (adjustable)
- **Keyboard Navigation**: All interactive elements accessible
- **Screen Readers**: ARIA labels, semantic HTML
- **Focus Indicators**: Visible focus states

### Mobile Accessibility
- Large touch targets
- Swipe gestures
- Haptic feedback (where appropriate)
- Simple navigation

## Performance Requirements

### Core Web Vitals
- **LCP (Largest Contentful Paint)**: < 2.5s
- **FID (First Input Delay)**: < 100ms
- **CLS (Cumulative Layout Shift)**: < 0.1

### Optimization
- Code splitting (route-based)
- Lazy loading (images, components)
- Virtual scrolling (for long lists)
- Debounced search inputs
- Optimistic updates
- Cached queries (React Query)

## Design System

### Colors
- **Primary**: Purple/Blue gradient (#667eea to #764ba2)
- **Success**: Green (#10b981)
- **Warning**: Orange (#f59e0b)
- **Error**: Red (#ef4444)
- **Info**: Blue (#3b82f6)
- **Neutral**: Gray scale

### Typography
- **Font Family**: System stack (San Francisco, Segoe UI, Roboto)
- **Headings**: Bold, larger sizes
- **Body**: Regular weight, 16px base
- **Small**: 14px for hints/secondary text

### Spacing
- **Base Unit**: 4px
- **Scale**: 4, 8, 12, 16, 24, 32, 48, 64
- **Consistent spacing**: Use Tailwind scale

### Shadows
- **Small**: Subtle elevation
- **Medium**: Cards
- **Large**: Modals

## Responsive Design Patterns

### Mobile-First
- Design for mobile first
- Progressive enhancement for larger screens
- Touch-friendly controls
- Bottom navigation (mobile)

### Breakpoint Strategy
- **sm**: 640px (small tablets)
- **md**: 768px (tablets)
- **lg**: 1024px (desktops)
- **xl**: 1280px (large desktops)

## Error Handling

### Error States
- **Network Errors**: Retry button, offline indicator
- **Validation Errors**: Inline field errors
- **Permission Errors**: Friendly message, redirect to login
- **404 Errors**: Friendly 404 page with navigation

### Error Display
- Toast notifications (non-blocking)
- Inline errors (forms)
- Error boundaries (unexpected errors)
- User-friendly error messages

## Loading States

### Loading Indicators
- **Skeleton Loaders**: For content areas
- **Spinner**: For buttons, inline
- **Progress Bar**: For long operations
- **Shimmer Effect**: For cards

### Loading Strategy
- Optimistic updates (where safe)
- Show cached data immediately
- Update when fresh data arrives
- Loading states for all async operations

