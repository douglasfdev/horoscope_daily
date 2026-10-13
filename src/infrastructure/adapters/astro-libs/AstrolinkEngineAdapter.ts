import { AstroCalculationPort } from '../../../application/ports/astro-calculation.port';
import { NatalChartEntity } from '../../../domain/entities/NatalChartEntity';
import { Coordinate } from '../../../domain/value-objects/Coordinate';
import { inject, injectable } from 'inversify';
import { TYPES } from '../../../application/di/types';
import { swe_calc, swe_houses, swe_julday, SE_SUN, SE_MOON, SE_MERCURY, SE_VENUS, SE_MARS, SE_JUPITER, SE_SATURN, SE_URANUS, NEPTUNE, PLUTO } from '@fusionstrings/swiss-eph';
import { Location } from '../../../domain/value-objects/location';

@injectable()
export class AstrolinkEngineAdapter implements AstroCalculationPort {
  calculateNatalChart(date: Date, time: string, location: Location): Promise<any> {
    throw new Error('Method not implemented.');
  }

  async generateNatalChart(
    birthDate: string | Date,
    birthTime: string | Date,
    latitude: number,
    longitude: number,
    timezone: string
  ): Promise<NatalChartEntity> {
    const coordinate = Coordinate.create(latitude, longitude);

    const birthDateObj = typeof birthDate === 'object' && birthDate instanceof Date ? birthDate : new Date(birthDate);
    let birthTimeStr = typeof birthTime === 'object' && birthTime instanceof Date ? birthTime.toTimeString().split(' ')[0] : String(birthTime).trim();
    const birthTimeObj = new Date(`1970-01-01T${birthTimeStr}`);

    const julday = swe_julday(
      birthDateObj.getFullYear(),
      birthDateObj.getMonth() + 1,
      birthDateObj.getDate() + (birthTimeObj.getHours() + birthTimeObj.getMinutes() / 60) / 24,
      birthTimeObj.getTimezoneOffset()
    );

    const sunPos = swe_calc(julday, SE_SUN, ' tropical')[0];
    const moonPos = swe_calc(julday, SE_MOON, ' tropical')[0];
    const mercuryPos = swe_calc(julday, SE_MERCURY, ' tropical')[0];
    const venusPos = swe_calc(julday, SE_VENUS, ' tropical')[0];
    const marsPos = swe_calc(julday, SE_MARS, ' tropical')[0];
    const jupiterPos = swe_calc(julday, SE_JUPITER, ' tropical')[0];
    const saturnPos = swe_calc(julday, SE_SATURN, ' tropical')[0];
    const uranusPos = swe_calc(julday, SE_URANUS, ' tropical')[0];
    const neptunePos = swe_calc(julday, NEPTUNE, ' tropical')[0];
    const plutoPos = swe_calc(julday, PLUTO, ' tropical')[0];

    const houses = swe_houses(julday, latitude, longitude, 'P');

    const signs = [
      'Áries', 'Touro', 'Gêmeos', 'Câncer', 'Leão', 'Virgem',
      'Libra', 'Escorpião', 'Sagitário', 'Capricórnio', 'Aquário', 'Peixes'
    ];

    const longitudeToSign = (lon: number): string => {
      const signIndex = Math.floor((lon + 30) / 30) % 12;
      return signs[signIndex] || 'Áries';
    };

    const planetPositions = new Map([
      ['sol', longitudeToSign(sunPos.lon)],
      ['luna', longitudeToSign(moonPos.lon)],
      ['mercurio', longitudeToSign(mercuryPos.lon)],
      ['venus', longitudeToSign(venusPos.lon)],
      ['marte', longitudeToSign(marsPos.lon)],
      ['jupiter', longitudeToSign(jupiterPos.lon)],
      ['saturno', longitudeToSign(saturnPos.lon)],
      ['urano', longitudeToSign(uranusPos.lon)],
      ['netuno', longitudeToSign(neptunePos.lon)],
      ['plutao', longitudeToSign(plutoPos.lon)],
    ]);

    const ascendant = houses[0];
    const mc = houses[3];
    const ascSign = longitudeToSign(ascendant);
    const mcSign = longitudeToSign(mc);

    return {
      name: 'Mapa Astral Natal',
      birthDate: birthDateObj,
      birthTime: birthTimeObj,
      latitude: coordinate.latitude,
      longitude: coordinate.longitude,
      timezone,
      houses: houses.map((h: number) => Math.round(h)),
      planetPositions,
      ascendant: ascSign,
      midheaven: mcSign,
      generatedAt: new Date(),
    };
  }

  async getCurrentPlanetPositions(date?: string | Date): Promise<Map<string, string>> {
    const targetDate = date || new Date();
    const targetDateObj = targetDate instanceof Date ? targetDate : new Date(targetDate);
    const julday = swe_julday(
      targetDateObj.getFullYear(),
      targetDateObj.getMonth() + 1,
      targetDateObj.getDate(),
      targetDateObj.getTimezoneOffset()
    );

    const signs = [
      'Áries', 'Touro', 'Gêmeos', 'Câncer', 'Leão', 'Virgem',
      'Libra', 'Escorpião', 'Sagitário', 'Capricórnio', 'Aquário', 'Peixes'
    ];

    const planetPositions = new Map([
      ['sol', this.signFromLongitude(swe_calc(julday, SE_SUN, ' tropical')[0].lon, signs)],
      ['luna', this.signFromLongitude(swe_calc(julday, SE_MOON, ' tropical')[0].lon, signs)],
      ['mercurio', this.signFromLongitude(swe_calc(julday, SE_MERCURY, ' tropical')[0].lon, signs)],
      ['venus', this.signFromLongitude(swe_calc(julday, SE_VENUS, ' tropical')[0].lon, signs)],
      ['marte', this.signFromLongitude(swe_calc(julday, SE_MARS, ' tropical')[0].lon, signs)],
      ['jupiter', this.signFromLongitude(swe_calc(julday, SE_JUPITER, ' tropical')[0].lon, signs)],
      ['saturno', this.signFromLongitude(swe_calc(julday, SE_SATURN, ' tropical')[0].lon, signs)],
      ['urano', this.signFromLongitude(swe_calc(julday, SE_URANUS, ' tropical')[0].lon, signs)],
      ['netuno', this.signFromLongitude(swe_calc(julday, NEPTUNE, ' tropical')[0].lon, signs)],
      ['plutao', this.signFromLongitude(swe_calc(julday, PLUTO, ' tropical')[0].lon, signs)],
    ]);

    return planetPositions;
  }

  private signFromLongitude(lon: number, signs: string[]): string {
    const signIndex = Math.floor((lon + 30) / 30) % 12;
    return signs[signIndex] || 'Áries';
  }

  async calculateAscendant(
    birthDate: string | Date,
    birthTime: string | Date,
    latitude: number,
    longitude: number,
    timezone: string
  ): Promise<string> {
    const result = await this.generateNatalChart(
      birthDate,
      birthTime,
      latitude,
      longitude,
      timezone
    );
    return result.ascendant;
  }
}