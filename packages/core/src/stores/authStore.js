import { createSlice } from '@reduxjs/toolkit';

/**
 * Extract serializable user data from Firebase User object
 * @param {import('firebase/auth').User | null} user - Firebase User object
 * @returns {Object | null} Serialized user data
 */
export const serializeUser = (user) => {
  if (!user) return null;
  
  return {
    uid: user.uid,
    email: user.email || null,
    emailVerified: user.emailVerified || false,
    displayName: user.displayName || null,
    photoURL: user.photoURL || null,
    phoneNumber: user.phoneNumber || null,
    isAnonymous: user.isAnonymous || false,
    providerId: user.providerId || 'firebase',
    // Include provider data (array of UserInfo)
    providerData: user.providerData?.map(provider => ({
      uid: provider.uid,
      displayName: provider.displayName,
      email: provider.email,
      phoneNumber: provider.phoneNumber,
      photoURL: provider.photoURL,
      providerId: provider.providerId,
    })) || [],
  };
};

const initialState = {
  user: null,
  loading: true,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action) => {
      // Serialize the user object to only include plain data
      state.user = serializeUser(action.payload);
      state.loading = false;
      state.error = null;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    clearError: (state) => {
      state.error = null;
    },
    logout: (state) => {
      state.user = null;
      state.error = null;
    },
  },
});

export const { setUser, setLoading, setError, clearError, logout } = authSlice.actions;
export default authSlice.reducer;
