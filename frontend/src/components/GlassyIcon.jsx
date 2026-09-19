import React from 'react';

/**
 * GlassyIcon component inspired by Framer Glassy button (wkgf.js@kR90p8CxkIlZ7L6xYHsR).
 * Features multi-layered rim gradient, realistic layered depth shadows,
 * refractive inner glow, optical lens reflection, and spring hover interaction.
 */
export default function GlassyIcon({
  icon: Icon,
  size = 'md',
  variant = 'blue',
  className = '',
  iconClassName = '',
  onClick,
  children,
}) {
  // Size maps
  const sizeClasses = {
    xs: { outer: 'w-7 h-7 p-[2px] rounded-[14px]', icon: 'w-3.5 h-3.5', inner: 'rounded-[12px]' },
    sm: { outer: 'w-9 h-9 p-[2.5px] rounded-[18px]', icon: 'w-4 h-4', inner: 'rounded-[15.5px]' },
    md: { outer: 'w-11 h-11 p-[3px] rounded-[22px]', icon: 'w-5 h-5', inner: 'rounded-[19px]' },
    lg: { outer: 'w-13 h-13 p-[3.5px] rounded-[26px]', icon: 'w-6 h-6', inner: 'rounded-[22.5px]' },
    xl: { outer: 'w-16 h-16 p-[4px] rounded-[32px]', icon: 'w-8 h-8', inner: 'rounded-[28px]' },
  }[size] || { outer: 'w-11 h-11 p-[3px] rounded-[22px]', icon: 'w-5 h-5', inner: 'rounded-[19px]' };

  // Theme variant styles replicating Framer Glassy Button layers
  const variantStyles = {
    // Crisp White Glass (from the Framer default)
    white: {
      outerBg: 'linear-gradient(180deg, #FFFFFF 0%, #D1D5DB 12%, #9CA3AF 35%, #6B7280 75%, #FFFFFF 100%)',
      innerBg: 'linear-gradient(150deg, #FFFFFF 0%, #F3F4F6 50%, #E5E7EB 100%)',
      innerHover: 'group-hover:from-white group-hover:via-white group-hover:to-slate-100',
      iconColor: 'text-blue-700',
      shadowColor: 'text-white/80',
      shadowBox: '0 8px 24px -4px rgba(0, 0, 0, 0.12), 0 3px 6px -2px rgba(0, 0, 0, 0.08)',
    },
    // Vibrant Blue Glass
    blue: {
      outerBg: 'linear-gradient(180deg, #BFDBFE 0%, #60A5FA 15%, #2563EB 40%, #1D4ED8 80%, #93C5FD 100%)',
      innerBg: 'linear-gradient(150deg, #3B82F6 0%, #2563EB 50%, #1D4ED8 100%)',
      innerHover: 'group-hover:from-blue-400 group-hover:via-blue-500 group-hover:to-blue-700',
      iconColor: 'text-white',
      shadowColor: 'text-blue-200/50',
      shadowBox: '0 10px 25px -4px rgba(37, 99, 235, 0.45), 0 4px 10px -2px rgba(37, 99, 235, 0.25)',
    },
    // Emerald Green Glass
    emerald: {
      outerBg: 'linear-gradient(180deg, #A7F3D0 0%, #34D399 15%, #059669 40%, #047857 80%, #6EE7B7 100%)',
      innerBg: 'linear-gradient(150deg, #10B981 0%, #059669 50%, #047857 100%)',
      innerHover: 'group-hover:from-emerald-400 group-hover:via-emerald-500 group-hover:to-emerald-700',
      iconColor: 'text-white',
      shadowColor: 'text-emerald-200/50',
      shadowBox: '0 10px 25px -4px rgba(16, 185, 129, 0.45), 0 4px 10px -2px rgba(16, 185, 129, 0.25)',
    },
    // Amber Gold Glass
    amber: {
      outerBg: 'linear-gradient(180deg, #FDE68A 0%, #FBBF24 15%, #D97706 40%, #B45309 80%, #FCD34D 100%)',
      innerBg: 'linear-gradient(150deg, #F59E0B 0%, #D97706 50%, #B45309 100%)',
      innerHover: 'group-hover:from-amber-400 group-hover:via-amber-500 group-hover:to-amber-700',
      iconColor: 'text-white',
      shadowColor: 'text-amber-200/50',
      shadowBox: '0 10px 25px -4px rgba(245, 158, 11, 0.45), 0 4px 10px -2px rgba(245, 158, 11, 0.25)',
    },
    // Purple Violet Glass
    purple: {
      outerBg: 'linear-gradient(180deg, #DDD6FE 0%, #A78BFA 15%, #7C3AED 40%, #6D28D9 80%, #C4B5FD 100%)',
      innerBg: 'linear-gradient(150deg, #8B5CF6 0%, #7C3AED 50%, #6D28D9 100%)',
      innerHover: 'group-hover:from-purple-400 group-hover:via-purple-500 group-hover:to-purple-700',
      iconColor: 'text-white',
      shadowColor: 'text-purple-200/50',
      shadowBox: '0 10px 25px -4px rgba(139, 92, 246, 0.45), 0 4px 10px -2px rgba(139, 92, 246, 0.25)',
    },
    // Cyan Glass
    cyan: {
      outerBg: 'linear-gradient(180deg, #BAE6FD 0%, #38BDF8 15%, #0284C7 40%, #0369A1 80%, #7DD3FC 100%)',
      innerBg: 'linear-gradient(150deg, #06B6D4 0%, #0891B2 50%, #0E7490 100%)',
      innerHover: 'group-hover:from-cyan-400 group-hover:via-cyan-500 group-hover:to-cyan-700',
      iconColor: 'text-white',
      shadowColor: 'text-cyan-200/50',
      shadowBox: '0 10px 25px -4px rgba(6, 182, 212, 0.45), 0 4px 10px -2px rgba(6, 182, 212, 0.25)',
    },
    // Rose Glass
    rose: {
      outerBg: 'linear-gradient(180deg, #FECDD3 0%, #FB7185 15%, #E11D48 40%, #BE123C 80%, #FDA4AF 100%)',
      innerBg: 'linear-gradient(150deg, #F43F5E 0%, #E11D48 50%, #BE123C 100%)',
      innerHover: 'group-hover:from-rose-400 group-hover:via-rose-500 group-hover:to-rose-700',
      iconColor: 'text-white',
      shadowColor: 'text-rose-200/50',
      shadowBox: '0 10px 25px -4px rgba(244, 63, 94, 0.45), 0 4px 10px -2px rgba(244, 63, 94, 0.25)',
    },
    // Sidebar Glass (translucent frosted on dark/blue sidebar)
    sidebar: {
      outerBg: 'linear-gradient(180deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.15) 30%, rgba(0, 0, 0, 0.1) 70%, rgba(255, 255, 255, 0.3) 100%)',
      innerBg: 'linear-gradient(150deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.1) 50%, rgba(255, 255, 255, 0.05) 100%)',
      innerHover: 'group-hover:from-white/30 group-hover:to-white/15',
      iconColor: 'text-white',
      shadowColor: 'text-white/25',
      shadowBox: '0 4px 12px rgba(0, 0, 0, 0.2), inset 0 1px 1px rgba(255, 255, 255, 0.4)',
    },
  }[variant] || {};

  const effectiveVariant = variantStyles.blue ? variantStyles : {
    outerBg: 'linear-gradient(180deg, #FFFFFF 0%, #CBD5E1 30%, #64748B 70%, #FFFFFF 100%)',
    innerBg: 'linear-gradient(150deg, #F8FAFC 0%, #E2E8F0 100%)',
    iconColor: 'text-slate-800',
    shadowColor: 'text-white/60',
    shadowBox: '0 8px 20px -4px rgba(0, 0, 0, 0.15)',
  };

  const style = variantStyles;

  return (
    <div
      onClick={onClick}
      className={`relative inline-flex items-center justify-center shrink-0 cursor-pointer group transition-transform duration-300 hover:scale-105 active:scale-95 ${sizeClasses.outer} ${className}`}
      style={{
        background: style.outerBg,
        boxShadow: style.shadowBox,
      }}
    >
      {/* Inner Lens / Glass Content */}
      <div
        className={`w-full h-full flex items-center justify-center relative overflow-hidden transition-all duration-300 ${sizeClasses.inner}`}
        style={{
          background: style.innerBg,
          boxShadow: 'inset 1px 1.5px 3px rgba(255, 255, 255, 0.6), inset -1px -1.5px 3px rgba(0, 0, 0, 0.2)',
        }}
      >
        {/* Optical Lens Refraction Shadow (Framer specular optical highlight) */}
        {Icon && (
          <div className="absolute inset-0 flex items-center justify-center translate-x-[1.2px] translate-y-[1.2px] pointer-events-none opacity-40 blur-[0.5px]">
            <Icon className={`${sizeClasses.icon} ${style.shadowColor}`} />
          </div>
        )}

        {/* Crisp Front Icon */}
        {Icon ? (
          <Icon className={`relative z-10 ${sizeClasses.icon} ${style.iconColor} ${iconClassName}`} />
        ) : (
          children
        )}
      </div>
    </div>
  );
}
