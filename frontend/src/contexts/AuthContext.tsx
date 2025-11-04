import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface User {
  id: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  setAuth: (user: User | null, accessToken: string | null) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check and refresh token on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const refreshToken = localStorage.getItem('refreshToken');
      
      if (!refreshToken) {
        setIsLoading(false);
        return;
      }

      try {
        console.log('🔄 Attempting to refresh token on app load...');
        
        const { data } = await axios.post(`${API_BASE}/auth/refresh`, {}, {
          headers: { Authorization: `Bearer ${refreshToken}` },
        });

        console.log('✅ Token refreshed successfully');
        
        // Store new tokens
        (window as any).__accessToken__ = data.accessToken;
        localStorage.setItem('refreshToken', data.refreshToken);
        
        setUser(data.user || null);
        setAccessToken(data.accessToken);
      } catch (error) {
        console.error('❌ Token refresh failed on load:', error);
        // Clear invalid tokens
        localStorage.removeItem('refreshToken');
        (window as any).__accessToken__ = null;
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  useEffect(() => {
  // Listen for token refresh events from axios interceptor
  const handleTokenRefresh = (event: any) => {
    console.log('🔄 Token refreshed event received');
    const { user: newUser, accessToken: newAccessToken } = event.detail;
    setUser(newUser);
    setAccessToken(newAccessToken);
  };

  window.addEventListener('token-refreshed', handleTokenRefresh);
  
  return () => {
    window.removeEventListener('token-refreshed', handleTokenRefresh);
  };
}, []);

  const setAuth = (newUser: User | null, newAccessToken: string | null) => {
    setUser(newUser);
    setAccessToken(newAccessToken);
    
    // Sync with window
    if (newAccessToken) {
      (window as any).__accessToken__ = newAccessToken;
    }
  };

  const logout = () => {
    setUser(null);
    setAccessToken(null);
    localStorage.removeItem('refreshToken');
    (window as any).__accessToken__ = null;
  };

  return (
    <AuthContext.Provider value={{ user, accessToken, isLoading, setAuth, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}