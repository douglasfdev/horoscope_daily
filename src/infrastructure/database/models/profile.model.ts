import { createClient, SupabaseClient } from '@supabase/supabase-js';
const { SUPABASE_URL, REDIS_PASSWORD } = process.env;

export interface IProfile {
  userId: string;       // Referência ao usuário (do Keycloak ou local)
  phone: string;        // número de celular para notificação
  preferredLanguage: string;  // idioma preferido ('pt', 'en', etc.)
  notificationOptIn: boolean; // concordância para receber notificação
  createdAt: Date;
  updatedAt: Date;
}

export type Profile = IProfile;

export const supabase: SupabaseClient = createClient(
  SUPABASE_URL!,
  REDIS_PASSWORD!
);

export async function getProfile(userId: string): Promise<IProfile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) return null;
  return data as IProfile;
}

export async function saveProfile(profile: IProfile): Promise<IProfile> {
  const { data, error } = await supabase
    .from('profiles')
    .upsert({
      user_id: profile.userId,
      phone: profile.phone,
      preferred_language: profile.preferredLanguage,
      notification_opt_in: profile.notificationOptIn,
    })
    .select()
    .single();

  if (error) throw error;
  return data as IProfile;
}