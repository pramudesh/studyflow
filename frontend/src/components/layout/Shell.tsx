import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { AddTaskModal } from '../tasks/AddTaskModal';
import { QuickStudyModal } from '../timer/QuickStudyModal';

export const Shell: React.FC = () => {
  return (
    <div className="min-h-screen bg-background text-on-surface flex">
      {/* Fixed Left Navigation */}
      <Sidebar />

      {/* Main Container */}
      <div className="flex-1 pl-64 flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 pt-16">
          <Outlet />
        </main>
      </div>

      {/* Global Modals */}
      <AddTaskModal />
      <QuickStudyModal />
    </div>
  );
};
