export class Sign {
  private constructor(public readonly value: string) {}

  static create(sign: string): Sign {
    const normalized = sign.trim().toLowerCase();
    const validSigns = [
      'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
      'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'
    ];

    if (!validSigns.includes(normalized)) {
      throw new Error(`Signo inválido: ${sign}`);
    }

    return new Sign(normalized);
  }

  toString(): string {
    return this.value;
  }
}