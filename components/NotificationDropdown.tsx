import React, { useState, useRef, useEffect } from 'react';
import { AppNotification } from '../types';

interface NotificationDropdownProps {
  notifications: AppNotification[];
  onMarkAllRead: () => void;
  onClear: () => void;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ notifications, onMarkAllRead, onClear }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = () => {
    if (!isOpen && unreadCount > 0) {
      onMarkAllRead();
    }
    setIsOpen(!isOpen);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return (
          <div className="bg-emerald-500/10 p-2 rounded-full text-emerald-400 shrink-0">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        );
      case 'error':
        return (
          <div className="bg-red-500/10 p-2 rounded-full text-red-400 shrink-0">
             <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        );
      case 'warning':
        return (
          <div className="bg-amber-500/10 p-2 rounded-full text-amber-400 shrink-0">
             <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="bg-indigo-500/10 p-2 rounded-full text-indigo-400 shrink-0">
             <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={handleToggle}
        className="relative p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 border-2 border-slate-900 rounded-full"></span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden animate-fade-in">
          <div className="p-4 border-b border-slate-800 flex justify-between items-center">
            <h3 className="font-semibold text-white text-sm">Notifications</h3>
            {notifications.length > 0 && (
                <button onClick={onClear} className="text-xs text-slate-500 hover:text-indigo-400">
                    Clear all
                </button>
            )}
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-slate-500 text-sm">No new notifications</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-800">
                {notifications.map((notif) => (
                  <div key={notif.id} className={`p-4 hover:bg-slate-800/50 transition-colors ${!notif.read ? 'bg-slate-800/20' : ''}`}>
                    <div className="flex gap-3">
                      {getIcon(notif.type)}
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-1">
                             <p className={`text-sm font-medium ${!notif.read ? 'text-white' : 'text-slate-300'}`}>
                                {notif.title}
                             </p>
                             <span className="text-xs text-slate-500 whitespace-nowrap ml-2">
                                {formatTime(notif.timestamp)}
                             </span>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          {notif.message}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="p-2 border-t border-slate-800 bg-slate-900">
             <button onClick={() => setIsOpen(false)} className="w-full py-2 text-xs text-slate-400 hover:text-white text-center">
                Close
             </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;