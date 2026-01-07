import { useEffect } from 'react';
import { useSettingsStore } from '@/store/settingsStore';

export function SettingsProvider({ children }) {
  const { fontSize, theme } = useSettingsStore();

  // Apply settings on mount and when they change
  useEffect(() => {
    // Apply font size to html element
    const html = document.documentElement;
    html.classList.remove('font-size-small', 'font-size-regular', 'font-size-large', 'font-size-extra-large');
    html.classList.add(`font-size-${fontSize}`);

    // Apply theme
    const getEffectiveTheme = () => {
      if (theme === 'system') {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
      return theme;
    };

    const effectiveTheme = getEffectiveTheme();
    if (effectiveTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [fontSize, theme]);

  // Listen for system theme changes when theme is set to 'system'
  useEffect(() => {
    if (theme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (mediaQuery.matches) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  return <>{children}</>;
}

