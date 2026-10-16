import { useAuthStore } from '@/app/stores/auth.store';
import { useDailyHoroscope } from '@/shared/hooks/useQueries';
import { HoroscopeCard } from '../components/HoroscopeCard';
import { zodiacSigns } from '@/shared/lib/zodiac';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { Spinner } from '@/shared/ui/Spinner';

/**
 * DashboardPage - Main page showing daily horoscope
 * Uses React Query for data fetching with caching and error handling
 */
export function DashboardPage() {
  const { user, sign: storedSign } = useAuthStore();
  const { sign: activeSign } = useAuth();
  const currentSign = storedSign || activeSign;
  
  // Use React Query for horoscope
  const { data: horoscope, isLoading, isError, error } = useDailyHoroscope(currentSign, {
    enabled: !!currentSign,
  });
  
  if (!currentSign) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Spinner />
      </div>
    );
  }
  
  const signInfo = zodiacSigns[currentSign];
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-4">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Bom dia, {user?.name?.split(' ')[0] || 'Amor'}!
            </h1>
            <p className="text-muted-foreground">
              Seu horóscopo do dia
            </p>
          </div>
          
          <div className="text-right">
            <div className="text-4xl">{signInfo.emoji}</div>
            <p className="text-sm font-medium text-foreground">{signInfo.name}</p>
          </div>
        </header>
        
        {/* Horoscope Content */}
        {isLoading ? (
          <HoroscopeSkeleton />
        ) : isError ? (
          <HoroscopeError 
            message={error instanceof Error ? error.message : 'Erro ao carregar horóscopo'}
          />
        ) : horoscope ? (
          <HoroscopeCard
            sign={horoscope.sign}
            date={horoscope.date}
            prediction={horoscope.prediction}
            luckyNumber={horoscope.luckyNumber}
            color={horoscope.color}
          />
        ) : (
          <HoroscopeError message="Nenhum horóscopo disponível" />
        )}
        
        {/* Actions */}
        <div className="mt-8 flex gap-4">
          <button className="flex-1 rounded-lg bg-primary px-4 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
            Ver Mapa Astral
          </button>
          <button className="flex-1 rounded-lg border px-4 py-3 text-sm font-medium hover:bg-accent transition-colors">
            Ver Previsões
          </button>
        </div>
      </div>
    </div>
  );
}

// Loading skeleton
function HoroscopeSkeleton() {
  return (
    <div className="rounded-lg bg-card p-6 shadow-sm">
      <div className="animate-pulse space-y-4">
        <div className="h-6 w-3/4 rounded bg-muted" />
        <div className="h-4 rounded bg-muted" />
        <div className="h-4 rounded bg-muted" />
        <div className="h-20 rounded bg-muted" />
      </div>
    </div>
  );
}

// Error state
function HoroscopeError({ message }: { message: string }) {
  return (
    <div className="rounded-lg bg-destructive/10 p-4 text-destructive">
      {message}
    </div>
  );
}