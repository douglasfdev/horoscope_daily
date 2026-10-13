export class Coordinate {
  private constructor(
    public readonly latitude: number,
    public readonly longitude: number
  ) {}

  static create(latitude: number, longitude: number): Coordinate {
    if (latitude < -90 || latitude > 90) {
      throw new Error(`Latitute inválida: ${latitude}. Deve estar entre -90 e 90.`);
    }
    if (longitude < -180 || longitude > 180) {
      throw new Error(`Longitude inválida: ${longitude}. Deve estar entre -180 e 180.`);
    }
    return new Coordinate(latitude, longitude);
  }

  toString(): string {
    return `(${this.latitude}, ${this.longitude})`;
  }
}