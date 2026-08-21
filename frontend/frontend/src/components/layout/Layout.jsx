import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import AuthModal from '../auth/AuthModal';

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-[#f8f9fa] text-[#0f172a]">
      <Navbar />
      <AuthModal />
      <div className="flex flex-1 max-w-[1400px] w-full mx-auto">
        <Sidebar />
        <main className="flex-1 w-full p-4 lg:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
