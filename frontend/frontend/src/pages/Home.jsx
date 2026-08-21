import React from 'react';
import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Tag } from '../components/ui/Tag';
import { Avatar } from '../components/ui/Avatar';
import { cn } from '../lib/utils';

export default function Home() {
  const tabs = [
    { label: 'Interesting', active: true },
    { label: 'Bountied', badge: 24 },
    { label: 'Hot' },
    { label: 'Week' },
    { label: 'Month' },
  ];

  const questions = [
    {
      id: 1,
      votes: 12,
      answers: 3,
      accepted: true,
      views: 142,
      title: "How do I resolve 'Hydration failed because the initial UI does not match what was rendered on the server'?",
      summary: "I'm building a Next.js 13 app using the app directory and Tailwind CSS. Sometimes when I load a page, I get a hydration error in the console. It seems to happen when I use dates or random numbers. How can I fix this?",
      tags: ['next.js', 'reactjs', 'hydration'],
      author: 'sarah_dev',
      authorAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=150&auto=format&fit=crop',
      askedAt: 'asked 5 mins ago',
    },
    {
      id: 2,
      votes: 0,
      answers: 1,
      accepted: false,
      views: 12,
      title: "Python Pandas: Merge two dataframes on closest datetime within a tolerance",
      summary: "I have two large pandas DataFrames containing time-series data. The timestamps don't exactly match. I need to merge them based on the nearest timestamp, but only if the difference is less than 5 minutes. pd.merge_asof seems close but I'm struggling...",
      tags: ['python', 'pandas', 'dataframe'],
      author: 'data_guy99',
      authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=150&auto=format&fit=crop',
      askedAt: 'asked 1 hour ago',
    },
    {
      id: 3,
      votes: 45,
      answers: 18,
      accepted: true,
      views: '2.3k',
      title: "What is the difference between an interface and an abstract class in TypeScript?",
      summary: "I'm moving from Java to TypeScript and I'm trying to understand the architectural differences. When should I use an `interface` over an `abstract class`? Are there performance implications or is it purely syntactic sugar for the compiler?",
      tags: ['typescript', 'oop', 'architecture'],
      author: 'ts_master',
      authorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=150&auto=format&fit=crop',
      askedAt: 'asked yesterday',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-3xl font-bold text-[#0f172a]">Top Questions</h1>
        <Link to="/ask">
          <Button variant="primary">Ask Question</Button>
        </Link>
      </div>

      <div className="flex justify-end mb-6 overflow-x-auto pb-2">
        <div className="inline-flex rounded-md shadow-sm border border-[#cbd5e1] bg-white">
          {tabs.map((tab, idx) => (
            <button
              key={tab.label}
              className={cn(
                'px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap',
                idx !== 0 && 'border-l border-[#cbd5e1]',
                tab.active 
                  ? 'bg-[#eef2ff] text-[#3b49df]' 
                  : 'text-[#475569] hover:bg-[#f8fafc]',
                idx === 0 && 'rounded-l-md',
                idx === tabs.length - 1 && 'rounded-r-md'
              )}
            >
              <div className="flex items-center gap-2">
                {tab.label}
                {tab.badge && (
                  <span className="inline-flex items-center justify-center rounded bg-[#3b49df] px-1.5 py-0.5 text-xs font-semibold text-white">
                    {tab.badge}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {questions.map((q) => (
          <div key={q.id} className="flex gap-4 p-5 rounded-lg border border-[#e2e8f0] bg-white shadow-sm transition-shadow hover:shadow-md">
            <div className="flex flex-col items-end gap-2 w-28 shrink-0 text-sm">
              <div className="font-medium text-[#0f172a]">{q.votes} votes</div>
              <div 
                className={cn(
                  'flex items-center gap-1 rounded px-1.5 py-1 font-medium',
                  q.accepted 
                    ? 'border border-[#22c55e] text-[#16a34a]' 
                    : q.answers > 0 
                      ? 'text-[#16a34a]' 
                      : 'text-[#64748b]'
                )}
              >
                {q.accepted && <Check className="h-3.5 w-3.5" />}
                {q.answers} answers
              </div>
              <div className="text-[#64748b]">{q.views} views</div>
            </div>

            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-medium text-[#2563eb] mb-2 leading-snug">
                <Link to={`/questions/${q.id}`} className="hover:text-[#1d4ed8]">
                  {q.title}
                </Link>
              </h2>
              <p className="text-sm text-[#475569] mb-4 line-clamp-2">
                {q.summary}
              </p>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap gap-2">
                  {q.tags.map((tag) => (
                    <Tag key={tag}>{tag}</Tag>
                  ))}
                </div>
                <div className="flex items-center gap-2 text-xs text-[#64748b]">
                  <Avatar src={q.authorAvatar} alt={q.author} className="h-6 w-6" />
                  <span className="font-medium text-[#0f172a]">{q.author}</span>
                  <span>{q.askedAt}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-8 flex justify-center">
        <Button variant="outline" className="text-sm font-medium">Load More</Button>
      </div>
    </div>
  );
}
