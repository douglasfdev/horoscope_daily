import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/app/stores/auth.store';
import { ProfileForm } from '../components/ProfileForm';

/**
 * ProfilePage - Page for users to complete their profile
 * Only accessible when user doesn't have a profile yet
 */
export function ProfilePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { sign } = useAuthStore();

  // Redirect if already has profile (sign exists)
  const from = (location.state as { from?: string })?.from || '/dashboard';

  if (sign) {
    return <Navigate to={from} replace />;
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-background to-muted p-4">
      <div className="w-full max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Complete seu perfil
          </h1>
          <p className="text-muted-foreground mt-2">
            Precisamos de alguns dados para personalizar seus horóscopos
          </p>
        </div>

        <div className="rounded-lg bg-card p-6 shadow-sm">
          <ProfileForm />
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/')}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Voltar ao início
          </button>
        </div>
      </div>
    </div>
  );
}
