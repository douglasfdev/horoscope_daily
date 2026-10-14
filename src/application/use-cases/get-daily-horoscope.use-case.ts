// @ts-ignore -- reflect-metadata is a runtime side-effect import without declarations in this setup.
import 'reflect-metadata';
import { HoroscopeEnginePort } from '../../application/ports/astro-port.js';
import { HoroscopeEntity } from '../../domain/entities/HoroscopeEntity.js';
import { Sign } from '../../domain/value-objects/Sign.js';
import { DateTimeVO } from '../../domain/value-objects/DateTimeVO.js';
import { HoroscopeCacheService } from '../../infrastructure/caching/horoscope-cache.js';
import { injectable } from 'inversify';

@injectable()
export class GetDailyHoroscopeUseCase {
  constructor(
    private horoscopePort: HoroscopeEnginePort,
    private horoscopeCache: HoroscopeCacheService = new HoroscopeCacheService()
  ) { }

  async execute(sign: string, lang: string = 'pt', targetDate?: Date): Promise<HoroscopeEntity> {
    const normalizedSign = Sign.create(sign);
    const dateStr = targetDate
      ? DateTimeVO.create(targetDate.toISOString()).toDateString()
      : DateTimeVO.create(new Date().toISOString()).toDateString();

    // Try to get from cache (Redis first, then Supabase fallback)
    const cached = await this.horoscopeCache.getCachedHoroscope(
      normalizedSign.value,
      lang,
      targetDate
    );

    if (cached) {
      return this.mapToHoroscopeEntity(cached);
    }

    // Cache miss - fetch from library
    const result = await this.horoscopePort.fetchHoroscope(
      normalizedSign.toString(),
      dateStr,
      lang
    );

    // Save to cache (Redis + Supabase)
    if (result) {
      await this.horoscopeCache.saveHoroscopeToCache(
        normalizedSign.value,
        lang,
        result,
        // recipient can be obtained from user profile if needed
        undefined
      );
    }

    return result;
  }

  private mapToHoroscopeEntity(cached: any): HoroscopeEntity {
    return {
      sign: cached.sign,
      language: cached.language,
      date: cached.date,
      prediction: cached.prediction,
      luckyNumber: cached.luckyNumber,
      color: cached.color,
      compatibility: cached.compatibility,
      generatedAt: cached.generatedAt,
    };
  }
}