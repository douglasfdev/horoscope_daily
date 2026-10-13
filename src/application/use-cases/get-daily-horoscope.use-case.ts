import 'reflect-metadata';
import { HoroscopeEnginePort } from '../../application/ports/astro-port';
import { HoroscopeEntity } from '../../domain/entities/HoroscopeEntity';
import { Sign } from '../../domain/value-objects/Sign';
import { DateTimeVO } from '../../domain/value-objects/DateTimeVO';
import { injectable } from 'inversify';

@injectable()
export class GetDailyHoroscopeUseCase {
  constructor(
    private horoscopePort: HoroscopeEnginePort
  ) {}

  async execute(sign: string, lang: string = 'pt', targetDate?: Date): Promise<HoroscopeEntity> {
    const normalizedSign = Sign.create(sign);
    const dateStr = targetDate 
      ? DateTimeVO.create(targetDate.toISOString()).toDateString()
      : DateTimeVO.create(new Date().toISOString()).toDateString();

    const result = await this.horoscopePort.fetchHoroscope(
      normalizedSign.toString(),
      dateStr,
      lang
    );

    return result;
  }
}