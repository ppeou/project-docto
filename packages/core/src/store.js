import { configureStore } from '@reduxjs/toolkit';
import authReducer from './stores/authStore';
import preferencesReducer from './stores/preferencesStore';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    preferences: preferencesReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore the payload for setUser action since we serialize it in the reducer
        // The Firebase User object is non-serializable, but we extract only plain data
        ignoredActions: ['auth/setUser'],
        ignoredActionPaths: ['payload'],
      },
    }),
});
