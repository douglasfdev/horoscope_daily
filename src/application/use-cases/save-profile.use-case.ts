// @ts-ignore -- reflect-metadata is a runtime side-effect import without declarations in this setup.
import 'reflect-metadata';
import { IProfile } from '../../infrastructure/database/models/profile.model.js';
import { supabase } from '../../infrastructure/database/models/profile.model.js';

export async function getProfileUseCase(userId: string): Promise<IProfile | null> {
  const { data, error } = await supabase.from('profiles').select('*').eq('user_id', userId).single();
  if (error) return null;
  return data as IProfile;
}

export async function saveProfileUseCase(profile: IProfile): Promise<IProfile> {
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