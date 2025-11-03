import { useMutation, useQueryClient } from '@tanstack/react-query';
import { registerUser, type RegisterPayload, type RegisterResponse } from '../api/userApi';

interface ApiError {
  response?: {
    data?: {
      message?: string | {
        message?: string;
        error?: string;
        statusCode?: number;
      };
      statusCode?: number;
    };
  };
  message?: string;
}

export function useRegisterMutation() {
  const queryClient = useQueryClient();

  return useMutation<RegisterResponse, ApiError, RegisterPayload>({
    mutationFn: (payload: RegisterPayload) => registerUser(payload),
    onSuccess: (data: RegisterResponse) => {
      console.log('Registration successful:', data.message);
      
      // Invalidate and refetch any user-related queries if needed
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
    onError: (error: ApiError) => {
      console.error('Registration failed:', error);
      console.error('Full error object:', JSON.stringify(error, null, 2));
    },
    // Retry configuration
    retry: (failureCount, error) => {
      // Don't retry on 4xx errors (client errors)
      if (error.response?.data?.statusCode && error.response.data.statusCode >= 400 && error.response.data.statusCode < 500) {
        return false;
      }
      // Retry up to 2 times for other errors
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}