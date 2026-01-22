# Migration Guide: Project Restructure

This document outlines the migration from a single-app structure to a monorepo structure matching project-viaggio.

## Completed Changes

### 1. Root Structure
- ✅ Created root `package.json` with workspaces configuration
- ✅ Added `.eslintrc.js` and `.prettierrc` configuration files
- ✅ Updated scripts to use workspace commands

### 2. packages/core
- ✅ Created `packages/core/package.json` with Redux Toolkit dependencies
- ✅ Created Redux stores:
  - `authStore.js` - Migrated from Zustand `useAuth` hook
  - `preferencesStore.js` - Migrated from Zustand `settingsStore`
- ✅ Created Firebase services:
  - `services/firebase.js` - Firebase initialization with persistence
  - `services/firestore.js` - Placeholder for Firestore utilities
- ✅ Created utilities:
  - `utils/cn.js` - Class name utility (moved from `lib/utils.js`)
  - `utils/phone.js` - Phone number utilities
- ✅ Created Redux store configuration in `store.js`

### 3. packages/web
- ✅ Created `packages/web/package.json` with all React dependencies
- ✅ Created `vite.config.js` with:
  - Path aliases (`@`, `@core`, `@components`, `@pages`)
  - Enhanced PWA configuration
  - Source maps enabled
- ✅ Created `tailwind.config.js` with fontSize extensions
- ✅ Created `postcss.config.js`
- ✅ Created `index.css` with:
  - Scrollbar styling
  - Skip-to-main content link
  - Font size classes
- ✅ Created `index.html`
- ✅ Created AppLayout component:
  - `components/layouts/AppLayout.jsx` - Bottom navigation layout
  - `components/layouts/AppLayout.scss` - Layout styles
- ✅ Created supporting components:
  - `components/ui/Logo.jsx`
  - `components/ui/Avatar.jsx`
  - `components/ui/LoadingSpinner.jsx`
  - `components/auth/ProtectedRoute.jsx`
  - `components/ErrorBoundary.jsx`
- ✅ Created `App.jsx` with nested routes using AppLayout
- ✅ Created `main.jsx` with Redux Provider, ErrorBoundary, and QueryClientProvider

## Remaining Tasks

### File Migration
All files from `src/` need to be moved to `packages/web/src/`:

1. **Pages** (`src/pages/` → `packages/web/src/pages/`)
   - All page components need to be moved
   - Update imports to use new path aliases:
     - `@/lib/firebase` → `@core/services/firebase`
     - `@/lib/utils` → `@core/utils` (for `cn` function)
     - `@/store/settingsStore` → Use Redux `useSelector` with `state.preferences`
     - `@/store/uiStore` → May need to create a new Redux slice or use local state
     - `@/hooks/useAuth` → Use Redux `useSelector` with `state.auth`

2. **Components** (`src/components/` → `packages/web/src/components/`)
   - Move all components
   - Update imports similarly to pages
   - Note: Some components like `AppHeader` may no longer be needed (replaced by AppLayout)

3. **Hooks** (`src/hooks/` → `packages/web/src/hooks/`)
   - Move all hooks
   - Update `useAuth` hook to use Redux instead of local state
   - Update imports in hooks

4. **Services** (`src/services/` → `packages/web/src/services/`)
   - Move all service files
   - Update Firebase imports to use `@core/services/firebase`
   - Update other imports as needed

5. **Public Assets**
   - Move `public/` folder to `packages/web/public/`
   - Update references in `index.html` and other files

### Import Updates Required

#### Firebase Imports
```javascript
// Old
import { auth, db, functions, storage } from '@/lib/firebase';

// New
import { auth, db, functions, storage } from '@core/services/firebase';
```

#### Utils Imports
```javascript
// Old
import { cn } from '@/lib/utils';

// New
import { cn } from '@core/utils';
```

#### State Management
```javascript
// Old (Zustand)
import { useSettingsStore } from '@/store/settingsStore';
const { fontSize, theme, setFontSize, setTheme } = useSettingsStore();

// New (Redux)
import { useSelector, useDispatch } from 'react-redux';
import { setFontSize, setTheme } from '@core/stores/preferencesStore';
const fontSize = useSelector((state) => state.preferences.fontSize);
const theme = useSelector((state) => state.preferences.theme);
const dispatch = useDispatch();
dispatch(setFontSize('large'));
```

#### Auth Hook
```javascript
// Old
import { useAuth } from '@/hooks/useAuth';
const { user, userProfile, loading } = useAuth();

// New (Redux)
import { useSelector } from 'react-redux';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@core/services/firebase';
const user = useSelector((state) => state.auth.user);
const loading = useSelector((state) => state.auth.loading);
// userProfile needs to be fetched separately if needed
```

### Configuration Updates

1. **Firebase Config**: Already updated in `packages/core/src/services/firebase.js`
2. **Vite Config**: Already created with path aliases
3. **Tailwind Config**: Already updated
4. **PostCSS Config**: Already created

### Next Steps

1. **Move Files**: Use a script or manually move files from `src/` to `packages/web/src/`
2. **Update Imports**: Run find/replace or use a script to update all imports
3. **Test**: Run `npm install` in root, then `npm run dev` to test
4. **Fix Issues**: Address any remaining import or functionality issues
5. **Remove Old Files**: Once everything works, remove the old `src/` directory

### Running the Project

```bash
# Install dependencies (from root)
npm install

# Run dev server
npm run dev

# Build for production
npm run build

# Deploy
npm run deploy
```

### Notes

- The `AppLayout` component uses a bottom navigation bar (similar to mobile apps)
- All protected routes are nested under the AppLayout
- Auth pages (login, signup) are outside the AppLayout
- Redux store is initialized in `App.jsx` with auth state listener
- QueryClient is still used for data fetching (React Query)
