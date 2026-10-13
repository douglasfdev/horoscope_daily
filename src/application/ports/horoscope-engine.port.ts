import { HoroscopeResult } from '../../domain/entities/horoscope-result';
import { Language } from '../../domain/value-objects/language';

export interface HoroscopeEnginePort {
  fetchHoroscope(sign: string, date: string, lang: string): Promise<HoroscopeResult>;
}