import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { injectable } from 'inversify';
import { Redis } from 'ioredis';
import { HoroscopeEntity } from '../../domain/entities/HoroscopeEntity.js';
import { DateTimeVO } from '../../domain/value-objects/DateTimeVO.js';
import { Sign } from '../../domain/value-objects/Sign.js';

import { loadConfig } from '../../config/index.js';

export interface ICachedHoroscope {
  sign: string;
  language: string;
  date: string;
  prediction: string;
  luckyNumber: number;
  color: string;
  compatibility: string[];
  generatedAt: Date;
  source: 'redis' | 'supabase' | 'library';
}

@injectable()
export class HoroscopeCacheService {
  private supabase?: SupabaseClient;
  private redis: Redis | null = null;
  private config: any;

  constructor() {
    this.config = loadConfig();
  }

  private getSupabaseClient(): SupabaseClient {
    return createClient(this.config.supabaseUrl, this.config.supabaseAnonKey);
  }

  private getRedisClient(): Redis | null {
    if (!this.redis) {
      try {
        const redisUri = this.config.redisUri;
        if (redisUri) {
          // Parse Upstash REST URL: https://token@instance.upstash.io
          const match = redisUri.match(/^https:\/\/([^:]+):(.+)@([^/]+)/);
          if (match) {
            const [, username, password, host] = match;
            this.redis = new Redis({
              host: host,
              port: 6379,
              username: username,
              password: password,
              tls: {} as any,
            });
          }
        }
      } catch (err) {
        console.error('❌ Failed to initialize Redis client:', err);
        this.redis = null;
      }
    }
    return this.redis;
  }

  private calculateTtlUntilEndOfDay(): number {
    const now = new Date();
    const midnight = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1,
      0,
      0,
      0
    );
    const diff = midnight.getTime() - now.getTime() - 1000;
    return Math.max(0, Math.ceil(diff / 1000));
  }

  private getRedisKey(sign: string, lang: string, date: string): string {
    const normalizedDate = date || DateTimeVO.create(new Date().toISOString()).toDateString();
    return `horoscope:${sign.toLowerCase()}:${lang}:${normalizedDate}`;
  }

  async getCachedHoroscope(
    sign: string,
    lang: string = 'pt',
    date?: Date
  ): Promise<ICachedHoroscope | null> {
    const redis = this.getRedisClient();
    const signObj = Sign.create(sign);
    const normalizedDate = date
      ? DateTimeVO.create(date.toISOString()).toDateString()
      : DateTimeVO.create(new Date().toISOString()).toDateString();

    const redisKey = this.getRedisKey(signObj.value, lang, normalizedDate);

    // Try Redis first
    if (redis) {
      try {
        const cached = await redis.get(redisKey);
        if (cached) {
          const parsed = JSON.parse(cached);
          return {
            ...parsed,
            source: 'redis' as const,
            generatedAt: new Date(parsed.generatedAt),
          } as ICachedHoroscope;
        }
      } catch (err) {
        console.warn('⚠️ Redis get failed, falling back to Supabase:', err);
        // Redis failed - continue to Supabase fallback
      }
    }

    // Fallback to Supabase
    return this.getFromSupabase(signObj.value, lang, normalizedDate);
  }

  private async getFromSupabase(
    sign: string,
    lang: string,
    date: string
  ): Promise<ICachedHoroscope | null> {
    const supabase = this.getSupabaseClient();
    const { data, error } = await supabase
      .from('horoscopes')
      .select('*')
      .eq('sign', sign)
      .eq('language', lang)
      .eq('date', date)
      .single();

    if (error || !data) {
      return null;
    }

    return {
      sign: data.sign,
      language: data.language,
      date: data.date,
      prediction: data.payload?.prediction || '',
      luckyNumber: data.payload?.luckyNumber || 1,
      color: data.payload?.color || 'cinza',
      compatibility: data.payload?.compatibility || [],
      generatedAt: new Date(data.createdAt),
      source: 'supabase' as const,
    } as ICachedHoroscope;
  }

  async saveHoroscopeToCache(
    sign: string,
    lang: string,
    horoscope: HoroscopeEntity,
    recipient?: { email?: string; phone?: string }
  ): Promise<void> {
    const redis = this.getRedisClient();
    const signObj = Sign.create(sign);
    const dateStr = DateTimeVO.create(new Date().toISOString()).toDateString();
    const redisKey = this.getRedisKey(signObj.value, lang, dateStr);

    const cachedData: ICachedHoroscope = {
      sign: horoscope.sign,
      language: horoscope.language,
      date: horoscope.date,
      prediction: horoscope.prediction,
      luckyNumber: horoscope.luckyNumber,
      color: horoscope.color,
      compatibility: horoscope.compatibility,
      generatedAt: horoscope.generatedAt,
      source: 'library' as const,
    };

    // Save to Redis with TTL until end of day
    if (redis) {
      try {
        const ttl = this.calculateTtlUntilEndOfDay();
        await redis.set(redisKey, JSON.stringify(cachedData), 'EX', ttl);
        console.log(`💾 Horoscope cached in Redis with TTL ${ttl}s (until end of day)`);
      } catch (err) {
        console.warn('⚠️ Redis set failed, saving to Supabase only:', err);
        // Redis failed - still save to Supabase
      }
    }

    // Always save to Supabase
    await this.saveHoroscopeToSupabase(signObj.value, lang, dateStr, cachedData, horoscope);
  }

  private async saveHoroscopeToSupabase(
    sign: string,
    lang: string,
    date: string,
    cachedData: ICachedHoroscope,
    horoscope: HoroscopeEntity
  ): Promise<void> {
    const supabase = this.getSupabaseClient();

    const { error } = await supabase
      .from('horoscopes')
      .upsert({
        sign: cachedData.sign,
        language: cachedData.language,
        date: cachedData.date,
        payload: {
          prediction: cachedData.prediction,
          luckyNumber: cachedData.luckyNumber,
          color: cachedData.color,
          compatibility: cachedData.compatibility,
        },
        createdAt: new Date(),
      });

    if (error) {
      console.error('❌ Failed to save horoscope to Supabase:', error);
    } else {
      console.log('💾 Horoscope saved to Supabase PostgreSQL');
    }
  }

  async invalidateCache(sign: string, lang: string = 'pt'): Promise<void> {
    const redis = this.getRedisClient();
    const signObj = Sign.create(sign);
    const redisKey = this.getRedisKey(signObj.value, lang, '');

    if (redis) {
      try {
        await redis.del(redisKey);
        console.log(`🗑️ Cache invalidated for ${sign} (${lang})`);
      } catch (err) {
        console.error('❌ Failed to invalidate Redis cache:', err);
      }
    }
  }

  getRedisStatus(): { connected: boolean; url?: string } {
    const redis = this.getRedisClient();
    if (redis) {
      return { connected: true, url: redis.options.host };
    }
    return { connected: false };
  }
}