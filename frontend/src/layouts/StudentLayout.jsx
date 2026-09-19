import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Home, Printer, FileText, ArrowLeftRight, Clock, User,
  Plus, LogOut, ChevronDown, ChevronLeft, ChevronRight,
  Menu, X, Bell
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import NotificationDropdown from '../components/NotificationDropdown';

export default function StudentLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const links = [
    { name: 'Dashboard', path: '/student', icon: Home },
    { name: 'New Print Order', path: '/student/new-order', icon: FileText },
    { name: 'Document Converter', path: '/student/document-converter', icon: ArrowLeftRight },
    { name: 'Order History', path: '/student/history', icon: Clock },
    { name: 'My Profile', path: '/student/profile', icon: User },
  ];

  const isLinkActive = (path) => {
    if (path === '/student') {
      return location.pathname === '/student';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="h-screen w-full bg-[#f4f6fb] text-slate-800 flex overflow-hidden relative selection:bg-indigo-600 selection:text-white font-sans">
      {/* ── Mobile Backdrop Overlay ─────────────────────────────── */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-[#0d0f28]/70 backdrop-blur-sm z-50 lg:hidden animate-in fade-in duration-200"
        />
      )}

      {/* ── Desktop & Mobile Midnight Sidebar (Permanent Full Height & Visible on Scroll) ── */}
      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-50 h-screen lg:h-full flex flex-col justify-between sidebar-midnight-gradient text-white transition-all duration-300 shrink-0 ${collapsed ? 'w-20' : 'w-64'
          } ${mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'
          }`}
      >
        {/* Decorative Ambient Cyan Glow at bottom right of sidebar */}
        <div className="absolute -bottom-10 -right-10 w-44 h-44 rounded-full bg-cyan-400/15 blur-2xl pointer-events-none" />
        <div className="absolute bottom-10 right-0 w-36 h-36 rounded-full bg-indigo-500/15 blur-xl pointer-events-none" />

        {/* ── TOP SECTION ── */}
        <div className="flex-1 flex flex-col min-h-0 overflow-y-auto no-scrollbar relative z-10">
          {/* Sidebar Brand Header */}
          <div className="h-16 px-4 flex items-center justify-between border-b border-white/10 shrink-0">
            <Link to="/student" className="flex items-center gap-2.5 group overflow-hidden">
              {/* White outline clean printer logo */}
              <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/20 text-white flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                <Printer className="w-4.5 h-4.5 text-white" />
              </div>
              {!collapsed && (
                <div className="flex flex-col truncate">
                  <span className="font-extrabold text-base tracking-tight text-white flex items-center gap-1">
                    Xero <span className="text-white">Xpress</span>
                  </span>
                  <span className="text-[8.5px] text-slate-400 font-bold tracking-widest uppercase mt-0.5">

                  </span>
                </div>
              )}
            </Link>

            {/* Desktop collapse toggle */}
            <button
              onClick={() => setCollapsed(!collapsed)}
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              className="hidden lg:flex w-6.5 h-6.5 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white items-center justify-center transition-all cursor-pointer border border-white/15 shadow-xs shrink-0"
            >
              {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
            </button>

            {/* Mobile close button */}
            <button
              onClick={() => setMobileOpen(false)}
              className="lg:hidden p-1.5 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Primary Navigation Links */}
          <div className="py-2 px-2.5 space-y-0.5 shrink-0">
            {!collapsed && (
              <p className="px-3 pt-1.5 pb-1 text-[9.5px] font-bold uppercase tracking-wider text-slate-400">
                Main Navigation
              </p>
            )}

            {links.map((item) => {
              const Icon = item.icon;
              const active = isLinkActive(item.path);

              return (
                <Link
                  key={item.name}
                  to={item.path}
                  title={collapsed ? item.name : undefined}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all group ${active
                    ? 'bg-[#f1f0fc] text-[#1e144a] font-bold shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                    } ${collapsed ? 'justify-center p-2.5' : ''}`}
                >
                  <Icon className={`w-4 h-4 shrink-0 transition-colors ${active ? 'text-[#6366f1]' : 'text-slate-400 group-hover:text-white'
                    }`} />

                  {!collapsed && (
                    <span className="truncate">{item.name}</span>
                  )}
                </Link>
              );
            })}

            {/* Quick Order Action CTA in Sidebar */}
            {!collapsed && (
              <div className="pt-2 px-0.5">
                <Link
                  to="/student/new-order"
                  className="w-full bg-[#f1f0fc] hover:bg-white text-[#1e144a] flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl text-xs font-bold transition-all shadow-xs cursor-pointer hover:scale-[1.01]"
                >
                  <div className="w-4.5 h-4.5 rounded-md bg-[#6366f1] text-white flex items-center justify-center shrink-0">
                    <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  </div>
                  <span>New Print Order</span>
                </Link>
              </div>
            )}

          </div>
        </div>

        {/* ── BOTTOM SECTION: Student Profile & Logout (Pinned to bottom) ── */}
        <div className="p-2.5 border-t border-white/10 bg-black/20 relative z-10 shrink-0">
          {!collapsed ? (
            <div className="space-y-1.5">
              {/* User profile card */}
              <div className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7.5 h-7.5 rounded-full bg-[#6366f1] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                    {user?.name?.charAt(0) || 'I'}
                  </div>
                  <div className="truncate">
                    <p className="font-bold text-white text-xs leading-tight truncate">
                      {user?.name || 'Infhant'}
                    </p>
                    <p className="text-[10px] text-slate-400 leading-tight truncate mt-0.5">
                      {user?.register_number || '24260562'}
                    </p>
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              </div>

              {/* Logout Action Button */}
              <button
                onClick={handleLogout}
                title="Logout"
                className="w-full flex items-center justify-center gap-2 py-1.5 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold transition-all cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 py-1">
              <div className="w-8 h-8 rounded-full bg-[#6366f1] text-white flex items-center justify-center font-bold text-xs" title={user?.name || 'Infhant'}>
                {user?.name?.charAt(0) || 'I'}
              </div>
              <button
                onClick={handleLogout}
                title="Logout"
                className="p-1.5 rounded-xl text-rose-400 hover:bg-rose-500/20 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* ── Main Dashboard Canvas (Independent scroll, sidebar stays 100% pinned) ── */}
      <div className="flex-1 min-w-0 h-full overflow-y-auto flex flex-col transition-all duration-300 bg-[#f4f6fb]">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-40 h-15 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 lg:px-7 flex items-center justify-between shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="flex items-center gap-3">
            {/* Mobile Hamburger Trigger */}
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Breadcrumb / Title matching reference: Student > Dashboard */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500 font-medium hidden sm:inline">Student</span>
              <span className="text-slate-400 font-semibold hidden sm:inline">&gt;</span>
              <span className="font-bold text-slate-900 text-sm">Dashboard</span>
            </div>
          </div>

          {/* Right Header Utilities matching reference */}
          <div className="flex items-center gap-2.5 text-xs">
            {/* Orders Open pill */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Orders Open (08:30 AM - 07:00 PM)</span>
            </div>

            {/* Notification Dropdown / Dark Bell Button */}
            <NotificationDropdown />

            {/* Quick action: + New Order */}
            <Link
              to="/student/new-order"
              className="hidden md:flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#4f46e5] hover:bg-[#4338ca] text-white font-bold text-xs shadow-sm shadow-indigo-500/20 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>New Order</span>
            </Link>

            {/* User Profile Pill matching reference */}
            <Link
              to="/student/profile"
              className="flex items-center gap-2 p-0.5 sm:pr-2.5 rounded-full hover:bg-slate-100 transition-colors"
            >
              <div className="w-7.5 h-7.5 rounded-full bg-[#6366f1] text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-xs">
                {user?.name?.charAt(0) || 'I'}
              </div>
              <span className="hidden sm:inline font-bold text-slate-800 text-xs truncate max-w-[120px]">
                {user?.name || 'Infhant'}
              </span>
            </Link>
          </div>
        </header>

        {/* Page Content Outlet in Bright White Canvas (Eliminates excessive gaps near sidebar) */}
        <main className="student-portal-canvas flex-1 w-full p-4 sm:p-5 lg:p-6 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
