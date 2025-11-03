import { useQuery } from '@tanstack/react-query';
import { getUserProfile } from '../api/userApi';
import { useAuth } from '../contexts/AuthContext';

export function useProfileQuery() {
  const { accessToken } = useAuth();

  return useQuery({
    queryKey: ['profile'],
    queryFn: getUserProfile,
    enabled: !!accessToken, // Only run if authenticated
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}