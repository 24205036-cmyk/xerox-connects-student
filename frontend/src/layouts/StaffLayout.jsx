import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Printer, ListOrdered, CheckCircle2, ArrowLeft, LogOut, 
  Briefcase, Clock, ChevronLeft, ChevronRight, Menu, X, 
  Search, ShieldAlert, RefreshCw, Layers, ExternalLink
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import NotificationDropdown from '../components/NotificationDropdown';

export default function StaffLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const navLinks = [
    { 
      name: "Live Order Queue", 
      path: '/staff', 
      icon: ListOrdered, 
      badge: 'Live',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30'
    },
    { 
      name: 'Completed Orders', 
      path: '/staff/completed', 
      icon: CheckCircle2,
      badge: 'Archive',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
    },
    { 
      name: 'All Orders Log', 
      path: '/staff/orders', 
      icon: Layers 
    },
  ];

  const isLinkActive = (path) => {
    if (path === '/staff') {
      return location.pathname === '/staff' && !location.pathname.includes('/completed') && !location.pathname.includes('/orders/');
    }
    return location.pathname === path || (path === '/staff/orders' && location.pathname.startsWith('/staff/orders'));
  };

  return (
    <div className="h-screen w-full bg-[#f4f6fb] text-slate-800 flex overflow-hidden relative selection:bg-amber-500 selection:text-white font-sans">
      
      {/* ── Mobile Backdrop ────────────────────────────────────────── */}
      {mobileOpen && (
        <div 
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-[#0d0f28]/70 backdrop-blur-sm z-50 lg:hidden animate-in fade-in duration-200"
        />
      )}

      {/* ── Sidebar (Midnight Navy with Xerox Amber / Gold Accents) ── */}
      <aside 
        className={`fixed lg:static top-0 bottom-0 left-0 z-50 h-screen lg:h-full flex flex-col justify-between sidebar-midnight-gradient text-white transition-all duration-300 shrink-0 ${
          collapsed ? 'w-20' : 'w-64'
        } ${
          mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Subtle Ambient Brand Glows */}
        <div className="absolute -bottom-10 -right-10 w-44 h-44 rounded-full bg-amber-500/10 blur-2xl pointer-events-none" />
        <div className="absolute top-20 right-0 w-36 h-36 rounded-full bg-indigo-500/15 blur-xl pointer-events-none" />

        {/* ── TOP SECTION ── */}
        <div className="flex-1 flex flex-col min-h-0 overflow-y-auto no-scrollbar relative z-10">
          
          {/* Brand Header */}
          <div className="h-16 px-4 flex items-center justify-between border-b border-white/10 shrink-0">
            <Link to="/staff" className="flex items-center gap-2.5 group overflow-hidden">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-amber-500/25 group-hover:scale-105 transition-transform">
                <Printer className="w-4.5 h-4.5 text-white" />
              </div>
              {!collapsed && (
                <div className="flex flex-col truncate">
                  <span className="font-extrabold text-base tracking-tight text-white flex items-center gap-1">
                    Xero<span className="text-amber-400">Xpress</span>
                  </span>
                  <span className="text-[8.5px] text-amber-300/80 font-bold tracking-widest uppercase">
                    Staff Dispatch Counter
                  </span>
                </div>
              )}
            </Link>

            {/* Desktop Collapse Toggle */}
            <button
              onClick={() => setCollapsed(!collapsed)}
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              className="hidden lg:flex w-6.5 h-6.5 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white items-center justify-center transition-all cursor-pointer border border-white/15 shadow-xs shrink-0"
            >
              {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
            </button>

            {/* Mobile Close Button */}
            <button
              onClick={() => setMobileOpen(false)}
              className="lg:hidden p-1.5 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Counter Station Status Pill */}
          <div className="p-3">
            <div className={`rounded-xl border border-amber-500/20 bg-amber-500/10 p-2.5 flex items-center transition-all ${
              collapsed ? 'justify-center' : 'gap-2.5'
            }`}>
              <div className="relative flex h-2.5 w-2.5 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </div>
              {!collapsed && (
                <div className="truncate leading-none">
                  <p className="text-[11px] font-bold text-white tracking-tight">Counter Station #1</p>
                  <p className="text-[9.5px] text-amber-300 font-medium mt-0.5">Online · Queue Active</p>
                </div>
              )}
            </div>
          </div>

          {/* Nav Links */}
          <nav className="px-3 py-2 space-y-1">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const active = isLinkActive(item.path);

              return (
                <Link
                  key={item.name}
                  to={item.path}
                  title={collapsed ? item.name : undefined}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                    active
                      ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                      : 'text-slate-300 hover:text-white hover:bg-white/8'
                  } ${collapsed ? 'justify-center px-0' : ''}`}
                >
                  <Icon className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                    active ? 'text-slate-950' : 'text-amber-400/90'
                  }`} />

                  {!collapsed && (
                    <span className="truncate flex-1">{item.name}</span>
                  )}

                  {!collapsed && item.badge && (
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-extrabold uppercase tracking-wider border ${
                      active ? 'bg-slate-950/20 text-slate-950 border-slate-950/30' : item.badgeColor
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Quick Jump: Student Portal Preview */}
          <div className="mt-auto px-3 py-3 border-t border-white/10">
            <Link
              to="/student"
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-colors ${
                collapsed ? 'justify-center px-0' : ''
              }`}
              title={collapsed ? "Go to Student Portal" : undefined}
            >
              <ExternalLink className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              {!collapsed && <span className="truncate">Student Portal</span>}
            </Link>
          </div>
        </div>

        {/* ── BOTTOM PROFILE & LOGOUT SECTION ── */}
        <div className="p-3 border-t border-white/10 shrink-0 relative z-10 bg-[#0d0f28]/40">
          <div className={`flex items-center gap-2.5 p-2 rounded-xl bg-white/5 border border-white/10 ${
            collapsed ? 'justify-center' : ''
          }`}>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 to-orange-500 text-slate-950 font-black text-xs flex items-center justify-center shrink-0 shadow-xs">
              {user?.name?.charAt(0) || 'S'}
            </div>

            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white truncate leading-snug">
                  {user?.name || 'Staff Operator'}
                </p>
                <span className="text-[10px] text-amber-300/90 font-medium block truncate">
                  Counter Operator
                </span>
              </div>
            )}

            <button
              onClick={handleLogout}
              title="Sign Out"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* ── MAIN DASHBOARD CANVAS (Zero Gap, Independent Scroll) ── */}
      <div className="flex-1 min-w-0 h-full flex flex-col overflow-hidden">
        
        {/* Modern Canvas Header */}
        <header className="h-16 bg-white border-b border-slate-200/90 px-4 sm:px-6 flex items-center justify-between shrink-0 shadow-2xs z-20">
          
          <div className="flex items-center gap-3">
            {/* Mobile Sidebar Hamburger Toggle */}
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Breadcrumb / Title */}
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                  Operations Console
                </span>
                <span className="hidden sm:inline-block text-xs text-slate-400 font-semibold">/</span>
                <h2 className="hidden sm:inline-block text-sm font-bold text-slate-800 tracking-tight">
                  Xerox Counter Station
                </h2>
              </div>
            </div>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-3">
            {/* Notifications Dropdown */}
            <NotificationDropdown />

            {/* Staff Pill */}
            <div className="flex items-center gap-2 pl-3 border-l border-slate-200">
              <div className="w-7 h-7 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs flex items-center justify-center">
                {user?.name?.charAt(0) || 'S'}
              </div>
              <div className="hidden md:block text-left text-xs">
                <p className="font-bold text-slate-800 leading-none truncate max-w-[120px]">{user?.name || 'Staff'}</p>
                <p className="text-[10px] text-amber-600 font-semibold leading-none mt-1">Xerox Operator</p>
              </div>
            </div>
          </div>
        </header>

        {/* Canvas Body (Independently Scrollable) */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#f4f6fb]">
          <Outlet />
        </main>
      </div>

    </div>
  );
}
