import { AstroCalculationPort } from '../../../application/ports/astro-calculation.port';
import { NatalChartEntity } from '../../../domain/entities/NatalChartEntity';
import { Coordinate } from '../../../domain/value-objects/Coordinate';
import { inject, injectable } from 'inversify';
import eph, { Constants, load } from '@fusionstrings/swiss-eph';
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

    const birthDateObj = birthDate instanceof Date ? birthDate : new Date(birthDate);
    let birthTimeStr = birthTime instanceof Date ? birthTime.toTimeString().split(' ')[0] : String(birthTime).trim();
    const birthTimeObj = new Date(`1970-01-01T${birthTimeStr}`);

    const eph = await load();

    const julday = eph.swe_julday(
      birthDateObj.getFullYear(),
      birthDateObj.getMonth() + 1,
      birthDateObj.getDate() + (birthTimeObj.getHours() + birthTimeObj.getMinutes() / 60) / 24,
      birthTimeObj.getTimezoneOffset(),
      Constants.SE_GREG_CAL
    );

    const sunPos = eph.swe_calc_ut(julday, Constants.SE_SUN, Constants.SEFLG_SPEED);
    const moonPos = eph.swe_calc_ut(julday, Constants.SE_MOON, Constants.SEFLG_SPEED);
    const mercuryPos = eph.swe_calc_ut(julday, Constants.SE_MERCURY, Constants.SEFLG_SPEED);
    const venusPos = eph.swe_calc_ut(julday, Constants.SE_VENUS, Constants.SEFLG_SPEED);
    const marsPos = eph.swe_calc_ut(julday, Constants.SE_MARS, Constants.SEFLG_SPEED);
    const jupiterPos = eph.swe_calc_ut(julday, Constants.SE_JUPITER, Constants.SEFLG_SPEED);
    const saturnPos = eph.swe_calc_ut(julday, Constants.SE_SATURN, Constants.SEFLG_SPEED);
    const uranusPos = eph.swe_calc_ut(julday, Constants.SE_URANUS, Constants.SEFLG_SPEED);
    const neptunePos = eph.swe_calc_ut(julday, Constants.SE_NEPTUNE, Constants.SEFLG_SPEED);
    const plutoPos = eph.swe_calc_ut(julday, Constants.SE_PLUTO, Constants.SEFLG_SPEED);

    const housesData = eph.swe_houses(julday, latitude, longitude, 'P'.charCodeAt(0));

    const signs = [
      'Áries', 'Touro', 'Gêmeos', 'Câncer', 'Leão', 'Virgem',
      'Libra', 'Escorpião', 'Sagitário', 'Capricórnio', 'Aquário', 'Peixes'
    ];

    const longitudeToSign = (lon: number): string => {
      const signIndex = Math.floor((lon + 30) / 30) % 12;
      return signs[signIndex] || 'Áries';
    };

    const planetPositions = new Map([
      ['sol', longitudeToSign(Number(sunPos.xx[0]))],
      ['luna', longitudeToSign(Number(moonPos.xx[0]))],
      ['mercurio', longitudeToSign(Number(mercuryPos.xx[0]))],
      ['venus', longitudeToSign(Number(venusPos.xx[0]))],
      ['marte', longitudeToSign(Number(marsPos.xx[0]))],
      ['jupiter', longitudeToSign(Number(jupiterPos.xx[0]))],
      ['saturno', longitudeToSign(Number(saturnPos.xx[0]))],
      ['urano', longitudeToSign(Number(uranusPos.xx[0]))],
      ['netuno', longitudeToSign(Number(neptunePos.xx[0]))],
      ['plutao', longitudeToSign(Number(plutoPos.xx[0]))],
    ]);

    const ascendant = housesData.cusps[0];
    const mc = housesData.ascmc[3];
    const ascSign = longitudeToSign(ascendant);
    const mcSign = longitudeToSign(mc);

    return {
      name: 'Mapa Astral Natal',
      birthDate: birthDateObj,
      birthTime: birthTimeObj,
      latitude: coordinate.latitude,
      longitude: coordinate.longitude,
      timezone,
      houses: Array.from({ length: 12 }, (_, i) => Math.round(housesData.cusps[i + 1])),
      planetPositions,
      ascendant: ascSign,
      midheaven: mcSign,
      generatedAt: new Date(),
    };
  }

  async getCurrentPlanetPositions(date?: string | Date): Promise<Map<string, string>> {
    const targetDate = date || new Date();
    const targetDateObj = targetDate instanceof Date ? targetDate : new Date(targetDate);

    const eph = await load();

    const julday = eph.swe_julday(
      targetDateObj.getFullYear(),
      targetDateObj.getMonth() + 1,
      targetDateObj.getDate(),
      targetDateObj.getTimezoneOffset(),
      Constants.SE_GREG_CAL
    );

    const signs = [
      'Áries', 'Touro', 'Gêmeos', 'Câncer', 'Leão', 'Virgem',
      'Libra', 'Escorpião', 'Sagitário', 'Capricórnio', 'Aquário', 'Peixes'
    ];

    const planetPositions = new Map([
      ['sol', this.signFromLongitude(Number(eph.swe_calc_ut(julday, Constants.SE_SUN, Constants.SEFLG_SPEED).xx[0]), signs)],
      ['luna', this.signFromLongitude(Number(eph.swe_calc_ut(julday, Constants.SE_MOON, Constants.SEFLG_SPEED).xx[0]), signs)],
      ['mercurio', this.signFromLongitude(Number(eph.swe_calc_ut(julday, Constants.SE_MERCURY, Constants.SEFLG_SPEED).xx[0]), signs)],
      ['venus', this.signFromLongitude(Number(eph.swe_calc_ut(julday, Constants.SE_VENUS, Constants.SEFLG_SPEED).xx[0]), signs)],
      ['marte', this.signFromLongitude(Number(eph.swe_calc_ut(julday, Constants.SE_MARS, Constants.SEFLG_SPEED).xx[0]), signs)],
      ['jupiter', this.signFromLongitude(Number(eph.swe_calc_ut(julday, Constants.SE_JUPITER, Constants.SEFLG_SPEED).xx[0]), signs)],
      ['saturno', this.signFromLongitude(Number(eph.swe_calc_ut(julday, Constants.SE_SATURN, Constants.SEFLG_SPEED).xx[0]), signs)],
      ['urano', this.signFromLongitude(Number(eph.swe_calc_ut(julday, Constants.SE_URANUS, Constants.SEFLG_SPEED).xx[0]), signs)],
      ['netuno', this.signFromLongitude(Number(eph.swe_calc_ut(julday, Constants.SE_NEPTUNE, Constants.SEFLG_SPEED).xx[0]), signs)],
      ['plutao', this.signFromLongitude(Number(eph.swe_calc_ut(julday, Constants.SE_PLUTO, Constants.SEFLG_SPEED).xx[0]), signs)],
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