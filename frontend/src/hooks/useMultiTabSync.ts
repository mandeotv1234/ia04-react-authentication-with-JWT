import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

export function useMultiTabSync() {
  const { logout } = useAuth();

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'refreshToken' && e.newValue === null) {
        logout();
        window.location.href = '/login';
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [logout]);
}