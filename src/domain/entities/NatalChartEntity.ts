export interface NatalChartEntity {
  name: string;
  birthDate: Date;
  birthTime: Date;
  latitude: number;
  longitude: number;
  timezone: string;
  houses: number[];
  planetPositions: Map<string, string>;
  ascendant: string;
  midheaven: string;
  generatedAt: Date;
}