import 'reflect-metadata';
import { AstroCalculationPort } from '../../application/ports/astro-port.js';
import { NatalChartEntity } from '../../domain/entities/NatalChartEntity.js';
import { Coordinate } from '../../domain/value-objects/Coordinate.js';
import { injectable } from 'inversify';

@injectable()
export class GenerateAdvancedNatalChartUseCase {
  constructor(
    private astroCalculationPort: AstroCalculationPort
  ) { }

  async execute(
    birthDate: string,
    birthTime: string,
    latitude: number,
    longitude: number,
    timezone: string = 'America/Sao_Paulo'
  ): Promise<NatalChartEntity> {
    const coordinate = Coordinate.create(latitude, longitude);
    const result = await this.astroCalculationPort.generateNatalChart(
      birthDate,
      birthTime,
      coordinate.latitude,
      coordinate.longitude,
      timezone
    );
    return result;
  }
}