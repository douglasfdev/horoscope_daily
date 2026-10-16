import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { profileApi } from '@/shared/lib/api';
import { useAuthStore } from '@/app/stores/auth.store';
import { zodiacSigns } from '@/shared/lib/zodiac';

const profileSchema = z.object({
  birthDate: z.date({
    required_error: 'Data de nascimento é obrigatória',
  }).refine((date) => date <= new Date(), {
    message: 'Data de nascimento não pode ser futura',
  }).refine((date) => {
    const minAge = 13;
    const age = new Date().getFullYear() - date.getFullYear();
    return age >= minAge;
  }, {
    message: 'É necessário ter 13 anos ou mais',
  }),
  
  phone: z.string().optional().refine((phone) => {
    if (!phone?.trim()) return true;
    return /^\+55\s?\d{2}\s?\d{4,5}-?\d{4}$/.test(phone.trim());
  }, {
    message: 'Formato inválido. Ex: +55 11 99999-9999',
  }),
});

type ProfileFormData = z.infer<typeof profileSchema>;

/**
 * ProfileForm - Form to create user profile
 * Collects birth date and phone number
 * Zodiac sign is calculated automatically by backend
 */
export function ProfileForm() {
  const { user } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });
  
  // Get watched data for preview
  const birthDate = watch('birthDate');
  
  const onSubmit = async (data: ProfileFormData) => {
    if (!user?.id) return;
    
    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      await profileApi.create({
        userId: user.id,
        birthDate: data.birthDate.toISOString(),
        phone: data.phone?.trim() || null,
      });
      
      // Profile created successfully - redirect to dashboard
      window.location.href = '/dashboard';
    } catch (error: any) {
      setSubmitError(
        error.response?.data?.message || 
        'Falha ao salvar perfil. Tente novamente.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Format phone number with mask
  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 2) return `+55 ${numbers}`;
    if (numbers.length <= 4) return `+55 ${numbers.slice(0, 2)} ${numbers.slice(2)}`;
    if (numbers.length <= 9) return `+55 ${numbers.slice(0, 2)} ${numbers.slice(2, 4)}-${numbers.slice(4)}`;
    return `+55 ${numbers.slice(0, 2)} ${numbers.slice(2, 4)}-${numbers.slice(4, 9)}`;
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {submitError && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {submitError}
        </div>
      )}
      
      <div className="space-y-2">
        <label htmlFor="birthDate" className="text-sm font-medium leading-none">
          Data de Nascimento *
        </label>
        <input
          type="date"
          id="birthDate"
          max={new Date().toISOString().split('T')[0]}
          {...register('birthDate')}
          className="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        />
        {errors.birthDate && (
          <p className="text-sm text-destructive">{errors.birthDate.message}</p>
        )}
      </div>
      
      <div className="space-y-2">
        <label htmlFor="phone" className="text-sm font-medium leading-none">
          Telefone (opcional)
        </label>
        <input
          type="tel"
          id="phone"
          placeholder="+55 11 99999-9999"
          {...register('phone', {
            onChange: (e) => {
              // Still use the raw value for validation
            },
          })}
          className="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        />
        {errors.phone && (
          <p className="text-sm text-destructive">{errors.phone.message}</p>
        )}
        <p className="text-xs text-muted-foreground">
          Para receber seus horóscopos por WhatsApp
        </p>
      </div>
      
      <div className="pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Salvando...
            </>
          ) : (
            'Salvar Perfil'
          )}
        </button>
      </div>
    </form>
  );
}