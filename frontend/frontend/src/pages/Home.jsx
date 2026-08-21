import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Check, Search, X, Loader2, MessageSquarePlus } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Tag } from '../components/ui/Tag';
import { Avatar } from '../components/ui/Avatar';
import { cn } from '../lib/utils';
import { api } from '../lib/api';

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeSearch = searchParams.get('search') || '';
  const activeTag = searchParams.get('tag') || '';

  const [sortTab, setSortTab] = useState('newest'); // 'newest' | 'answers' | 'oldest'
  const [questions, setQuestions] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);

  const tabs = [
    { key: 'newest', label: 'Newest' },
    { key: 'answers', label: 'Most Answered' },
    { key: 'oldest', label: 'Oldest' },
  ];

  useEffect(() => {
    async function loadQuestions() {
      setLoading(true);
      try {
        const res = await api.getQuestions({
          search: activeSearch,
          tag: activeTag,
          sort: sortTab,
          page: pagination.page,
          limit: 10,
        });
        setQuestions(res.questions || []);
        setPagination(res.pagination || { total: 0, page: 1, totalPages: 1 });
      } catch (err) {
        console.error('Failed to load questions from backend:', err);
      } finally {
        setLoading(false);
      }
    }

    loadQuestions();
  }, [activeSearch, activeTag, sortTab, pagination.page]);

  const clearFilter = () => {
    setSearchParams({});
  };

  const getTimeAgo = (dateString) => {
    if (!dateString) return 'recently';
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-[#0f172a]">
            {activeTag ? `Questions tagged [${activeTag}]` : activeSearch ? `Search Results` : 'Top Questions'}
          </h1>
          <p className="text-xs text-[#64748b] mt-1">
            {pagination.total} {pagination.total === 1 ? 'question' : 'questions'} available
          </p>
        </div>
        <Link to="/ask">
          <Button variant="primary" className="flex items-center gap-1.5">
            <MessageSquarePlus className="h-4 w-4" /> Ask Question
          </Button>
        </Link>
      </div>

      {/* Active Filter Bar */}
      {(activeTag || activeSearch) && (
        <div className="mb-6 p-3 rounded-lg bg-[#eef2ff] border border-[#c7d2fe] flex items-center justify-between text-xs font-medium text-[#312e81]">
          <div className="flex items-center gap-2">
            <span>Filtering by:</span>
            {activeTag && <span className="bg-white px-2 py-0.5 rounded border border-[#a5b4fc]">Tag: #{activeTag}</span>}
            {activeSearch && <span className="bg-white px-2 py-0.5 rounded border border-[#a5b4fc]">Search: "{activeSearch}"</span>}
          </div>
          <button onClick={clearFilter} className="flex items-center gap-1 text-[#3b49df] hover:underline font-semibold">
            <X className="h-3.5 w-3.5" /> Clear Filters
          </button>
        </div>
      )}

      {/* Sorting Tabs */}
      <div className="flex justify-end mb-6 overflow-x-auto pb-2">
        <div className="inline-flex rounded-md shadow-2xs border border-[#cbd5e1] bg-white">
          {tabs.map((tab, idx) => (
            <button
              key={tab.key}
              onClick={() => setSortTab(tab.key)}
              className={cn(
                'px-4 py-2 text-xs font-medium transition-colors whitespace-nowrap',
                idx !== 0 && 'border-l border-[#cbd5e1]',
                sortTab === tab.key 
                  ? 'bg-[#eef2ff] text-[#3b49df] font-semibold' 
                  : 'text-[#475569] hover:bg-[#f8fafc]',
                idx === 0 && 'rounded-l-md',
                idx === tabs.length - 1 && 'rounded-r-md'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Questions List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-16 bg-white rounded-lg border border-[#e2e8f0]">
          <Loader2 className="h-8 w-8 text-[#3b49df] animate-spin mb-2" />
          <p className="text-xs text-[#64748b]">Loading questions from backend...</p>
        </div>
      ) : questions.length === 0 ? (
        <div className="text-center p-12 bg-white rounded-lg border border-[#e2e8f0]">
          <Search className="h-10 w-10 text-[#94a3b8] mx-auto mb-3" />
          <h3 className="text-base font-semibold text-[#0f172a] mb-1">No questions found</h3>
          <p className="text-xs text-[#64748b] mb-4">Be the first to ask a question or try clearing your search filters.</p>
          <Link to="/ask">
            <Button variant="primary" size="sm">Ask a Question</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {questions.map((q) => (
            <div key={q.id} className="flex gap-4 p-5 rounded-lg border border-[#e2e8f0] bg-white shadow-2xs transition-all hover:shadow-md">
              <div className="flex flex-col items-end gap-2 w-28 shrink-0 text-xs">
                <div 
                  className={cn(
                    'flex items-center gap-1 rounded px-2 py-1 font-semibold border',
                    q.has_accepted_answer 
                      ? 'border-[#22c55e] bg-[#f0fdf4] text-[#16a34a]' 
                      : q.answers_count > 0 
                        ? 'border-[#cbd5e1] text-[#16a34a] bg-slate-50' 
                        : 'border-transparent text-[#64748b]'
                  )}
                >
                  {q.has_accepted_answer && <Check className="h-3.5 w-3.5" />}
                  {q.answers_count} {q.answers_count === 1 ? 'answer' : 'answers'}
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <h2 className="text-base font-semibold text-[#2563eb] mb-2 leading-snug">
                  <Link to={`/questions/${q.id}`} className="hover:text-[#1d4ed8]">
                    {q.title}
                  </Link>
                </h2>
                <div 
                  className="text-xs text-[#475569] mb-4 line-clamp-2 prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: q.description }}
                />
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex flex-wrap gap-1.5">
                    {q.tags.map((t) => (
                      <Link key={t.id || t.name} to={`/?tag=${encodeURIComponent(t.name)}`}>
                        <Tag>{t.name}</Tag>
                      </Link>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#64748b]">
                    <Avatar alt={q.author?.username || 'User'} className="h-5 w-5 bg-[#3b49df] text-white text-[10px] font-bold" />
                    <Link to={`/users/${q.author?.id}`} className="font-medium text-[#0f172a] hover:underline">
                      @{q.author?.username}
                    </Link>
                    <span>• asked {getTimeAgo(q.created_at)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="mt-8 flex justify-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            disabled={pagination.page <= 1}
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
          >
            Previous
          </Button>
          <span className="text-xs font-medium text-[#475569] flex items-center px-2">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <Button 
            variant="outline" 
            size="sm"
            disabled={pagination.page >= pagination.totalPages}
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
