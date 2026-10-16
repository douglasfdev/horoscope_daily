import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/app/stores/auth.store';
import { login } from '../lib/keycloak';

/**
 * LoginPage - Redirects to Keycloak for authentication
 * Or shows a loading state while initializing
 */
export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isLoading } = useAuthStore();
  
  // Get the page to redirect to after login
  const from = (location.state as { from?: string })?.from || '/';
  
  useEffect(() => {
    // If already authenticated, redirect
    if (isAuthenticated && !isLoading) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate, from]);
  
  // Handle login click
  const handleLogin = async () => {
    await login();
  };
  
  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-muted">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
          <p className="text-muted-foreground">Verificando sessão...</p>
        </div>
      </div>
    );
  }
  
  // Already authenticated
  if (isAuthenticated) {
    return null;
  }
  
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <div className="w-full max-w-md space-y-8 rounded-xl bg-card p-8 shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Daily Sorte
          </h1>
          <p className="text-muted-foreground mt-2">
            Seu horóscopo personalizado do dia
          </p>
        </div>
        
        <div className="space-y-4">
          <button
            onClick={handleLogin}
            className="w-full rounded-lg bg-primary px-4 py-3 text-white font-medium hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-colors"
          >
            Entrar com sua conta
          </button>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-d" />
            </div>
            <div className="relative flex justify-center text-sm uppercase">
              <span className="bg-card px-2 text-muted-foreground">ou</span>
            </div>
          </div>
          
          <p className="text-xs text-muted-foreground text-center">
            Ao entrar, você concorda com nossos termos de uso
          </p>
        </div>
      </div>
    </div>
  );
}