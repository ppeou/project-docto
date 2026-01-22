# Cleanup Summary

## Files Removed ✅

### Root Level Config Files (Now in packages/web)
- ✅ `vite.config.js` - Moved to `packages/web/vite.config.js`
- ✅ `tailwind.config.js` - Moved to `packages/web/tailwind.config.js`
- ✅ `postcss.config.js` - Moved to `packages/web/postcss.config.js`
- ✅ `index.html` - Moved to `packages/web/index.html`

### Old State Management (Replaced by Redux)
- ✅ `src/store/settingsStore.js` - Replaced by `packages/core/src/stores/preferencesStore.js`
- ✅ `src/store/uiStore.js` - Can be replaced with Redux slice or local state
- ✅ `src/store/` directory (empty, removed)

### Old Firebase/Utils (Moved to packages/core)
- ✅ `src/lib/firebase.js` - Moved to `packages/core/src/services/firebase.js`
- ✅ `src/lib/utils.js` - Moved to `packages/core/src/utils/cn.js` and `phone.js`
- ✅ `src/lib/` directory (empty, removed)

### Old Components (Replaced)
- ✅ `src/components/SettingsProvider.jsx` - Replaced by Redux store
- ✅ `src/components/shared/AppHeader.jsx` - Replaced by `packages/web/src/components/layouts/AppLayout.jsx`

### Old Hooks (Replaced by Redux)
- ✅ `src/hooks/useAuth.js` - Replaced by Redux `useSelector` with `state.auth`

### Temporary Migration Files
- ✅ `src/services/firestore-old.js` - Temporary migration file
- ✅ `src/services/firestore-refactored.js` - Temporary migration file

### Old Entry Points
- ✅ `src/App.jsx` - Replaced by `packages/web/src/App.jsx`
- ✅ `src/main.jsx` - Replaced by `packages/web/src/main.jsx`
- ✅ `src/index.css` - Replaced by `packages/web/src/index.css`

## Dependencies Status

### Removed from package.json
- ✅ `zustand` - No longer in any package.json (replaced by Redux Toolkit)
- ✅ All dependencies moved to appropriate workspace packages

### Current Dependencies
- `packages/core/package.json` - Contains Redux Toolkit, Firebase, clsx, tailwind-merge
- `packages/web/package.json` - Contains React, UI libraries, and app dependencies

## Files Still in src/ (Need Migration)

The following files in `src/` still need to be moved to `packages/web/src/` and their imports updated:

### Pages (src/pages/ → packages/web/src/pages/)
- All page components need to be moved
- Update imports: `@/lib/firebase` → `@core/services/firebase`
- Update imports: `@/lib/utils` → `@core/utils`
- Update state: Replace Zustand hooks with Redux selectors

### Components (src/components/ → packages/web/src/components/)
- All components need to be moved
- Update imports similarly to pages

### Hooks (src/hooks/ → packages/web/src/hooks/)
- All hooks need to be moved
- Update imports to use new path aliases

### Services (src/services/ → packages/web/src/services/)
- All services need to be moved
- Update Firebase imports to `@core/services/firebase`

## Import Updates Needed

Files in `src/` that still reference old imports (39 files found):
- Need to update `@/lib/firebase` → `@core/services/firebase`
- Need to update `@/lib/utils` → `@core/utils`
- Need to update `@/store/` → Redux selectors
- Need to update `useAuth()` → Redux `useSelector((state) => state.auth.user)`

## Next Steps

1. **Move remaining files** from `src/` to `packages/web/src/`
2. **Update all imports** in moved files to use new path aliases
3. **Update state management** from Zustand to Redux
4. **Test the application** after migration
5. **Remove old `src/` directory** once migration is complete

## Notes

- The `package-lock.json` may still reference `zustand` but will be updated on next `npm install`
- Documentation files (specs/, README.md) still mention Zustand but are informational only
- All actual code dependencies have been cleaned up
