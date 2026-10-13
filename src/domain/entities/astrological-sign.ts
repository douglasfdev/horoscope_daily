export class AstrologicalSign {
  public readonly value: string;
  public readonly portugueseName: string;
  public readonly englishName: string;

  constructor(value: string, portugueseName: string, englishName: string) {
    this.value = value;
    this.portugueseName = portugueseName;
    this.englishName = englishName;
  }

  static getSign(sign: string): AstrologicalSign {
    const signs: Record<string, AstrologicalSign> = {
     aries: new AstrologicalSign('Áries', 'Áries', 'Aries'),
      taurus: new AstrologicalSign('Touro', 'Touro', 'Taurus'),
      gemini: new AstrologicalSign('Gêmeos', 'Gêmeos', 'Gemini'),
      cancer: new AstrologicalSign('Câncer', 'Câncer', 'Cancer'),
      leo: new AstrologicalSign('Leão', 'Leão', 'Leo'),
      virgo: new AstrologicalSign('Virgem', 'Virgem', 'Virgo'),
      libra: new AstrologicalSign('Libra', 'Libra', 'Libra'),
      scorpio: new AstrologicalSign('Escorpião', 'Escorpião', 'Scorpio'),
      sagittarius: new AstrologicalSign('Sagitário', 'Sagitário', 'Sagittarius'),
      capricorn: new AstrologicalSign('Capricórnio', 'Capricórnio', 'Capricorn'),
      aquarius: new AstrologicalSign('Aquário', 'Aquário', 'Aquarius'),
      pisces: new AstrologicalSign('Peixes', 'Peixes', 'Pisces'),
    };

    const upper = sign.toLowerCase();
    if (signs[upper]) {
      return signs[upper];
    }
    // Try exact match
    if (signs[sign.toLowerCase()]) {
      return signs[sign.toLowerCase()];
    }
    throw new Error('Signo inválido');
  }
}