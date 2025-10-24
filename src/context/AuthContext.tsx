import React, { createContext, useContext, useEffect, useState } from 'react';
import client from '../api/client';

type User = {
  id: number;
  username: string;
  email?: string;
  roles?: string[]; // e.g., ['admin', 'manager']
};

type AuthContextValue = {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  hasRole: (roles: string | string[]) => boolean;
  setUser: (u: User | null) => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const raw = localStorage.getItem('ims_user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('auth_token'));

  useEffect(() => {
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  }, [token]);

  useEffect(() => {
    if (user) localStorage.setItem('ims_user', JSON.stringify(user));
    else localStorage.removeItem('ims_user');
  }, [user]);

  const login = async (email: string, password: string) => {
    const res = await client.post('/users/login', { email, password });
    const data = res.data;
    if (!data) throw new Error('No login data returned');

    if (data.token) {
      setToken(data.token);
    }

    const u: User = {
      id: data.user?.id,
      username: data.user?.username || data.user?.email,
      email: data.user?.email,
      roles: data.user?.roles || (data.user?.role ? [data.user.role] : [])
    };
    setUser(u);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('ims_user');
  };

  const hasRole = (roles: string | string[]) => {
    if (!user?.roles?.length) return false;
    const check = Array.isArray(roles) ? roles : [roles];
    return check.some((r) => user.roles!.includes(r));
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, hasRole, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}