import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { accessToken } = useAuth();
  const refreshToken = localStorage.getItem('refreshToken');

  if (!accessToken && !refreshToken) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}