import React, { useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';

export const Header: React.FC = () => {
  const { user } = useAuth();
  const { toggleQuickTimer } = useData();
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const todayFormatted = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  }).format(new Date());

  const avatarUrl =
    user?.user_metadata?.avatar_url ||
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDIsb2yz-toUh5eZbUaQ8wGVm1M4t551hoIPiTP6Ky4MfJYH_kWtL2z3Wh53YpT3SX5XMpe6bVN223akLA7w2mVwDo90ad-pnP-jrULy2LhAWDLbthCewB7I_ORdy0Et3Jdry6X2W3sfNaCWuJyE10nVM1xs8gTzz0If6YNlKB6Gux8xJfNV4MGx3R04Nmzgg6gEIByUAEePcqddTtzyTMN96KdryJqEAscjtPrgmCRCrzRezjliIaahw';

  return (
    <header className="fixed top-0 left-64 right-0 h-16 bg-surface-container-lowest/90 backdrop-blur-xl z-40 shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-b border-surface-container-low/60">
      <div className="w-full h-16 px-space-lg flex items-center justify-between">
        {/* Search Bar with Shortcut */}
        <div className="flex items-center gap-space-lg flex-1 max-w-xl">
          <div className="relative w-full">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">
              search
            </span>
            <input
              ref={searchInputRef}
              className="w-full bg-surface-container-low text-on-surface placeholder:text-on-surface-variant font-body-sm text-body-sm pl-10 pr-12 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-container transition-all"
              placeholder="Search tasks, notes, subjects... ⌘K"
              type="text"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 bg-surface-container-highest text-on-surface-variant font-label-sm text-label-sm px-1.5 py-0.5 rounded shadow-xs">
              ⌘K
            </span>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-space-md">
          {/* Today Date Pill */}
          <div className="hidden md:flex items-center gap-1.5 bg-surface-container-low px-space-sm py-1.5 rounded-xl">
            <span className="material-symbols-outlined text-on-surface-variant text-[16px]">today</span>
            <span className="font-label-md text-label-md text-on-surface font-medium">{todayFormatted}</span>
          </div>

          {/* Notifications Button */}
          <button
            aria-label="Notifications"
            className="relative p-2 rounded-xl text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">notifications</span>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error rounded-full animate-pulse" />
          </button>

          {/* Quick Study Button */}
          <button
            onClick={toggleQuickTimer}
            className="bg-secondary text-on-secondary font-label-md text-label-md px-space-md py-2 rounded-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] hover:bg-secondary-container hover:text-on-secondary-container transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <span className="material-symbols-outlined text-[16px]">timer</span>
            <span className="font-semibold">Quick Study</span>
          </button>

          {/* User Profile Avatar */}
          <div className="flex items-center pl-space-xs">
            <img alt="Profile" className="w-8 h-8 rounded-full object-cover ring-2 ring-primary/20" src={avatarUrl} />
          </div>
        </div>
      </div>
    </header>
  );
};
