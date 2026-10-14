import { getHoroscope, HoroscopeError, Language, ZodiacSign } from 'horoscopefree';
import { injectable } from 'inversify';
import { HoroscopeEnginePort } from '../../../application/ports/astro-port.js';
import { HoroscopeEntity } from '../../../domain/entities/HoroscopeEntity.js';
import { Sign } from '../../../domain/value-objects/Sign.js';

@injectable()
export class HoroscopeFreeAdapter implements HoroscopeEnginePort {

  async fetchHoroscope(sign: string, date: string, lang: string): Promise<HoroscopeEntity> {
    const normalizedSign = Sign.create(sign);

    const isValid = await this.isValidSign(sign, lang);
    if (!isValid) {
      throw new Error(`Signo inválido ou não disponível para o idioma ${lang}`);
    }

    try {
      const result = await getHoroscope(normalizedSign.value as ZodiacSign, date, lang as Language);

      const luckyNumbers: Record<string, number> = {
        'aries': 9, 'taurus': 6, 'gemini': 5, 'cancer': 2,
        'leo': 1, 'virgo': 4, 'libra': 3, 'scorpio': 8,
        'sagittarius': 3, 'capricorn': 10, 'aquarius': 7, 'pisces': 2
      };
      const colors: Record<string, string> = {
        'aries': 'vermelho', 'taurus': 'verde', 'gemini': 'amarelo', 'cancer': 'prateado',
        'leo': 'dourado', 'virgo': 'marrom', 'libra': 'rosa', 'scorpio': 'preto',
        'sagittarius': 'roxo', 'capricorn': 'branco', 'aquarius': 'ciano', 'pisces': 'azul'
      };

      const compatibility = this.getCompatibilitySigns(normalizedSign.value);

      return {
        sign: normalizedSign.value,
        language: lang,
        date,
        prediction: result.text,
        luckyNumber: luckyNumbers[normalizedSign.value] || 1,
        color: colors[normalizedSign.value] || 'cinza',
        compatibility,
        generatedAt: new Date(),
        ...(result.cached !== undefined && { cached: result.cached })
      };
    } catch (error: any) {
      if (error instanceof HoroscopeError) {
        throw new Error(`Erro no cálculo astrológico: ${error.message} (código: ${error.code})`);
      }
      throw error;
    }
  }

  private getCompatibilitySigns(sign: string): string[] {
    const compatibility: Record<string, string[]> = {
      'aries': ['leao', 'sagitario'],
      'taurus': ['virgem', 'capricornio'],
      'gemini': ['libra', 'aquario'],
      'cancer': ['escorpiao', 'peixes'],
      'leo': ['aries', 'sagitario'],
      'virgem': ['touro', 'capricornio'],
      'libra': ['gemeos', 'aquario'],
      'scorpio': ['cancer', 'peixes'],
      'sagittarius': ['aries', 'leao'],
      'capricorn': ['touro', 'virgem'],
      'aquarius': ['gemeos', 'aquario'],
      'pisces': ['cancer', 'escorpiao'],
    };
    return compatibility[sign] || [];
  }

  async isValidSign(sign: string, lang: string): Promise<boolean> {
    const validSigns = [
      'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
      'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'
    ];
    return validSigns.includes(sign.toLowerCase());
  }
}