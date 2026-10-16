import { type ReactNode, useEffect, useState } from 'react';
import { useAuthStore } from '@/app/stores/auth.store';
import { profileApi } from '@/shared/lib/api';
import { getKeycloak } from '../lib/keycloak';

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * AuthProvider - Wraps the app and ensures Keycloak is initialized.
 * Also loads the user's profile once authenticated (skipping 404 = no profile yet).
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const { user, sign, isAuthenticated, login, setProfile, setSign, setLoading } = useAuthStore();
  const [initError, setInitError] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // 1. Initialize Keycloak once on mount
  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      try {
        const kc = getKeycloak();
        const authenticated = await kc.init({
          onLoad: 'check-sso',
          pkceMethod: 'S256',
          checkLoginIframe: false,
        });

        if (!mounted) return;

        if (authenticated && kc.tokenParsed) {
          const token = kc.tokenParsed as Record<string, unknown>;
          login({
            id: (token.sub as string) ?? '',
            email: (token.email as string) || '',
            name: (token.name as string) || '',
            preferredUsername: (token.preferred_username as string) || '',
            preferredLanguage: (token.preferred_language as string) || 'pt',
            expiresAt: ((token.exp as number) ?? 0) * 1000,
          });
        } else {
          setLoading(false);
        }
      } catch (err) {
        console.error('Auth init error:', err);
        if (mounted) {
          setInitError(true);
          setLoading(false);
        }
      } finally {
        if (mounted) setInitialized(true);
      }
    };

    initialize();

    return () => {
      mounted = false;
    };
  }, [login, setLoading]);

  // 2. Load profile once authenticated (404 = profile not created yet)
  useEffect(() => {
    if (!initialized || !isAuthenticated || !user || sign) return;

    let mounted = true;

    const loadProfile = async () => {
      try {
        const profile = await profileApi.get();
        if (!mounted) return;
        setProfile(profile);
        setSign(profile.sign);
      } catch (error) {
        const status = (error as { response?: { status?: number } }).response?.status;
        if (status !== 404) {
          console.error('Failed to load profile:', error);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadProfile();

    return () => {
      mounted = false;
    };
  }, [initialized, isAuthenticated, user, sign, setProfile, setSign, setLoading]);

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
