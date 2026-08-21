import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, getAuthToken, setAuthToken } from '../lib/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(getAuthToken());
  const [loading, setLoading] = useState(true);

  // Auth modal control
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login'); // 'login' | 'register'

  useEffect(() => {
    async function loadUser() {
      const storedToken = getAuthToken();
      if (!storedToken) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const res = await api.getMe();
        setUser(res.user);
      } catch (err) {
        console.error('Session expired or invalid token:', err);
        setAuthToken(null);
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, [token]);

  const login = async (credentials) => {
    const res = await api.login(credentials);
    setAuthToken(res.token);
    setToken(res.token);
    setUser(res.user);
    setIsAuthModalOpen(false);
    return res;
  };

  const register = async (userData) => {
    const res = await api.register(userData);
    setAuthToken(res.token);
    setToken(res.token);
    setUser(res.user);
    setIsAuthModalOpen(false);
    return res;
  };

  const logout = () => {
    setAuthToken(null);
    setToken(null);
    setUser(null);
  };

  const openAuthModal = (mode = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthModalOpen,
        authModalMode,
        login,
        register,
        logout,
        openAuthModal,
        closeAuthModal,
        setAuthModalMode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
