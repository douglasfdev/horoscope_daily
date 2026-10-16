import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/app/stores/auth.store';
import { ProfileForm } from '../components/ProfileForm';
import { zodiacSigns } from '@/shared/lib/zodiac';

/**
 * ProfilePage - Page for users to complete their profile
 * Only accessible when user doesn't have a profile yet
 */
export function ProfilePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, sign, setSign } = useAuthStore();
  
  // Redirect if already has profile (sign exists)
  const from = (location.state as { from?: string })?.from || '/dashboard';
  
  if (sign) {
    navigate(from, { replace: true });
    return null;
  }
  
  // Calculate what sign would be (for display only)
  const predictedSign = user?.birthDate ? zodiacSigns[new Date(user.birthDate).getMonth() + 1 as keyof typeof zodiacSigns] : null;
  
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
        
        {predictedSign && (
          <div className="mb-6 rounded-lg bg-card p-4 text-center">
            <p className="text-sm text-muted-foreground">Seu signo será: </p>
            <p className="text-xl font-semibold text-primary">{predictedSign.name}</p>
          </div>
        )}
        
        <div className="rounded-lg bg-card p-6 shadow-sm">
          <ProfileForm />
        </div>
        
        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/')}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Volver ao início
          </button>
        </div>
      </div>
    </div>
  );
}