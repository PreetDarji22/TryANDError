import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Avatar } from '../components/ui/Avatar';
import { Badge } from '../components/ui/Badge';
import { Tag } from '../components/ui/Tag';
import { CheckCircle2, MessageSquare, AtSign, Loader2, Calendar, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';

export default function UserProfile() {
  const { id } = useParams();
  const { user: currentUser } = useAuth();

  const [profileUser, setProfileUser] = useState(null);
  const [userQuestions, setUserQuestions] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUserData() {
      setLoading(true);
      try {
        if (currentUser && (id === String(currentUser.id) || id === 'me')) {
          setProfileUser(currentUser);
          const [qRes, notifRes] = await Promise.all([
            api.getQuestions({ limit: 10 }),
            api.getNotifications({ limit: 10 }),
          ]);
          // Filter user questions
          const filtered = (qRes.questions || []).filter(q => q.author.id === currentUser.id);
          setUserQuestions(filtered);
          setNotifications(notifRes.notifications || []);
        } else {
          // General user fallback
          setProfileUser({
            id: id || 1,
            username: currentUser?.username || 'StackItUser',
            email: currentUser?.email || 'user@stackit.com',
            role: currentUser?.role || 'USER',
            created_at: new Date().toISOString(),
          });
          const qRes = await api.getQuestions({ limit: 10 });
          setUserQuestions(qRes.questions || []);
        }
      } catch (err) {
        console.error('Failed to load user profile:', err);
      } finally {
        setLoading(false);
      }
    }

    loadUserData();
  }, [id, currentUser]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20">
        <Loader2 className="h-10 w-10 text-[#3b49df] animate-spin mb-2" />
        <p className="text-xs text-[#64748b]">Loading profile data...</p>
      </div>
    );
  }

  const user = profileUser || currentUser;

  return (
    <div className="max-w-5xl mx-auto pb-12">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 mb-8">
        <div className="rounded-lg border border-[#e2e8f0] bg-white p-6 shadow-2xs flex flex-col sm:flex-row gap-6">
          <Avatar 
            alt={user?.username || 'User'} 
            className="h-24 w-24 rounded-lg bg-[#3b49df] text-white font-bold text-2xl flex items-center justify-center"
          />
          <div className="flex flex-col justify-center flex-1">
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-[#0f172a]">@{user?.username}</h1>
              <span className="inline-flex items-center gap-1 rounded bg-[#eef2ff] px-2 py-0.5 text-xs font-bold text-[#3b49df] border border-[#c7d2fe]">
                <Shield className="h-3 w-3" /> {user?.role || 'USER'}
              </span>
            </div>
            <p className="text-xs text-[#475569] mb-4">
              Member of StackIt Q&A Forum Community.
            </p>
            <div className="flex items-center gap-3 text-xs text-[#64748b]">
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" /> Joined {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Recently'}
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-[#e2e8f0] bg-white p-6 shadow-2xs flex flex-col justify-center">
          <h2 className="text-base font-semibold text-[#0f172a] mb-3 pb-2 border-b border-[#e2e8f0]">Badges</h2>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="gold" count={1} />
            <Badge variant="silver" count={3} />
            <Badge variant="bronze" count={8} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-8">
        {/* Activity & Notifications */}
        <div>
          <h2 className="text-lg font-bold text-[#0f172a] mb-4">Recent Notifications & Activity</h2>
          {notifications.length === 0 ? (
            <div className="p-6 bg-white rounded-lg border border-[#e2e8f0] text-xs text-[#64748b] text-center">
              No recent activity recorded yet.
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((n) => (
                <div key={n.id} className="rounded-lg border border-[#e2e8f0] bg-white p-4 shadow-2xs flex gap-3 items-start text-xs">
                  <div className="mt-0.5 text-[#3b49df] rounded-full bg-[#eef2ff] p-1.5 shrink-0">
                    {n.type === 'NEW_ANSWER' && <CheckCircle2 className="h-4 w-4" />}
                    {n.type === 'NEW_COMMENT' && <MessageSquare className="h-4 w-4" />}
                    {n.type === 'MENTION' && <AtSign className="h-4 w-4" />}
                  </div>
                  <div>
                    <p className="text-[#0f172a] mb-1">
                      <strong>@{n.actor.username}</strong>{' '}
                      {n.type === 'NEW_ANSWER' && 'answered your question.'}
                      {n.type === 'NEW_COMMENT' && 'commented on your answer.'}
                      {n.type === 'MENTION' && 'mentioned you in a post.'}
                    </p>
                    <span className="text-[10px] text-[#64748b]">
                      {new Date(n.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* User Questions */}
        <div>
          <h2 className="text-lg font-bold text-[#0f172a] mb-4">My Questions</h2>
          {userQuestions.length === 0 ? (
            <div className="p-6 bg-white rounded-lg border border-[#e2e8f0] text-xs text-[#64748b] text-center">
              No questions posted yet.
            </div>
          ) : (
            <div className="space-y-3">
              {userQuestions.map((q) => (
                <div key={q.id} className="rounded-lg border border-[#e2e8f0] bg-white p-4 shadow-2xs flex flex-col">
                  <div className="flex justify-between items-start mb-2 text-xs">
                    <span className="font-semibold text-[#16a34a] bg-[#f0fdf4] px-2 py-0.5 rounded border border-[#bbf7d0]">
                      {q.answers_count} {q.answers_count === 1 ? 'answer' : 'answers'}
                    </span>
                  </div>
                  <h3 className="font-medium text-sm text-[#0f172a] mb-2 leading-snug">
                    <Link to={`/questions/${q.id}`} className="hover:text-[#2563eb]">
                      {q.title}
                    </Link>
                  </h3>
                  <div className="flex gap-1 flex-wrap mt-auto">
                    {q.tags.map((t) => (
                      <Tag key={t.id || t.name}>{t.name}</Tag>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
