import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Tags, Users, Hash } from 'lucide-react';
import { cn } from '../../lib/utils';
import { api } from '../../lib/api';

export default function Sidebar() {
  const location = useLocation();
  const [popularTags, setPopularTags] = useState([]);

  useEffect(() => {
    async function loadTags() {
      try {
        const res = await api.getTags();
        setPopularTags((res.tags || []).slice(0, 8));
      } catch (err) {
        console.error('Error loading sidebar tags:', err);
      }
    }
    loadTags();
  }, []);

  const navItems = [
    { icon: Home, label: 'Home', href: '/' },
  ];

  return (
    <aside className="w-64 shrink-0 border-r border-[#e2e8f0] bg-[#f8f9fa] hidden md:block min-h-[calc(100vh-3.5rem)]">
      <div className="py-6 px-4">
        <div className="mb-2 px-4 text-xs font-semibold text-[#64748b] uppercase tracking-wider">
          Navigation
        </div>
        <nav className="space-y-1 mb-6">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
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

        {/* Popular Tags */}
        <div className="px-4">
          <div className="mb-2 text-xs font-semibold text-[#64748b] uppercase tracking-wider flex items-center justify-between">
            <span>Popular Tags</span>
            <Hash className="h-3 w-3 text-[#94a3b8]" />
          </div>
          <div className="space-y-1 mt-2">
            {popularTags.map((tag) => (
              <Link
                key={tag.id}
                to={`/?tag=${encodeURIComponent(tag.name)}`}
                className="flex items-center justify-between text-xs font-medium text-[#475569] hover:text-[#3b49df] hover:bg-[#eef2ff] px-2 py-1.5 rounded transition-colors"
              >
                <span className="truncate">#{tag.name}</span>
                <span className="text-[10px] bg-[#e2e8f0] text-[#475569] px-1.5 py-0.2 rounded-full">
                  {tag.question_count}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
