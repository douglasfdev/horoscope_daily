import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { profileApi, horoscopeApi } from '@/shared/lib/api';
import type { Profile, Horoscope, ZodiacSign } from '@/types/auth';

// ============================================================================
// Profile Queries
// ============================================================================

export function useProfile() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: () => profileApi.get(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false, // Don't retry on 404
  });
}

export function useCreateProfile() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: { userId: string; birthDate: string; phone?: string | null }) =>
      profileApi.create(data),
    
    onSuccess: (newProfile) => {
      // Invalidate and refetch profile
      queryClient.setQueryData(['profile'], newProfile);
    },
    
    onError: (error) => {
      console.error('Failed to create profile:', error);
    },
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Partial<Profile>) => profileApi.update(data),
    
    onSuccess: (updatedProfile) => {
      queryClient.setQueryData(['profile'], updatedProfile);
    },
  });
}

// ============================================================================
// Horoscope Queries
// ============================================================================

export function useDailyHoroscope(
  sign: ZodiacSign | null,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: ['horoscope', 'daily', sign],
    queryFn: () => horoscopeApi.getDaily(sign!, 'pt'),
    enabled: !!sign && (options?.enabled ?? true),
    staleTime: 60 * 60 * 1000, // 1 hour (horoscopes don't change much)
    retry: 3,
  });
}

export function useHoroscopeMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ sign, date }: { sign: ZodiacSign; date?: string }) =>
      horoscopeApi.getDaily(sign, 'pt', date),
  });
}