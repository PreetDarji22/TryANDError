import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Tags, Users } from 'lucide-react';
import { cn } from '../../lib/utils';

export default function Sidebar() {
  const location = useLocation();

  const navItems = [
    { icon: Home, label: 'Home', href: '/' },
    { icon: Tags, label: 'Tags', href: '/tags' },
    { icon: Users, label: 'Users', href: '/users/1' }, // Dummy route for profile
  ];

  return (
    <aside className="w-64 shrink-0 border-r border-[#e2e8f0] bg-[#f8f9fa] hidden md:block">
      <div className="py-6 px-4">
        <div className="mb-2 px-4 text-xs font-semibold text-[#64748b] uppercase tracking-wider">
          Navigation
        </div>
        <div className="mb-4 px-4 text-sm text-[#475569]">
          Explore StackIt
        </div>
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href || (item.href !== '/' && location.pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-md px-4 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-[#eef2ff] text-[#3b49df] font-semibold'
                    : 'text-[#475569] hover:bg-[#f1f5f9] hover:text-[#0f172a]'
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
