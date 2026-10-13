import { Sign } from '../../domain/value-objects/Sign';
import { DateTimeVO } from '../../domain/value-objects/DateTimeVO';
import { HoroscopeEntity } from '../../domain/entities/HoroscopeEntity';
import { NatalChartEntity } from '../../domain/entities/NatalChartEntity';

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