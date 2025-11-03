import axios, { AxiosError } from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false,
  timeout: 10000,
});

// Track if we're currently refreshing
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Request interceptor: Attach access token
api.interceptors.request.use(
  (config) => {
    // Get token from memory (will be set by AuthContext)
    const token = (window as any).__accessToken__;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Handle 401 and refresh token
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest: any = error.config;

    // If error is 401 and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        // No refresh token, redirect to login
        isRefreshing = false;
        window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        // Call refresh endpoint
        const { data } = await axios.post(`${API_BASE}/auth/refresh`, {}, {
          headers: { Authorization: `Bearer ${refreshToken}` },
        });

        const newAccessToken = data.accessToken;
        const newRefreshToken = data.refreshToken;

        // Update tokens
        (window as any).__accessToken__ = newAccessToken;
        localStorage.setItem('refreshToken', newRefreshToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        // Process queued requests
        processQueue(null, newAccessToken);
        isRefreshing = false;

        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        isRefreshing = false;

        localStorage.removeItem('refreshToken');
        (window as any).__accessToken__ = null;
        window.location.href = '/login';

        return Promise.reject(refreshError);
      }
    }

    const enhancedError: any = {
      ...error,
      message: 'Something went wrong. Please try again.',
    };

    if (!error.response) {
      enhancedError.message = 'Network error. Please check your connection.';
    } else if (error.response.status >= 500) {
      enhancedError.message = 'Server error. Please try again later.';
    } else if (error.response.status >= 400) {
      const responseData = error.response.data as any;
      if (responseData?.message) {
        enhancedError.message = typeof responseData.message === 'string'
          ? responseData.message
          : Array.isArray(responseData.message)
          ? responseData.message[0]
          : responseData.message.message || 'Request failed';
      }
    }

    return Promise.reject(enhancedError);
  }
);

export interface RegisterPayload {
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterResponse {
  message: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
  };
}

export interface UserProfile {
  _id: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export async function registerUser(payload: RegisterPayload): Promise<RegisterResponse> {
  const { data } = await api.post<RegisterResponse>('/user/register', payload);
  return data;
}

export async function loginUser(payload: LoginPayload): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>('/auth/login', payload);
  return data;
}

export async function logoutUser(): Promise<void> {
  await api.post('/auth/logout');
}

export async function getUserProfile(): Promise<UserProfile> {
  const { data } = await api.get<UserProfile>('/auth/profile');
  return data;
}