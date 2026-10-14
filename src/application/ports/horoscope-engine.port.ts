import { HoroscopeResult } from '../../domain/entities/horoscope-result.js';

export interface HoroscopeEnginePort {
  fetchHoroscope(sign: string, date: string, lang: string): Promise<HoroscopeResult>;
}