import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Search, Bell, LogIn, UserPlus, LogOut, CheckCheck, User, MessageSquare, AlertCircle, AtSign } from 'lucide-react';
import { Avatar } from '../ui/Avatar';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';

export default function Navbar() {
  const { user, logout, openAuthModal } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const notifRef = useRef(null);

  // Sync search input with URL search param
  useEffect(() => {
    setSearchTerm(searchParams.get('search') || '');
  }, [searchParams]);

  // Fetch unread count when user is logged in
  useEffect(() => {
    if (!user) {
      setUnreadCount(0);
      setNotifications([]);
      return;
    }

    async function fetchUnread() {
      try {
        const res = await api.getUnreadNotificationsCount();
        setUnreadCount(res.unread_count);
      } catch (err) {
        console.error('Failed to fetch unread count:', err);
      }
    }

    fetchUnread();
    const interval = setInterval(fetchUnread, 15000); // Polling every 15s
    return () => clearInterval(interval);
  }, [user]);

  // Handle Notifications Dropdown toggle
  const toggleNotifications = async () => {
    if (!user) {
      openAuthModal('login');
      return;
    }

    const nextState = !isNotifOpen;
    setIsNotifOpen(nextState);

    if (nextState) {
      try {
        const res = await api.getNotifications({ limit: 10 });
        setNotifications(res.notifications);
      } catch (err) {
        console.error('Failed to fetch notifications:', err);
      }
    }
  };

  // Mark all read
  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (err) {
      console.error('Failed to mark all notifications read:', err);
    }
  };

  // Click single notification
  const handleNotificationClick = async (notif) => {
    try {
      if (!notif.is_read) {
        await api.markNotificationRead(notif.id);
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      setIsNotifOpen(false);
      if (notif.reference_url) {
        navigate(notif.reference_url);
      }
    } catch (err) {
      console.error('Error opening notification:', err);
    }
  };

  // Search submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/?search=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      navigate('/');
    }
  };

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-[#e2e8f0] bg-white px-4 lg:px-6 shadow-2xs">
      <div className="flex items-center gap-4 w-64 shrink-0">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex items-center justify-center bg-[#3b49df] p-1.5 rounded-md text-white font-bold">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </div>
          <span className="text-xl font-bold tracking-tight text-[#0f172a]">StackIt</span>
        </Link>
      </div>

      {/* Search Input */}
      <form onSubmit={handleSearchSubmit} className="flex flex-1 items-center justify-center px-4 max-w-2xl">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94a3b8]" />
          <Input 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 bg-[#f8f9fa] border-[#cbd5e1] focus:bg-white text-sm" 
            placeholder="Search questions or tags..." 
          />
        </div>
      </form>

      {/* Action Navigation */}
      <div className="flex items-center gap-3 shrink-0 justify-end">
        {/* Notification Bell */}
        <div className="relative" ref={notifRef}>
          <button 
            onClick={toggleNotifications}
            className="text-[#64748b] hover:text-[#0f172a] p-2 rounded-full hover:bg-[#f1f5f9] transition-colors relative"
            title="Notifications"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl border border-[#e2e8f0] bg-white shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between px-4 py-2 border-b border-[#e2e8f0]">
                <h3 className="font-semibold text-[#0f172a] text-sm">Notifications</h3>
                {unreadCount > 0 && (
                  <button 
                    onClick={handleMarkAllRead}
                    className="text-xs text-[#3b49df] hover:underline flex items-center gap-1 font-medium"
                  >
                    <CheckCheck className="h-3.5 w-3.5" /> Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-[#f1f5f9]">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-[#64748b]">
                    No notifications yet.
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div 
                      key={notif.id}
                      onClick={() => handleNotificationClick(notif)}
                      className={`p-3.5 text-xs hover:bg-[#f8fafc] cursor-pointer transition-colors flex gap-3 items-start ${!notif.is_read ? 'bg-[#eff6ff]/60' : ''}`}
                    >
                      <div className="mt-0.5 p-1 rounded bg-[#eef2ff] text-[#3b49df] shrink-0">
                        {notif.type === 'NEW_ANSWER' && <MessageSquare className="h-4 w-4" />}
                        {notif.type === 'NEW_COMMENT' && <MessageSquare className="h-4 w-4" />}
                        {notif.type === 'MENTION' && <AtSign className="h-4 w-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[#1e293b] leading-snug">
                          <span className="font-semibold text-[#0f172a]">@{notif.actor.username}</span>{' '}
                          {notif.type === 'NEW_ANSWER' && 'answered your question.'}
                          {notif.type === 'NEW_COMMENT' && 'commented on your answer.'}
                          {notif.type === 'MENTION' && 'mentioned you in a post.'}
                        </p>
                        <span className="text-[10px] text-[#94a3b8] mt-1 block">
                          {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      {!notif.is_read && <span className="h-2 w-2 rounded-full bg-[#3b49df] mt-1.5 shrink-0" />}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Auth Section */}
        {user ? (
          <div className="relative">
            <button 
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-2 p-1 rounded-full hover:bg-[#f1f5f9] transition-colors"
            >
              <Avatar alt={user.username} className="h-8 w-8 bg-[#3b49df] text-white font-bold text-sm" />
            </button>

            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-lg border border-[#e2e8f0] bg-white shadow-lg py-1 z-50">
                <div className="px-4 py-2 border-b border-[#f1f5f9]">
                  <p className="text-xs font-semibold text-[#0f172a]">@{user.username}</p>
                  <p className="text-[11px] text-[#64748b] truncate">{user.email}</p>
                  <span className="inline-block text-[10px] font-bold text-[#3b49df] bg-[#eef2ff] px-1.5 py-0.5 rounded mt-1">
                    {user.role}
                  </span>
                </div>
                <Link 
                  to={`/users/${user.id}`}
                  onClick={() => setIsUserMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 text-xs text-[#334155] hover:bg-[#f8fafc]"
                >
                  <User className="h-4 w-4" /> Profile & Activity
                </Link>
                <button
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    logout();
                  }}
                  className="w-full text-left flex items-center gap-2 px-4 py-2 text-xs text-red-600 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" /> Sign Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => openAuthModal('login')}
              className="text-xs flex items-center gap-1.5"
            >
              <LogIn className="h-3.5 w-3.5" /> Sign In
            </Button>
            <Button 
              variant="primary" 
              size="sm" 
              onClick={() => openAuthModal('register')}
              className="text-xs flex items-center gap-1.5"
            >
              <UserPlus className="h-3.5 w-3.5" /> Sign Up
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
