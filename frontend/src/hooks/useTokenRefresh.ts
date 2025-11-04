// frontend/src/hooks/useTokenRefresh.ts
import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {  getTokenExpiryTime } from '../utils/tokenUtils';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL;

export function useTokenRefresh() {
  const { accessToken, setAuth } = useAuth();

  useEffect(() => {
    if (!accessToken) return;

    const expiryTime = getTokenExpiryTime(accessToken);
    if (!expiryTime) return;

    const timeUntilRefresh = expiryTime - Date.now() - (2 * 60 * 1000);

    if (timeUntilRefresh <= 0) {
      refreshToken();
      return;
    }

    const timerId = setTimeout(() => {
      refreshToken();
    }, timeUntilRefresh);

    return () => clearTimeout(timerId);
  }, [accessToken]);

  const refreshToken = async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) return;

    try {
      const { data } = await axios.post(`${API_BASE}/auth/refresh`, {}, {
        headers: { Authorization: `Bearer ${refreshToken}` },
      });

      (window as any).__accessToken__ = data.accessToken;
      localStorage.setItem('refreshToken', data.refreshToken);
      setAuth(
        { id: data.user?.id || '', email: data.user?.email || '' },
        data.accessToken
      );

      console.log('Token refreshed silently');
    } catch (error) {
      console.error('Silent refresh failed:', error);
    }
  };
}