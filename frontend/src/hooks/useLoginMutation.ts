import { useMutation } from '@tanstack/react-query';
import { loginUser, type LoginPayload, type LoginResponse } from '../api/userApi';
import { useAuth } from '../contexts/AuthContext';

export function useLoginMutation() {
  const { setAuth } = useAuth();

  return useMutation<LoginResponse, any, LoginPayload>({
    mutationFn: (payload: LoginPayload) => loginUser(payload),
    onSuccess: (data) => {
      // Store tokens
      (window as any).__accessToken__ = data.accessToken;
      localStorage.setItem('refreshToken', data.refreshToken);

      // Update auth context
      setAuth(data.user, data.accessToken);
    },
    onError: (error) => {
      console.error('Login failed:', error);
    },
  });
}