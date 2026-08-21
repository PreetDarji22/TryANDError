import React from 'react';
import { Link } from 'react-router-dom';
import { Search, Bell } from 'lucide-react';
import { Avatar } from '../ui/Avatar';
import { Input } from '../ui/Input';

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 flex h-14 items-center justify-between border-b border-[#e2e8f0] bg-white px-4 lg:px-6">
      <div className="flex items-center gap-4 w-64 shrink-0">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex items-center justify-center bg-[#3b49df] p-1 rounded-sm">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-white">
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </div>
          <span className="text-xl font-bold tracking-tight text-[#0f172a]">StackIt</span>
        </Link>
      </div>
      
      <div className="flex flex-1 items-center justify-center px-4 max-w-3xl">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94a3b8]" />
          <Input 
            className="w-full pl-9 bg-[#f8f9fa] border-[#e2e8f0] focus:bg-white" 
            placeholder="Search..." 
          />
        </div>
      </div>

      <div className="flex items-center gap-4 shrink-0 justify-end w-48">
        <button className="text-[#64748b] hover:text-[#0f172a] transition-colors relative">
          <Bell className="h-5 w-5" />
        </button>
        <Link to="/users/1">
          <Avatar 
            src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop" 
            alt="AlexDeveloper" 
          />
        </Link>
      </div>
    </header>
  );
}
