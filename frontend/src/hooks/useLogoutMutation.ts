import { useMutation, useQueryClient } from '@tanstack/react-query';
import { logoutUser } from '../api/userApi';
import { useAuth } from '../contexts/AuthContext';

export function useLogoutMutation() {
  const { logout } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => logoutUser(),
    onSuccess: () => {
      logout();
      queryClient.clear(); // Clear all cached queries
    },
    onError: () => {
      // Still logout locally even if API call fails
      logout();
      queryClient.clear();
    },
  });
}