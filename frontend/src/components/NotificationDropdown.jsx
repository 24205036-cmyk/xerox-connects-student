import React, { useState, useEffect, useRef } from 'react';
import { Bell, CheckCheck, Clock, CheckCircle2, AlertTriangle, ExternalLink, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function NotificationDropdown() {
  const { isAuthenticated, user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const fetchNotifs = async () => {
    if (!isAuthenticated) return;
    try {
      const res = await getNotifications();
      setNotifications(res.data || []);
      setUnreadCount(res.unreadCount || 0);
    } catch (err) {
      console.warn('Failed to load notifications:', err.message);
    }
  };

  useEffect(() => {
    fetchNotifs();
    // Poll every 30 seconds for live updates
    const interval = setInterval(fetchNotifs, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const handleNotificationClick = async (notif) => {
    if (!notif.is_read) {
      try {
        await markNotificationAsRead(notif.id);
        setUnreadCount((c) => Math.max(0, c - 1));
        setNotifications((prev) =>
          prev.map((n) => (n.id === notif.id ? { ...n, is_read: true } : n))
        );
      } catch (err) {
        console.error(err);
      }
    }

    setIsOpen(false);
    if (notif.order_id) {
      if (user?.role === 'STUDENT') {
        navigate(`/student/orders/${notif.order_id}`);
      } else if (user?.role === 'XEROX_STAFF') {
        navigate(`/staff/orders/${notif.order_id}`);
      }
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-9 h-9 rounded-xl bg-[#2e1065] hover:bg-[#3b177e] text-white flex items-center justify-center shadow-xs transition-colors focus:outline-none cursor-pointer"
        aria-label="Notifications"
      >
        <Bell className="w-4 h-4 text-white" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl glass-panel border border-slate-800 shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="p-3.5 border-b border-slate-800/80 flex items-center justify-between bg-slate-950/80">
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Notifications
              </h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-[10px] font-semibold">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-[11px] font-medium text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer"
              >
                <CheckCheck className="w-3.5 h-3.5" /> Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/50">
            {notifications.length > 0 ? (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`p-3.5 transition-colors cursor-pointer hover:bg-slate-800/60 flex items-start gap-3 ${
                    !notif.is_read ? 'bg-blue-950/20' : 'bg-transparent'
                  }`}
                >
                  <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                    !notif.is_read ? 'bg-blue-400' : 'bg-transparent'
                  }`} />
                  <div className="flex-1 space-y-1">
                    <p className="text-xs font-semibold text-white leading-snug">
                      {notif.title}
                    </p>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      {notif.message}
                    </p>
                    <div className="flex items-center justify-between pt-1 text-[10px] text-slate-500">
                      <span>{new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      {notif.order_id && (
                        <span className="text-blue-400 flex items-center gap-0.5">
                          View Order <ExternalLink className="w-2.5 h-2.5" />
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-slate-500 text-xs">
                <Bell className="w-6 h-6 mx-auto mb-2 text-slate-600" />
                No notifications right now.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
