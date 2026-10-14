import { Sign } from '../../domain/value-objects/Sign.js';
import { DateTimeVO } from '../../domain/value-objects/DateTimeVO.js';
import { HoroscopeEntity } from '../../domain/entities/HoroscopeEntity.js';
import { NatalChartEntity } from '../../domain/entities/NatalChartEntity.js';

export interface HoroscopeEnginePort {
  fetchHoroscope(sign: string, date: string, lang: string): Promise<HoroscopeEntity>;
  isValidSign(sign: string, lang: string): Promise<boolean>;
}

export interface AstroCalculationPort {
  generateNatalChart(
    birthDate: string | Date,
    birthTime: string | Date,
    latitude: number,
    longitude: number,
    timezone: string
  ): Promise<NatalChartEntity>;

  getCurrentPlanetPositions(date?: string | Date): Promise<Map<string, string>>;

  calculateAscendant(
    birthDate: string | Date,
    birthTime: string | Date,
    latitude: number,
    longitude: number,
    timezone: string
  ): Promise<string>;
}