import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Printer, Users, UserCheck, ShoppingBag, PenTool, 
  IndianRupee, Settings, BarChart3, ArrowLeft, LogOut, 
  Shield, LayoutDashboard, Bell, FileSpreadsheet,
  ChevronLeft, ChevronRight, Menu, X, Search, Crown,
  Plus, FileText, Store, Database, ChevronDown
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import NotificationDropdown from '../components/NotificationDropdown';

export default function AdminLayout() {
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

  const menuLinks = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Manage Users', path: '/admin/students', icon: Users },
    { name: 'Manage Counters', path: '/admin/staff', icon: Store },
    { name: 'Orders & Reports', path: '/admin/orders', icon: ShoppingBag },
    { name: 'Pricing Matrix', path: '/admin/pricing', icon: IndianRupee },
    { name: 'Stationery Catalog', path: '/admin/stationery', icon: PenTool },
    { name: 'Settings', path: '/admin/settings', icon: Settings },
    { name: 'System Reports', path: '/admin/reports', icon: BarChart3 },
  ];

  const isLinkActive = (path) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="h-screen w-full bg-[#f4f6fb] text-slate-800 flex overflow-hidden relative selection:bg-emerald-500 selection:text-white font-sans">
      
      {/* ── Mobile Backdrop ────────────────────────────────────────── */}
      {mobileOpen && (
        <div 
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-[#0d0f28]/70 backdrop-blur-sm z-50 lg:hidden animate-in fade-in duration-200"
        />
      )}

      {/* ── Desktop & Mobile Midnight Sidebar (Matching Image 2) ─── */}
      <aside 
        className={`fixed lg:static top-0 bottom-0 left-0 z-50 h-screen lg:h-full flex flex-col justify-between sidebar-midnight-gradient text-white transition-all duration-300 shrink-0 ${
          collapsed ? 'w-20' : 'w-64'
        } ${
          mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Ambient Glows */}
        <div className="absolute -bottom-10 -right-10 w-44 h-44 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none" />
        <div className="absolute top-28 right-0 w-36 h-36 rounded-full bg-indigo-500/15 blur-xl pointer-events-none" />

        {/* ── TOP SECTION ── */}
        <div className="flex-1 flex flex-col min-h-0 overflow-y-auto no-scrollbar relative z-10">
          
          {/* Brand Header */}
          <div className="h-16 px-4 flex items-center justify-between border-b border-white/10 shrink-0">
            <Link to="/admin" className="flex items-center gap-3 group overflow-hidden">
              <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/20 text-white flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                <Printer className="w-5 h-5 text-white" />
              </div>
              {!collapsed && (
                <div className="flex flex-col truncate">
                  <span className="font-extrabold text-base tracking-tight text-white flex items-center gap-1">
                    Xero<span className="text-white">Xpress</span>
                  </span>
                  <span className="text-[8.5px] text-slate-400 font-bold tracking-widest uppercase">
                    ADMIN PANEL
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

          {/* Administrator Profile Card (Matching Image 2) */}
          <div className="p-3">
            <div className={`rounded-2xl border border-white/10 bg-white/5 p-3 flex items-center transition-all ${
              collapsed ? 'justify-center' : 'justify-between'
            }`}>
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 flex items-center justify-center shrink-0 shadow-2xs">
                  <Crown className="w-4 h-4 text-indigo-300" />
                </div>
                {!collapsed && (
                  <div className="truncate">
                    <p className="text-xs font-bold text-white tracking-tight">Administrator</p>
                    <p className="text-[9.5px] text-slate-400 font-medium mt-0.5">System Management</p>
                  </div>
                )}
              </div>
              {!collapsed && (
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              )}
            </div>
          </div>

          {/* MAIN MENU Label */}
          {!collapsed && (
            <div className="px-4 pt-2 pb-1">
              <span className="text-[9.5px] font-extrabold uppercase tracking-widest text-slate-400">
                MAIN MENU
              </span>
            </div>
          )}

          {/* Navigation Links */}
          <nav className="px-3 space-y-1">
            {menuLinks.map((item) => {
              const Icon = item.icon;
              const active = isLinkActive(item.path);

              return (
                <Link
                  key={item.name}
                  to={item.path}
                  title={collapsed ? item.name : undefined}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                    active
                      ? 'bg-[#ede9fe] text-slate-950 font-black shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-white/8'
                  } ${collapsed ? 'justify-center px-0' : ''}`}
                >
                  <Icon className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                    active ? 'text-indigo-900' : 'text-slate-400'
                  }`} />

                  {!collapsed && (
                    <span className="truncate flex-1">{item.name}</span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* QUICK ACTIONS Section (Matching Image 2) */}
          {!collapsed && (
            <div className="px-3 pt-5 space-y-2">
              <span className="px-1 text-[9.5px] font-extrabold uppercase tracking-widest text-slate-400 block">
                QUICK ACTIONS
              </span>
              
              {/* Add New User */}
              <Link
                to="/admin/staff"
                className="w-full py-2 px-3 rounded-xl bg-[#86efac] hover:bg-[#4ade80] text-slate-950 font-extrabold text-xs flex items-center justify-center gap-1.5 transition shadow-xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" /> Add New User
              </Link>

              {/* Generate Report */}
              <Link
                to="/admin/reports"
                className="w-full py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-slate-300" /> Generate Report
              </Link>
            </div>
          )}

          {/* Bottom Eco Campus Slogan (Matching Image 2) */}
          {!collapsed && (
            <div className="mt-auto px-4 py-4 text-center">
              <div className="flex items-center justify-center gap-1.5 text-emerald-400 mb-1">
                <span className="text-base">🍃</span>
              </div>
              <p className="text-xs italic text-emerald-400 font-serif tracking-wide leading-snug">
                “Better Management<br />Brighter Campus”
              </p>
              <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent mx-auto mt-2 rounded-full opacity-60" />
            </div>
          )}
        </div>

        {/* ── BOTTOM LOGOUT ── */}
        <div className="p-3 border-t border-white/10 shrink-0 bg-[#0d0f28]/50">
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-2.5 p-2 rounded-xl text-rose-300 hover:text-white hover:bg-rose-500/20 transition-colors text-xs font-semibold cursor-pointer ${
              collapsed ? 'justify-center' : ''
            }`}
            title="Log Out of Admin Panel"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {!collapsed && <span>Logout Session</span>}
          </button>
        </div>
      </aside>

      {/* ── MAIN DASHBOARD CANVAS (Zero Gap, Independent Scroll) ── */}
      <div className="flex-1 min-w-0 h-full flex flex-col overflow-hidden">
        
        {/* Top Header Bar (Matching Image 2) */}
        <header className="h-16 bg-white border-b border-slate-200/90 px-4 sm:px-6 flex items-center justify-between shrink-0 shadow-2xs z-20">
          
          {/* Left: Mobile Drawer Trigger + Search Bar */}
          <div className="flex items-center gap-3 flex-1 max-w-xl">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Global Search Bar (Matching Image 2) */}
            <div className="relative w-full max-w-md hidden sm:block">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search orders, students, counters..."
                className="w-full bg-[#f8fafc] hover:bg-white focus:bg-white border border-slate-200 rounded-full pl-9 pr-4 py-2 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition shadow-2xs"
              />
            </div>
          </div>

          {/* Right Header Controls (Matching Image 2) */}
          <div className="flex items-center gap-3">
            {/* Notification Bell */}
            <NotificationDropdown />

            {/* Campus Administrator Avatar Pill */}
            <div className="flex items-center gap-2.5 pl-2">
              <div className="w-8 h-8 rounded-full bg-[#22c55e] text-white font-bold text-xs flex items-center justify-center shadow-xs">
                A
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold text-slate-800 leading-none">Campus Administrator</p>
                <p className="text-[10px] text-slate-400 font-medium leading-none mt-1">System Administrator</p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
            </div>
          </div>
        </header>

        {/* Canvas Body */}
        <main className="admin-portal-canvas flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#f4f6fb]">
          <Outlet />
        </main>
      </div>

    </div>
  );
}
