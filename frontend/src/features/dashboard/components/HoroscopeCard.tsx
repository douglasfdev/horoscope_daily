import { Card } from '@/shared/ui/Card';
import { getSignEmoji, getSignColor } from '@/shared/lib/zodiac';
import type { ZodiacSign } from '@/types/auth';

interface HoroscopeCardProps {
  sign: ZodiacSign;
  date: string;
  prediction: string;
  luckyNumber: number;
  color: string;
}

/**
 * HoroscopeCard - Displays the daily horoscope
 * Uses zodiac sign specific styling
 */
export function HoroscopeCard({ sign, date, prediction, luckyNumber, color }: HoroscopeCardProps) {
  const emoji = getSignEmoji(sign);
  const signColor = getSignColor(color);
  
  return (
    <Card className="bg-gradient-to-br from-card to-card/50 shadow-xl">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-4xl">{emoji}</div>
            <div>
              <h2 className="text-xl font-bold text-foreground">
                Seu Horóscopo do Dia
              </h2>
              <p className="text-sm text-muted-foreground">
                {new Date(date).toLocaleDateString('pt-BR')}
              </p>
            </div>
          </div>
        </div>
        
        {/* Prediction */}
        <div className="rounded-lg bg-background/50 p-4">
          <p className="text-base leading-relaxed text-foreground">
            {prediction}
          </p>
        </div>
        
        {/* Details */}
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-lg bg-background/30 p-4 text-center">
            <div className="text-xs text-muted-foreground uppercase tracking-wide">
              Número da Sorte
            </div>
            <div className="mt-1 text-2xl font-bold text-foreground">
              {luckyNumber}
            </div>
          </div>
          
          <div className="rounded-lg bg-background/30 p-4 text-center">
            <div className="text-xs text-muted-foreground uppercase tracking-wide">
              Cor
            </div>
            <div className="mt-1 flex items-center justify-center gap-2">
              <div className={`w-4 h-4 rounded-full bg-${signColor}-500`} />
              <span className="text-sm font-medium text-foreground capitalize">
                {signColor}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}