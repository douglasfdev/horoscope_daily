import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface IChart {
  id?: string;
  userId: string;
  sign: string;
  data: any;
  calculatedAt: Date;
  createdAt: Date;
}

export const supabase: SupabaseClient = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

export class SupabaseAstroRepository {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = supabase;
  }

  async saveChart(chart: IChart): Promise<string> {
    const { data, error } = await this.supabase
      .from('natal-charts')
      .insert({
        user_id: chart.userId,
        sign: chart.sign,
        data: chart.data,
        calculated_at: chart.calculatedAt,
        created_at: chart.createdAt,
      })
      .select('id')
      .single();

    if (error) throw error;
    return data.id;
  }

  async findLatest(): Promise<IChart[]> {
    const { data, error } = await this.supabase
      .from('natal-charts')
      .select('*')
      .order('calculated_at', { ascending: false })
      .limit(5);

    if (error) throw error;
    return data as IChart[];
  }

  async close(): Promise<void> {
    // Supabase client doesn't need explicit closing
  }
}