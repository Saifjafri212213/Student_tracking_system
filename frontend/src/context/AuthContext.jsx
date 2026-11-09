import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('coderank_token'));
  const [loading, setLoading] = useState(true);

  // Load authenticated user profile on mount if token exists
  useEffect(() => {
    async function loadUser() {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const data = await api.getMe();
        if (data && data.user) {
          setUser(data.user);
        } else {
          // Token invalid or expired
          logout();
        }
      } catch (err) {
        console.warn('Session verification failed:', err.message);
        logout();
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, [token]);

  const login = async (email, password) => {
    const data = await api.login(email, password);
    if (data.token && data.user) {
      localStorage.setItem('coderank_token', data.token);
      localStorage.setItem('coderank_user', JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
    }
    return data;
  };

  const register = async (payload) => {
    const data = await api.register(payload);
    if (data.token && data.user) {
      localStorage.setItem('coderank_token', data.token);
      localStorage.setItem('coderank_user', JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
    }
    return data;
  };

  const resetPassword = async (payload) => {
    const data = await api.resetPassword(payload);
    if (data.token && data.user) {
      localStorage.setItem('coderank_token', data.token);
      localStorage.setItem('coderank_user', JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
    }
    return data;
  };

  const logout = () => {
    localStorage.removeItem('coderank_token');
    localStorage.removeItem('coderank_user');
    setToken(null);
    setUser(null);
  };

  const updateHandles = async (newHandles) => {
    if (!user) throw new Error('Not logged in');
    const res = await api.updateHandles({
      uid: user.uid,
      rollNumber: user.rollNumber,
      fullName: user.fullName,
      branch: user.branch,
      academicYear: user.academicYear,
      handles: newHandles
    });

    const updatedUser = { ...user, handles: newHandles };
    setUser(updatedUser);
    localStorage.setItem('coderank_user', JSON.stringify(updatedUser));
    return res;
  };

  const updateProfile = async (profileData) => {
    if (!user) throw new Error('Not logged in');
    const res = await api.updateProfile(profileData);
    if (res && res.user) {
      setUser(res.user);
      localStorage.setItem('coderank_user', JSON.stringify(res.user));
    } else {
      const merged = { ...user, ...profileData };
      setUser(merged);
      localStorage.setItem('coderank_user', JSON.stringify(merged));
    }
    return res;
  };

  const changePassword = async (currentPassword, newPassword) => {
    return api.changePassword(currentPassword, newPassword);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        loading,
        login,
        register,
        resetPassword,
        logout,
        updateHandles,
        updateProfile,
        changePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
