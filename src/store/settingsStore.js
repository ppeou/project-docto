import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useSettingsStore = create(
  persist(
    (set) => ({
      // Font size: 'small', 'regular', 'large', 'extra-large'
      fontSize: 'regular',
      setFontSize: (size) => set({ fontSize: size }),

      // Theme: 'light', 'dark', 'system'
      theme: 'system',
      setTheme: (theme) => set({ theme }),

      // Get effective theme (resolves 'system' to actual theme)
      getEffectiveTheme: () => {
        if (typeof window === 'undefined') return 'light';
        const state = useSettingsStore.getState();
        if (state.theme === 'system') {
          return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        return state.theme;
      },
    }),
    {
      name: 'docto-settings',
    }
  )
);

