import React, { useState, useRef, useEffect } from 'react';
import { Palette, Check } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function ThemeSwitcher({ compact = false }) {
  const { theme, setTheme, allThemes } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        title="Change Portal Theme"
        className={`flex items-center gap-2 rounded-xl transition-all cursor-pointer ${
          compact
            ? 'p-2 bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80'
            : 'px-3 py-1.5 bg-slate-900/80 hover:bg-slate-800/90 text-slate-300 hover:text-white border border-slate-800 text-xs font-medium'
        }`}
      >
        <Palette className="w-4 h-4 text-blue-400" style={{ color: allThemes[theme]?.accentColor }} />
        {!compact && <span className="hidden sm:inline">Theme</span>}
        <span
          className="w-2.5 h-2.5 rounded-full ring-2 ring-slate-800 shrink-0"
          style={{ backgroundColor: allThemes[theme]?.accentColor }}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-2.5 py-1.5 mb-1 border-b border-slate-800">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Portal Theme</p>
          </div>
          <div className="space-y-1">
            {Object.values(allThemes).map((th) => {
              const isSelected = th.id === theme;
              return (
                <button
                  key={th.id}
                  onClick={() => {
                    setTheme(th.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-800 text-white font-semibold'
                      : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-3.5 h-3.5 rounded-full ring-2 ring-slate-700 shadow-sm"
                      style={{ backgroundColor: th.accentColor }}
                    />
                    <span>{th.name}</span>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-blue-400" style={{ color: th.accentColor }} />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
