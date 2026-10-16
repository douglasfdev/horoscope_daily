import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, Profile, ZodiacSign } from '@/types/auth';

interface AuthState {
  user: User | null;
  profile: Profile | null;
  sign: ZodiacSign | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  setUser: (user: User | null) => void;
  setProfile: (profile: Profile | null) => void;
  setSign: (sign: ZodiacSign) => void;
  login: (user: User) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
}

/**
 * Auth store using Zustand with persistence
 * Stores user, profile, and zodiac sign in localStorage
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      profile: null,
      sign: null,
      isAuthenticated: false,
      isLoading: true,
      
      setUser: (user) => set({ user }),
      setProfile: (profile) => set({ profile }),
      setSign: (sign) => set({ sign }),
      login: (user) => set({ user, isAuthenticated: true, isLoading: false }),
      logout: () => {
        if (typeof window !== 'undefined') {
          window.localStorage.removeItem('daily-sorte-auth');
        }
        set({ user: null, profile: null, sign: null, isAuthenticated: false, isLoading: false });
      },
      setLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: 'daily-sorte-auth',
      partialize: (state) => ({
        user: state.user,
        profile: state.profile,
        sign: state.sign,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);