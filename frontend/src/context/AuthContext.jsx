import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import axiosClient from '../api/axiosClient';

const AuthContext = createContext(null);

const TOKEN_KEY = 'petcare_token';
const USER_KEY = 'petcare_user';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem(USER_KEY);
    return stored ? JSON.parse(stored) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [loading, setLoading] = useState(() => Boolean(localStorage.getItem(TOKEN_KEY)));
  const [error, setError] = useState(null);

  useEffect(() => {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_KEY);
    }
  }, [user]);

  useEffect(() => {
    const existingToken = localStorage.getItem(TOKEN_KEY);
    if (!existingToken) {
      setLoading(false);
      return undefined;
    }

    let cancelled = false;
    axiosClient
      .get('/auth/me')
      .then(({ data }) => {
        if (!cancelled) setUser(data.user);
      })
      .catch(() => {
        if (!cancelled) {
          setToken(null);
          setUser(null);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    function handleUnauthorized() {
      setToken(null);
      setUser(null);
    }
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  function throwWithDetails(err, fallbackMessage) {
    const message = err.response?.data?.message || fallbackMessage;
    const details = err.response?.data?.details || null;
    setError(message);
    const authError = new Error(message);
    authError.details = details;
    throw authError;
  }

  async function login(email, password) {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axiosClient.post('/auth/login', { email, password });
      setToken(data.token);
      setUser(data.user);
      return data.user;
    } catch (err) {
      throwWithDetails(err, 'Đăng nhập thất bại');
    } finally {
      setLoading(false);
    }
  }

  async function register(payload) {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axiosClient.post('/auth/register', payload);
      return data;
    } catch (err) {
      throwWithDetails(err, 'Đăng ký thất bại');
    } finally {
      setLoading(false);
    }
  }

  async function googleLogin(credential) {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axiosClient.post('/auth/google', { credential });
      setToken(data.token);
      setUser(data.user);
      return data.user;
    } catch (err) {
      throwWithDetails(err, 'Đăng nhập Google thất bại');
    } finally {
      setLoading(false);
    }
  }

  async function verifyEmail(verificationToken) {
    const { data } = await axiosClient.post('/auth/verify-email', { token: verificationToken });
    return data.message;
  }

  async function resendVerification(email) {
    const { data } = await axiosClient.post('/auth/resend-verification', { email });
    return data;
  }

  async function forgotPassword(email) {
    const { data } = await axiosClient.post('/auth/forgot-password', { email });
    return data.message;
  }

  async function resetPassword(resetToken, password, confirmPassword) {
    const { data } = await axiosClient.post('/auth/reset-password', {
      token: resetToken,
      password,
      confirmPassword,
    });
    return data.message;
  }

  async function logout() {
    try {
      await axiosClient.post('/auth/logout');
    } catch (err) {
    }
    setToken(null);
    setUser(null);
    setError(null);
  }

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token),
      isAdmin: user?.role === 'admin',
      isEditor: user?.role === 'editor',
      canManageCatalog: user?.role === 'admin' || user?.role === 'editor',
      loading,
      error,
      login,
      register,
      googleLogin,
      verifyEmail,
      resendVerification,
      forgotPassword,
      resetPassword,
      logout,
      setUser,
    }),
    [user, token, loading, error]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth phải được dùng bên trong AuthProvider');
  }
  return context;
}
