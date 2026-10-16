import { type ReactNode, useEffect } from 'react';
import { useAuthStore } from '@/app/stores/auth.store';
import { useKeycloakInit } from '../hooks/useAuth';
import { profileApi } from '@/shared/lib/api';
import type { Profile } from '@/types/auth';

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * AuthProvider - Wraps the app and ensures Keycloak is initialized
 * Also loads profile if user is authenticated
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const { user, sign, setProfile, setSign, isAuthenticated, logout } = useAuthStore();
  const { initError } = useKeycloakInit();
  
  // Load profile when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user && !sign) {
      loadProfile();
    }
  }, [isAuthenticated, user, sign]);
  
  // Handle token expiration
  useEffect(() => {
    if (!isAuthenticated) {
      logout();
    }
  }, [isAuthenticated, logout]);
  
  async function loadProfile() {
    try {
      const profile: Profile = await profileApi.get();
      setProfile(profile);
      setSign(profile.sign);
    } catch (error: any) {
      // 404 = profile doesn't exist yet, user needs to create it
      if (error.response?.status !== 404) {
        console.error('Failed to load profile:', error);
      }
    }
  }
  
  if (initError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Erro de Autenticação</h1>
          <p className="text-muted-foreground">
            Não foi possível inicializar a autenticação. Tente novamente.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="btn btn-primary mt-4"
          >
            Recarregar
          </button>
        </div>
      </div>
    );
  }
  
  return <>{children}</>;
}