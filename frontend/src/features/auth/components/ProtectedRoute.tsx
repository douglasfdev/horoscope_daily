import { type ReactNode, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/app/stores/auth.store';

interface ProtectedRouteProps {
  children: ReactNode;
  redirectTo?: string;
  requireProfile?: boolean;
}

/**
 * ProtectedRoute - Wraps routes that require authentication
 * Optionally requires a complete profile (redirects to /perfil if missing)
 */
export function ProtectedRoute({
  children,
  redirectTo = '/login',
  requireProfile = false,
}: ProtectedRouteProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isLoading, user, profile } = useAuthStore();
  
  useEffect(() => {
    // Not loading and not authenticated
    if (!isLoading && !isAuthenticated) {
      navigate(redirectTo, {
        state: { from: location.pathname },
        replace: true,
      });
    }
    
    // Profile required but not complete
    if (!isLoading && isAuthenticated && requireProfile && !profile) {
      navigate('/perfil', {
        state: { from: location.pathname },
        replace: true,
      });
    }
  }, [isAuthenticated, isLoading, profile, navigate, location, redirectTo, requireProfile]);
  
  // Show loading state
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }
  
  // Not authenticated
  if (!isAuthenticated) {
    return null;
  }
  
  // Profile required but missing
  if (requireProfile && !profile) {
    return null;
  }
  
  return <>{children}</>;
}