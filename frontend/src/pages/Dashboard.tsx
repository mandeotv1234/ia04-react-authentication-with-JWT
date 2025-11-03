import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
import { useLogoutMutation } from '../hooks/useLogoutMutation';
import { useProfileQuery } from '../hooks/useProfileQuery';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const logoutMutation = useLogoutMutation();
  const profileQuery = useProfileQuery();

  const handleLogout = () => {
    logoutMutation.mutate();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
              <p className="text-gray-600">Welcome back to your account</p>
            </div>
            <Button 
              variant="danger" 
              onClick={handleLogout}
              isLoading={logoutMutation.isPending}
            >
              Logout
            </Button>
          </div>

          {profileQuery.isLoading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-4">Loading profile...</p>
            </div>
          )}

          {profileQuery.isError && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800">Failed to load profile</p>
            </div>
          )}

          {profileQuery.data && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">User Information</h2>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-gray-600">Email:</span>
                    <p className="text-lg text-gray-900">{profileQuery.data.email}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">User ID:</span>
                    <p className="text-sm text-gray-700 font-mono">{profileQuery.data._id}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Account Created:</span>
                    <p className="text-sm text-gray-700">
                      {new Date(profileQuery.data.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-xl border border-gray-200">
                  <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mb-3">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-gray-900">Authenticated</h3>
                  <p className="text-sm text-gray-600 mt-1">JWT Active</p>
                </div>

                <div className="bg-white p-4 rounded-xl border border-gray-200">
                  <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-3">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-gray-900">Secure</h3>
                  <p className="text-sm text-gray-600 mt-1">Protected Route</p>
                </div>

                <div className="bg-white p-4 rounded-xl border border-gray-200">
                  <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mb-3">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-gray-900">Auto Refresh</h3>
                  <p className="text-sm text-gray-600 mt-1">Token Renewal</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}