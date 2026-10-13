import { Language } from '../value-objects/language';

export interface HoroscopeResult {
  sign: string;
  date: string;
  language: Language;
  horoscope: string;
  generatedAt: Date;
  cacheHit: boolean;
}