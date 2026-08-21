import React from 'react';
import { Link } from 'react-router-dom';
import { Avatar } from '../components/ui/Avatar';
import { Badge } from '../components/ui/Badge';
import { Tag } from '../components/ui/Tag';
import { CheckCircle2, MessageSquare, Trophy, Check } from 'lucide-react';

export default function UserProfile() {
  return (
    <div className="max-w-5xl mx-auto pb-12">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 mb-8">
        <div className="rounded-lg border border-[#e2e8f0] bg-white p-6 shadow-sm flex flex-col sm:flex-row gap-6">
          <Avatar 
            src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=250&auto=format&fit=crop" 
            alt="AlexDeveloper" 
            className="h-32 w-32 rounded-lg"
          />
          <div className="flex flex-col justify-center flex-1">
            <h1 className="text-3xl font-bold text-[#0f172a] mb-2">AlexDeveloper</h1>
            <p className="text-[#475569] mb-4">
              Full-stack engineer, passionate about React and distributed systems.
            </p>
            <div className="flex items-center gap-3 mt-auto">
              <span className="inline-flex items-center rounded bg-[#eef2ff] px-2.5 py-1 text-sm font-semibold text-[#3b49df]">
                Reputation: 14,520
              </span>
              <span className="inline-flex items-center rounded bg-[#f1f5f9] px-2.5 py-1 text-sm font-medium text-[#475569]">
                Joined 2021
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-[#e2e8f0] bg-white p-6 shadow-sm flex flex-col justify-center">
          <h2 className="text-lg font-semibold text-[#0f172a] mb-4 pb-2 border-b border-[#e2e8f0]">Badges</h2>
          <div className="flex items-center gap-3 flex-wrap">
            <Badge variant="gold" count={12} />
            <Badge variant="silver" count={45} />
            <Badge variant="bronze" count={120} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-8">
        <div>
          <h2 className="text-xl font-bold text-[#0f172a] mb-4">Recent Activity</h2>
          <div className="space-y-4">
            <div className="rounded-lg border border-[#e2e8f0] bg-white p-5 shadow-sm flex gap-4 items-start">
              <div className="mt-1 text-[#3b49df] rounded-full bg-[#eef2ff] p-1.5 shrink-0">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-[#0f172a] mb-1">
                  <strong>User123</strong> answered your question <Link to="#" className="text-[#2563eb] hover:underline">How to implement a custom hook for ResizeObserver in React?</Link>
                </p>
                <p className="text-xs text-[#64748b]">2 hours ago</p>
              </div>
            </div>

            <div className="rounded-lg border border-[#e2e8f0] bg-white p-5 shadow-sm flex gap-4 items-start">
              <div className="mt-1 text-[#10b981] rounded-full bg-[#ecfdf5] p-1.5 shrink-0">
                <MessageSquare className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-[#0f172a] mb-1">
                  <strong>@DevJane</strong> mentioned you in a comment on <Link to="#" className="text-[#2563eb] hover:underline">Understanding Event Loop in Node.js</Link>
                </p>
                <p className="text-xs text-[#64748b]">5 hours ago</p>
              </div>
            </div>

            <div className="rounded-lg border border-[#e2e8f0] bg-white p-5 shadow-sm flex gap-4 items-start">
              <div className="mt-1 text-[#f59e0b] rounded-full bg-[#fef3c7] p-1.5 shrink-0">
                <Trophy className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-[#0f172a] mb-1">
                  You earned a bronze badge: <strong>Student</strong>
                </p>
                <p className="text-xs text-[#64748b]">Yesterday</p>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold text-[#0f172a] mb-4">Top Questions</h2>
          <div className="space-y-4">
            <div className="rounded-lg border border-[#e2e8f0] bg-white p-4 shadow-sm flex flex-col">
              <div className="flex justify-between items-start mb-2">
                <span className="inline-flex items-center rounded bg-[#eef2ff] px-2 py-0.5 text-xs font-semibold text-[#3b49df]">
                  142 votes
                </span>
                <span className="text-xs text-[#64748b]">3 answers</span>
              </div>
              <h3 className="font-semibold text-[#0f172a] mb-3 leading-snug">
                <Link to="#" className="hover:text-[#2563eb]">
                  Optimizing large lists in React Native without FlatList
                </Link>
              </h3>
              <div className="flex gap-2 mt-auto">
                <Tag>react-native</Tag>
                <Tag>performance</Tag>
              </div>
            </div>

            <div className="rounded-lg border border-[#e2e8f0] bg-white p-4 shadow-sm flex flex-col">
              <div className="flex justify-between items-start mb-2">
                <span className="inline-flex items-center rounded border border-[#e2e8f0] px-2 py-0.5 text-xs font-medium text-[#475569]">
                  56 votes
                </span>
                <span className="text-xs text-[#16a34a] font-medium flex items-center gap-1">
                  <Check className="h-3 w-3" /> 1 answer
                </span>
              </div>
              <h3 className="font-semibold text-[#0f172a] mb-3 leading-snug">
                <Link to="#" className="hover:text-[#2563eb]">
                  PostgreSQL JSONB indexing strategies for nested queries
                </Link>
              </h3>
              <div className="flex gap-2 mt-auto">
                <Tag>postgresql</Tag>
                <Tag>database</Tag>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
