import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const { openAddTaskModal, isLiveMode } = useData();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: 'dashboard' },
    { name: 'Tasks', path: '/tasks', icon: 'check_circle' },
    { name: 'Subjects', path: '/subjects', icon: 'menu_book' },
    { name: 'Progress', path: '/progress', icon: 'trending_up' },
  ];

  const fullName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Maya Lin';
  const avatarUrl =
    user?.user_metadata?.avatar_url ||
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDIsb2yz-toUh5eZbUaQ8wGVm1M4t551hoIPiTP6Ky4MfJYH_kWtL2z3Wh53YpT3SX5XMpe6bVN223akLA7w2mVwDo90ad-pnP-jrULy2LhAWDLbthCewB7I_ORdy0Et3Jdry6X2W3sfNaCWuJyE10nVM1xs8gTzz0If6YNlKB6Gux8xJfNV4MGx3R04Nmzgg6gEIByUAEePcqddTtzyTMN96KdryJqEAscjtPrgmCRCrzRezjliIaahw';

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-surface-container-lowest z-50 flex flex-col justify-between shadow-[0_1px_8px_rgba(0,0,0,0.04)] select-none">
      <div className="flex flex-col">
        {/* Brand Header */}
        <div className="h-16 flex items-center gap-3 px-space-lg border-b border-surface-container-low/60">
          <img
            alt="StudyFlow Brand Logo"
            className="h-8 w-auto object-contain"
            src="https://lh3.googleusercontent.com/aida/AEtjO1ULcoEW6hopLXMyZf9KFbFElv9uKUPATyi0fYwup3oxYIAYXeVYJKD6k388hlBaz4VZ9eE70VxLJLLEYj3H0dopErfvER6xliYTYu3CDLbJo1dfUfmHEflLFy76E_xUHW7z6P92OgR0dL9Kf8rbwa7KGpoudzWqfWkBY6GmG_PARjezsIhItz0DzmAVQjpIgKnAwIg4sCNcZRLSpfQGe9P92FVUu8p_eP8K63uiheVe2DgnBDC07_btXqhW"
          />
          <span className="font-title-md text-title-md text-primary tracking-tight font-bold">StudyFlow</span>
          <span className="bg-secondary-fixed text-on-secondary-fixed font-label-sm text-label-sm px-2 py-0.5 rounded-full font-semibold">
            Student Pro
          </span>
        </div>

        {/* Semester Status Indicator */}
        <div className="px-space-md py-space-xs">
          <div className="bg-surface-container-low rounded-xl p-space-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[18px]">calendar_month</span>
              <span className="font-label-md text-label-md text-on-surface font-medium">Fall Semester 2025</span>
            </div>
            <span
              className={`w-2 h-2 rounded-full ${isLiveMode ? 'bg-tertiary-container' : 'bg-secondary'}`}
              title={isLiveMode ? 'Live Backend Connected' : 'Local Workspace Active'}
            />
          </div>
        </div>

        {/* Add Task Primary Action */}
        <div className="px-space-md pt-space-xs">
          <button
            onClick={() => openAddTaskModal()}
            className="w-full bg-primary-container text-on-primary font-label-md text-label-md py-2.5 px-space-md rounded-xl flex items-center justify-center gap-2 shadow-[0_1px_8px_rgba(0,0,0,0.04)] hover:bg-primary hover:text-on-primary transition-colors cursor-pointer group"
          >
            <span className="material-symbols-outlined text-[18px] group-hover:rotate-90 transition-transform">add</span>
            <span className="font-semibold">Add Task</span>
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex flex-col gap-1 px-space-md pt-space-md">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-space-md py-2.5 rounded-xl transition-all ${
                  isActive
                    ? 'bg-primary-container text-on-primary font-title-md shadow-sm'
                    : 'font-label-md text-label-md text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                }`
              }
            >
              <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      {/* User Profile Widget & Menu */}
      <div className="p-space-md relative">
        {showProfileMenu && (
          <div className="absolute bottom-20 left-4 right-4 bg-surface-container-lowest rounded-xl shadow-xl border border-surface-container p-2 flex flex-col gap-1 z-50 animate-in fade-in zoom-in-95">
            <div className="px-3 py-2 border-b border-surface-container">
              <p className="font-label-md text-label-md text-on-surface font-semibold">{fullName}</p>
              <p className="font-body-sm text-body-sm text-on-surface-variant truncate">{user?.email}</p>
            </div>
            <button
              onClick={() => {
                setShowProfileMenu(false);
                navigate('/tasks');
              }}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-on-surface hover:bg-surface-container-low font-label-md text-label-md text-left transition-colors"
            >
              <span className="material-symbols-outlined text-[18px] text-primary">task</span>
              <span>My Tasks</span>
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-error hover:bg-error-container/30 font-label-md text-label-md text-left transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">logout</span>
              <span>Sign Out</span>
            </button>
          </div>
        )}

        <div
          onClick={() => setShowProfileMenu((prev) => !prev)}
          className="bg-surface-container-low hover:bg-surface-container transition-colors cursor-pointer rounded-xl p-space-sm flex items-center gap-3"
        >
          <div className="relative">
            <img alt="Profile" className="w-8 h-8 rounded-full object-cover" src={avatarUrl} />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-tertiary-container rounded-full" />
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="font-label-md text-label-md text-on-surface truncate font-semibold">{fullName}</span>
            <span className="font-body-sm text-body-sm text-on-surface-variant truncate">Computer Science</span>
          </div>
          <span className="material-symbols-outlined text-on-surface-variant text-[18px]">
            {showProfileMenu ? 'expand_less' : 'more_vert'}
          </span>
        </div>
      </div>
    </aside>
  );
};
