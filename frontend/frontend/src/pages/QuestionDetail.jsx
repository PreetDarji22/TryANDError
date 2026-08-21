import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Tag } from '../components/ui/Tag';
import { Avatar } from '../components/ui/Avatar';
import { Button } from '../components/ui/Button';
import { ChevronUp, ChevronDown, Check, Bold, Italic, Link as LinkIcon, Code, Image as ImageIcon, MessageSquare, Loader2, Send } from 'lucide-react';
import { cn } from '../lib/utils';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';

export default function QuestionDetail() {
  const { id } = useParams();
  const { user, openAuthModal } = useAuth();

  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // New answer state
  const [answerText, setAnswerText] = useState('');
  const [submittingAnswer, setSubmittingAnswer] = useState(false);
  const [answerError, setAnswerError] = useState(null);

  // Comment input states per answer: { [answerId]: commentText }
  const [commentInputs, setCommentInputs] = useState({});
  const [activeCommentBox, setActiveCommentBox] = useState(null);
  const [submittingComment, setSubmittingComment] = useState(false);

  // Image upload state
  const [uploadingImage, setUploadingImage] = useState(false);

  const fetchQuestionDetails = async () => {
    try {
      const res = await api.getQuestionById(id);
      setQuestion(res.question);
    } catch (err) {
      console.error('Error fetching question:', err);
      setError(err.message || 'Question not found');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestionDetails();
  }, [id]);

  // Handle Vote
  const handleVote = async (answerId, voteType) => {
    if (!user) {
      openAuthModal('login');
      return;
    }

    try {
      const res = await api.voteAnswer(answerId, voteType);
      setQuestion(prev => {
        if (!prev) return prev;
        const updatedAnswers = prev.answers.map(a => {
          if (a.id === answerId) {
            return {
              ...a,
              vote_score: res.vote_score,
              upvotes: res.upvotes,
              downvotes: res.downvotes,
              user_vote: res.user_vote,
            };
          }
          return a;
        });
        return { ...prev, answers: updatedAnswers };
      });
    } catch (err) {
      alert(err.message || 'Failed to register vote.');
    }
  };

  // Handle Accept Answer (Only question owner)
  const handleAcceptAnswer = async (answerId) => {
    if (!user) {
      openAuthModal('login');
      return;
    }

    try {
      const res = await api.acceptAnswer(answerId);
      setQuestion(prev => {
        if (!prev) return prev;
        const updatedAnswers = prev.answers.map(a => ({
          ...a,
          is_accepted: a.id === answerId ? res.is_accepted : false,
        }));
        return { ...prev, answers: updatedAnswers };
      });
    } catch (err) {
      alert(err.message || 'Only the question owner can mark an answer as accepted.');
    }
  };

  // Post Answer
  const handlePostAnswer = async (e) => {
    e.preventDefault();
    if (!user) {
      openAuthModal('login');
      return;
    }

    if (!answerText.trim()) {
      setAnswerError('Answer content cannot be empty.');
      return;
    }

    setSubmittingAnswer(true);
    setAnswerError(null);

    try {
      await api.postAnswer(id, { description: answerText.trim() });
      setAnswerText('');
      await fetchQuestionDetails(); // Refresh question & answers
    } catch (err) {
      setAnswerError(err.message || 'Failed to post answer.');
    } finally {
      setSubmittingAnswer(false);
    }
  };

  // Post Comment
  const handlePostComment = async (answerId) => {
    if (!user) {
      openAuthModal('login');
      return;
    }

    const content = commentInputs[answerId] || '';
    if (!content.trim()) return;

    setSubmittingComment(true);
    try {
      await api.postComment(answerId, { content: content.trim() });
      setCommentInputs(prev => ({ ...prev, [answerId]: '' }));
      setActiveCommentBox(null);
      await fetchQuestionDetails();
    } catch (err) {
      alert(err.message || 'Failed to post comment.');
    } finally {
      setSubmittingComment(false);
    }
  };

  // Image Upload helper for Rich Text
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    setUploadingImage(true);
    try {
      const res = await api.uploadImage(formData);
      const imageTag = `<img src="${res.url}" alt="Uploaded Image" class="max-w-full h-auto rounded my-2" />`;
      setAnswerText(prev => prev + '\n' + imageTag);
    } catch (err) {
      alert(err.message || 'Failed to upload image.');
    } finally {
      setUploadingImage(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20">
        <Loader2 className="h-10 w-10 text-[#3b49df] animate-spin mb-2" />
        <p className="text-xs text-[#64748b]">Loading question details...</p>
      </div>
    );
  }

  if (error || !question) {
    return (
      <div className="max-w-4xl mx-auto p-12 text-center bg-white rounded-lg border border-[#e2e8f0]">
        <h2 className="text-xl font-bold text-red-600 mb-2">Question Not Found</h2>
        <p className="text-xs text-[#64748b] mb-4">{error || 'The requested question could not be loaded.'}</p>
        <Link to="/">
          <Button variant="primary" size="sm">Back to Home</Button>
        </Link>
      </div>
    );
  }

  const isQuestionOwner = user && user.id === question.author.id;

  return (
    <div className="max-w-4xl mx-auto pb-12">
      {/* Question Header */}
      <div className="mb-6 pb-6 border-b border-[#e2e8f0]">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#0f172a] mb-3 leading-snug">
          {question.title}
        </h1>
        <div className="flex flex-wrap items-center gap-4 text-xs text-[#475569]">
          <div>
            <span className="text-[#64748b] mr-1">Asked</span>{' '}
            {new Date(question.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
          </div>
          <div>
            <span className="text-[#64748b] mr-1">Author</span>{' '}
            <span className="font-semibold text-[#0f172a]">@{question.author.username}</span>
          </div>
        </div>
      </div>

      {/* Question Content */}
      <div className="flex gap-4 mb-8">
        <div className="flex-1 min-w-0 bg-white rounded-lg border border-[#e2e8f0] p-6 shadow-2xs">
          <div 
            className="prose prose-sm sm:prose-base max-w-none text-[#334155]"
            dangerouslySetInnerHTML={{ __html: question.description }}
          />
          
          <div className="mt-6 flex flex-wrap gap-1.5">
            {question.tags.map((t) => (
              <Link key={t.id || t.name} to={`/?tag=${encodeURIComponent(t.name)}`}>
                <Tag>{t.name}</Tag>
              </Link>
            ))}
          </div>

          <div className="mt-6 flex justify-end">
            <div className="bg-[#f8fafc] rounded-md p-3 flex flex-col gap-1 text-xs border border-[#e2e8f0]">
              <div className="text-[#64748b]">
                asked {new Date(question.created_at).toLocaleString()}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <Avatar alt={question.author.username} className="h-7 w-7 bg-[#3b49df] text-white font-bold text-xs" />
                <span className="font-semibold text-[#2563eb]">@{question.author.username}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Answers Section */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-[#0f172a]">
          {question.answers.length} {question.answers.length === 1 ? 'Answer' : 'Answers'}
        </h2>
      </div>

      {/* Answers List */}
      <div className="space-y-6 mb-10">
        {question.answers.map((answer) => (
          <div key={answer.id} className="flex gap-4">
            {/* Voting & Accepted controls */}
            <div className="flex flex-col items-center gap-1 w-12 shrink-0">
              <button 
                onClick={() => handleVote(answer.id, 'UPVOTE')}
                className={cn(
                  'p-1 rounded hover:bg-[#eef2ff] transition-colors',
                  answer.user_vote === 'UPVOTE' ? 'text-[#3b49df] font-bold' : 'text-[#94a3b8] hover:text-[#3b49df]'
                )}
                title="Upvote"
              >
                <ChevronUp className="h-8 w-8" />
              </button>
              <div className="text-lg font-bold text-[#0f172a]">{answer.vote_score}</div>
              <button 
                onClick={() => handleVote(answer.id, 'DOWNVOTE')}
                className={cn(
                  'p-1 rounded hover:bg-[#eef2ff] transition-colors',
                  answer.user_vote === 'DOWNVOTE' ? 'text-[#3b49df] font-bold' : 'text-[#94a3b8] hover:text-[#3b49df]'
                )}
                title="Downvote"
              >
                <ChevronDown className="h-8 w-8" />
              </button>

              {/* Accept toggle button */}
              {(isQuestionOwner || answer.is_accepted) && (
                <button
                  onClick={() => isQuestionOwner && handleAcceptAnswer(answer.id)}
                  disabled={!isQuestionOwner}
                  className={cn(
                    'mt-2 p-1.5 rounded-full transition-all',
                    answer.is_accepted 
                      ? 'bg-[#10b981] text-white shadow-sm' 
                      : 'text-[#cbd5e1] hover:text-[#10b981] hover:bg-emerald-50'
                  )}
                  title={answer.is_accepted ? 'Accepted Answer' : 'Mark as Accepted'}
                >
                  <Check className="h-6 w-6" strokeWidth={3} />
                </button>
              )}
            </div>

            {/* Answer Body */}
            <div className={cn(
              'flex-1 min-w-0 bg-white rounded-lg border p-6 shadow-2xs relative',
              answer.is_accepted ? 'border-2 border-[#10b981]' : 'border-[#e2e8f0]'
            )}>
              {answer.is_accepted && (
                <div className="absolute top-0 right-0 bg-[#d1fae5] text-[#065f46] text-xs font-semibold px-3 py-1 rounded-bl-lg rounded-tr flex items-center gap-1">
                  <Check className="h-3.5 w-3.5" /> Accepted Answer
                </div>
              )}

              <div 
                className="prose prose-sm sm:prose-base max-w-none text-[#334155] mt-1"
                dangerouslySetInnerHTML={{ __html: answer.description }}
              />

              <div className="mt-6 flex justify-end">
                <div className="bg-[#f8fafc] rounded-md p-3 flex flex-col gap-1 text-xs border border-[#e2e8f0]">
                  <div className="text-[#64748b]">
                    answered {new Date(answer.created_at).toLocaleString()}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Avatar alt={answer.author.username} className="h-7 w-7 bg-[#10b981] text-white font-bold text-xs" />
                    <span className="font-semibold text-[#2563eb]">@{answer.author.username}</span>
                  </div>
                </div>
              </div>

              {/* Comments Section */}
              <div className="mt-6 pt-4 border-t border-[#f1f5f9]">
                <div className="space-y-2 mb-3">
                  {answer.comments.map((comment) => (
                    <div key={comment.id} className="text-xs text-[#334155] bg-[#f8fafc] p-2.5 rounded border border-[#e2e8f0] flex justify-between gap-2">
                      <span>{comment.content}</span>
                      <span className="text-[#64748b] shrink-0 font-medium">— @{comment.author.username}</span>
                    </div>
                  ))}
                </div>

                {activeCommentBox === answer.id ? (
                  <div className="flex gap-2 mt-2">
                    <input
                      type="text"
                      placeholder="Add a comment... (use @username to notify)"
                      value={commentInputs[answer.id] || ''}
                      onChange={(e) => setCommentInputs({ ...commentInputs, [answer.id]: e.target.value })}
                      className="flex-1 text-xs border border-[#cbd5e1] rounded px-3 py-1.5 focus:outline-none focus:border-[#3b49df]"
                    />
                    <Button 
                      size="sm" 
                      onClick={() => handlePostComment(answer.id)}
                      disabled={submittingComment}
                      className="text-xs py-1"
                    >
                      {submittingComment ? 'Posting...' : 'Comment'}
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setActiveCommentBox(null)}
                      className="text-xs py-1"
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <button 
                    onClick={() => {
                      if (!user) return openAuthModal('login');
                      setActiveCommentBox(answer.id);
                    }}
                    className="text-xs text-[#64748b] hover:text-[#3b49df] flex items-center gap-1 font-medium mt-1"
                  >
                    <MessageSquare className="h-3.5 w-3.5" /> Add a comment
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Post Your Answer Form */}
      <div className="pt-6 border-t border-[#e2e8f0]">
        <h2 className="text-xl font-bold text-[#0f172a] mb-4">Your Answer</h2>
        
        {answerError && (
          <div className="mb-4 p-3 text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-md">
            {answerError}
          </div>
        )}

        <form onSubmit={handlePostAnswer}>
          <div className="rounded-lg border border-[#e2e8f0] bg-white shadow-2xs overflow-hidden flex flex-col mb-4">
            <div className="bg-[#f8fafc] border-b border-[#e2e8f0] flex items-center px-4 py-2 gap-2">
              <button 
                type="button"
                onClick={() => setAnswerText(prev => prev + '<strong>Bold</strong>')}
                className="p-1.5 text-[#475569] hover:bg-[#e2e8f0] rounded transition-colors" 
                title="Bold"
              >
                <Bold className="h-4 w-4" />
              </button>
              <button 
                type="button"
                onClick={() => setAnswerText(prev => prev + '<em>Italic</em>')}
                className="p-1.5 text-[#475569] hover:bg-[#e2e8f0] rounded transition-colors" 
                title="Italic"
              >
                <Italic className="h-4 w-4" />
              </button>
              <div className="w-px h-5 bg-[#cbd5e1] mx-1"></div>
              <button 
                type="button"
                onClick={() => setAnswerText(prev => prev + '<pre><code>// Code snippet</code></pre>')}
                className="p-1.5 text-[#475569] hover:bg-[#e2e8f0] rounded transition-colors" 
                title="Code block"
              >
                <Code className="h-4 w-4" />
              </button>
              
              {/* Image Upload Button */}
              <label className="p-1.5 text-[#475569] hover:bg-[#e2e8f0] rounded transition-colors cursor-pointer" title="Upload Image">
                <ImageIcon className="h-4 w-4" />
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              </label>
              {uploadingImage && <span className="text-xs text-[#3b49df]">Uploading image...</span>}
            </div>
            
            <textarea 
              value={answerText}
              onChange={(e) => setAnswerText(e.target.value)}
              className="w-full min-h-[200px] p-4 text-sm focus:outline-none resize-y" 
              placeholder="Write your detailed answer here... (HTML or plain text supported, use @username to mention someone)"
            ></textarea>
          </div>

          <Button type="submit" variant="primary" disabled={submittingAnswer} className="flex items-center gap-1.5">
            <Send className="h-4 w-4" /> {submittingAnswer ? 'Posting...' : 'Post Your Answer'}
          </Button>
        </form>
      </div>
    </div>
  );
}
