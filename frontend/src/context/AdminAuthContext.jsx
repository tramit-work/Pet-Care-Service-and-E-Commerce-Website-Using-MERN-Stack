import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import adminAxiosClient from '../api/adminAxiosClient';

const AdminAuthContext = createContext(null);

const TOKEN_KEY = 'petcare_admin_token';
const USER_KEY = 'petcare_admin_user';

export function AdminAuthProvider({ children }) {
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
    adminAxiosClient
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    function handleUnauthorized() {
      setToken(null);
      setUser(null);
    }
    window.addEventListener('admin-auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('admin-auth:unauthorized', handleUnauthorized);
  }, []);

  async function login(email, password) {
    setLoading(true);
    setError(null);
    try {
      const { data } = await adminAxiosClient.post('/auth/admin-login', { email, password });
      setToken(data.token);
      setUser(data.user);
      return data.user;
    } catch (err) {
      const message = err.response?.data?.message || 'Đăng nhập thất bại';
      const details = err.response?.data?.details || null;
      setError(message);
      const authError = new Error(message);
      authError.details = details;
      throw authError;
    } finally {
      setLoading(false);
    }
  }

  function logout() {
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
      loading,
      error,
      login,
      logout,
    }),
    [user, token, loading, error]
  );

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth phải được dùng bên trong AdminAuthProvider');
  }
  return context;
}
