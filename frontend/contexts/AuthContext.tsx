import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { API_ENDPOINTS } from '@/config/api';
import { logger } from '@/utils/logger';

interface User {
  id: number;
  email: string;
  username: string;
  is_admin: boolean;
  is_active: boolean;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  isAdmin: boolean;
  isAuthenticated: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      // Only access localStorage in the browser
      if (typeof window === 'undefined') {
        setLoading(false);
        return;
      }

      const savedToken = localStorage.getItem('token');
      if (savedToken) {
        try {
          const response = await fetch(API_ENDPOINTS.AUTH_ME, {
            headers: {
              'Authorization': `Bearer ${savedToken}`,
              'Content-Type': 'application/json',
            },
          });
          
          if (response.ok) {
            const userData = await response.json();
            setUser(userData);
            setToken(savedToken);
          } else {
            localStorage.removeItem('token');
            setToken(null);
          }
        } catch (error) {
          logger.logError(error as Error, 'AuthContext.initializeAuth');
          localStorage.removeItem('token');
          setToken(null);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (username: string, password: string): Promise<void> => {
    try {
      logger.logUserAction('login_attempt', { username });
      
      const response = await fetch(API_ENDPOINTS.AUTH_LOGIN, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        logger.logUserAction('login_failed', { username, error: errorData.detail });
        throw new Error(errorData.detail || 'Login failed');
      }

      const data = await response.json();
      const newToken = data.access_token;
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', newToken);
      }
      setToken(newToken);
      
      logger.logUserAction('login_success', { username });

      const userResponse = await fetch(API_ENDPOINTS.AUTH_ME, {
        headers: {
          'Authorization': `Bearer ${newToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (userResponse.ok) {
        const userData = await userResponse.json();
        setUser(userData);
        logger.logUserAction('user_data_loaded', { userId: userData.id });
      }
    } catch (error) {
      logger.logError(error as Error, 'AuthContext.login');
      throw error;
    }
  };

  const register = async (username: string, email: string, password: string): Promise<void> => {
    try {
      logger.logUserAction('register_attempt', { username, email });
      
      const response = await fetch(API_ENDPOINTS.AUTH_REGISTER, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        logger.logUserAction('register_failed', { username, email, error: errorData.detail });
        throw new Error(errorData.detail || 'Registration failed');
      }

      logger.logUserAction('register_success', { username, email });
      await login(username, password);
    } catch (error) {
      logger.logError(error as Error, 'AuthContext.register');
      throw error;
    }
  };

  const logout = () => {
    logger.logUserAction('logout', { userId: user?.id });
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
    setToken(null);
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    register,
    logout,
    loading,
    isAdmin: user?.is_admin || false,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};