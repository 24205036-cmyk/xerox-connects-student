import React, { createContext, useContext, useState, useEffect } from 'react';

export const THEMES = {
  blue: {
    id: 'blue',
    name: 'Electric Blue',
    accentColor: '#3b82f6',
    accentGradient: 'from-blue-600 to-indigo-600',
    borderGlow: 'rgba(59, 130, 246, 0.3)',
    pillBg: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
    primaryBtn: 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/30',
    badgeColor: 'bg-blue-500',
    dotColor: '#3b82f6',
    sidebarActive: 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/30',
  },
  emerald: {
    id: 'emerald',
    name: 'Cyber Emerald',
    accentColor: '#10b981',
    accentGradient: 'from-emerald-600 to-teal-600',
    borderGlow: 'rgba(16, 185, 129, 0.3)',
    pillBg: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    primaryBtn: 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30',
    badgeColor: 'bg-emerald-500',
    dotColor: '#10b981',
    sidebarActive: 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-600/30',
  },
  violet: {
    id: 'violet',
    name: 'Hyper Violet',
    accentColor: '#8b5cf6',
    accentGradient: 'from-violet-600 to-purple-600',
    borderGlow: 'rgba(139, 92, 246, 0.3)',
    pillBg: 'bg-violet-500/15 text-violet-300 border-violet-500/30',
    primaryBtn: 'bg-violet-600 hover:bg-violet-500 text-white shadow-violet-600/30',
    badgeColor: 'bg-violet-500',
    dotColor: '#8b5cf6',
    sidebarActive: 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-violet-600/30',
  },
  amber: {
    id: 'amber',
    name: 'Solar Amber',
    accentColor: '#f59e0b',
    accentGradient: 'from-amber-600 to-orange-600',
    borderGlow: 'rgba(245, 158, 11, 0.3)',
    pillBg: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    primaryBtn: 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/30',
    badgeColor: 'bg-amber-500',
    dotColor: '#f59e0b',
    sidebarActive: 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-lg shadow-amber-600/30',
  },
  slate: {
    id: 'slate',
    name: 'Titanium Pro',
    accentColor: '#64748b',
    accentGradient: 'from-slate-600 to-slate-800',
    borderGlow: 'rgba(148, 163, 184, 0.3)',
    pillBg: 'bg-slate-700/40 text-slate-200 border-slate-600/50',
    primaryBtn: 'bg-slate-700 hover:bg-slate-600 text-white shadow-slate-900/50',
    badgeColor: 'bg-slate-400',
    dotColor: '#94a3b8',
    sidebarActive: 'bg-gradient-to-r from-slate-700 to-slate-800 text-white shadow-lg shadow-slate-700/30',
  },
};

const ThemeContext = createContext({
  theme: 'blue',
  themeConfig: THEMES.blue,
  setTheme: () => {},
  allThemes: THEMES,
});

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    try {
      return localStorage.getItem('xerox_student_theme') || 'blue';
    } catch {
      return 'blue';
    }
  });

  const setTheme = (newTheme) => {
    if (THEMES[newTheme]) {
      setThemeState(newTheme);
      try {
        localStorage.setItem('xerox_student_theme', newTheme);
      } catch (e) {
        console.error('Failed to save theme preference', e);
      }
    }
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const themeConfig = THEMES[theme] || THEMES.blue;

  return (
    <ThemeContext.Provider value={{ theme, themeConfig, setTheme, allThemes: THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
