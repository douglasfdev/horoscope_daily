import { Location } from '../../domain/value-objects/location.js';

export interface AstroCalculationPort {
  calculateNatalChart(
    date: Date,
    time: string,
    location: Location
  ): Promise<any>;
}