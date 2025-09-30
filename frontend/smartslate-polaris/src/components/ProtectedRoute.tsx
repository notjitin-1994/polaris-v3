import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Loading component while checking authentication
 */
const AuthLoading = () => (
  <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#020C1B] to-[#0A1628]">
    <div className="text-center">
      <div className="relative inline-block">
        <div className="h-12 w-12 rounded-full border-3 border-white/20"></div>
        <div className="border-primary-400 absolute top-0 left-0 h-12 w-12 animate-spin rounded-full border-3 border-t-transparent"></div>
      </div>
      <p className="mt-4 text-sm text-white/60">Checking authentication...</p>
    </div>
  </div>
);

/**
 * Protected route wrapper that requires authentication
 */
export function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Show loading state while checking auth
  if (loading) {
    return <AuthLoading />;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    // Save the attempted location for redirect after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Render child routes if authenticated
  return <Outlet />;
}
