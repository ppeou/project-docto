import { createSlice } from '@reduxjs/toolkit';

const getInitialTheme = () => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('theme');
    if (stored) return stored;
    return 'system';
  }
  return 'system';
};

const getInitialFontSize = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('fontSize') || 'regular';
  }
  return 'regular';
};

const applyTheme = (theme) => {
  if (typeof window === 'undefined') return;
  
  const root = document.documentElement;
  root.classList.remove('light', 'dark');
  
  if (theme === 'system') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    root.classList.add(prefersDark ? 'dark' : 'light');
  } else {
    root.classList.add(theme);
  }
};

const initialState = {
  theme: getInitialTheme(),
  fontSize: getInitialFontSize(),
  lastTab: null,
};

// Apply initial theme
if (typeof window !== 'undefined') {
  applyTheme(getInitialTheme());
  
  // Listen for system theme changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    const stored = localStorage.getItem('theme');
    if (stored === 'system' || !stored) {
      applyTheme('system');
    }
  });
}

const preferencesSlice = createSlice({
  name: 'preferences',
  initialState,
  reducers: {
    setTheme: (state, action) => {
      state.theme = action.payload;
      if (typeof window !== 'undefined') {
        localStorage.setItem('theme', action.payload);
        applyTheme(action.payload);
      }
    },
    setFontSize: (state, action) => {
      state.fontSize = action.payload;
      if (typeof window !== 'undefined') {
        localStorage.setItem('fontSize', action.payload);
        document.documentElement.className = document.documentElement.className
          .replace(/font-size-\w+/g, '');
        document.documentElement.classList.add(`font-size-${action.payload}`);
      }
    },
    setLastTab: (state, action) => {
      state.lastTab = action.payload;
    },
  },
});

export const { setTheme, setFontSize, setLastTab } = preferencesSlice.actions;
export default preferencesSlice.reducer;
