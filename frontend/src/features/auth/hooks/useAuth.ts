import { useEffect, useState, useCallback } from 'react';
import { useAuthStore } from '@/app/stores/auth.store';
import { getKeycloak, initKeycloak as initKC } from '../lib/keycloak';

/**
 * Hook to initialize Keycloak authentication
 * Should be called in AuthProvider
 */
export function useKeycloakInit() {
  const { login, setLoading } = useAuthStore();
  const [initError, setInitError] = useState<Error | null>(null);
  
  useEffect(() => {
    let isMounted = true;
    
    const init = async () => {
      setLoading(true);
      
      try {
        const { authenticated, user } = await initKC();
        
        if (isMounted) {
          if (authenticated && user) {
            login(user);
          } else {
            setLoading(false);
          }
        }
      } catch (error) {
        if (isMounted) {
          setInitError(error as Error);
          setLoading(false);
        }
      }
    };
    
    init();
    
    return () => {
      isMounted = false;
    };
  }, [login, setLoading]);
  
  return { initError };
}

/**
 * Main auth hook for components
 */
export function useAuth() {
  const { user, isAuthenticated, isLoading, logout, sign } = useAuthStore();
  
  return {
    user,
    isAuthenticated,
    isLoading,
    sign,
    logout,
  };
}

/**
 * Hook for profile-related logic
 */
export function useProfile() {
  const { profile, sign, setProfile, setSign } = useAuthStore();
  
  return {
    profile,
    sign,
    hasProfile: !!profile,
  };
}