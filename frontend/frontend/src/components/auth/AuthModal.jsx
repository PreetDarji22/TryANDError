import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { X, LogIn, UserPlus } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

export default function AuthModal() {
  const {
    isAuthModalOpen,
    authModalMode,
    closeAuthModal,
    setAuthModalMode,
    login,
    register,
  } = useAuth();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      if (authModalMode === 'login') {
        await login({ loginIdentifier: email || username, password });
      } else {
        await register({ username, email, password });
      }
      // Reset inputs
      setUsername('');
      setEmail('');
      setPassword('');
    } catch (err) {
      setError(err.message || 'Authentication failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-xl border border-[#e2e8f0] bg-white p-6 shadow-xl relative animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={closeAuthModal}
          className="absolute right-4 top-4 text-[#64748b] hover:text-[#0f172a] p-1 rounded-full hover:bg-[#f1f5f9]"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2 mb-6">
          <div className="p-2 rounded-lg bg-[#eef2ff] text-[#3b49df]">
            {authModalMode === 'login' ? <LogIn className="h-6 w-6" /> : <UserPlus className="h-6 w-6" />}
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#0f172a]">
              {authModalMode === 'login' ? 'Welcome Back' : 'Create an Account'}
            </h2>
            <p className="text-xs text-[#64748b]">
              {authModalMode === 'login'
                ? 'Sign in to ask questions, vote, and answer.'
                : 'Join StackIt community today.'}
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-md">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {authModalMode === 'register' && (
            <div>
              <label className="block text-xs font-medium text-[#475569] mb-1">Username</label>
              <Input
                type="text"
                placeholder="e.g. alex_dev"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-[#475569] mb-1">
              {authModalMode === 'login' ? 'Email or Username' : 'Email Address'}
            </label>
            <Input
              type={authModalMode === 'register' ? 'email' : 'text'}
              placeholder={authModalMode === 'login' ? 'jane@stackit.com or jane_doe' : 'jane@stackit.com'}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#475569] mb-1">Password</label>
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <Button type="submit" variant="primary" className="w-full mt-2" disabled={submitting}>
            {submitting
              ? 'Processing...'
              : authModalMode === 'login'
              ? 'Sign In'
              : 'Register Account'}
          </Button>
        </form>

        <div className="mt-6 text-center text-xs text-[#64748b]">
          {authModalMode === 'login' ? (
            <>
              Don't have an account?{' '}
              <button
                onClick={() => {
                  setError(null);
                  setAuthModalMode('register');
                }}
                className="font-semibold text-[#3b49df] hover:underline"
              >
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button
                onClick={() => {
                  setError(null);
                  setAuthModalMode('login');
                }}
                className="font-semibold text-[#3b49df] hover:underline"
              >
                Sign in
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
