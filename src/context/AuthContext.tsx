import React, { createContext, useContext, useState, useEffect } from 'react';
import { ApiClient } from '../api/client';
import { User, Business } from '../types';

interface AuthContextType {
  user: User | null;
  business: Business | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: any) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  switchDemoTenant: (businessType: 'lagos' | 'kano') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    try {
      const data = await ApiClient.getMe();
      setUser(data.user);
      setBusiness(data.business);
    } catch {
      setUser(null);
      setBusiness(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleUnauthorized = () => {
      setUser(null);
      setBusiness(null);
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);

    const token = localStorage.getItem('stockpredict_token');
    if (token) {
      refreshUser();
    } else {
      // Auto login with default Oluwaseun Lagos demo business for instant review!
      login('oluwaseun@provisions.ng', 'Password123!').catch(() => {
        setLoading(false);
      });
    }

    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, []);

  const login = async (email: string, pass: string) => {
    setLoading(true);
    try {
      const res = await ApiClient.login(email, pass);
      setUser(res.user);
      const me = await ApiClient.getMe();
      setBusiness(me.business);
    } finally {
      setLoading(false);
    }
  };

  const register = async (payload: any) => {
    setLoading(true);
    try {
      const res = await ApiClient.register(payload);
      setUser(res.user);
      const me = await ApiClient.getMe();
      setBusiness(me.business);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    ApiClient.setToken(null);
    setUser(null);
    setBusiness(null);
  };

  const switchDemoTenant = async (businessType: 'lagos' | 'kano') => {
    if (businessType === 'lagos') {
      await login('oluwaseun@provisions.ng', 'Password123!');
    } else {
      await login('aminu@kanosupplies.ng', 'Password123!');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        business,
        loading,
        login,
        register,
        logout,
        refreshUser,
        switchDemoTenant,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
