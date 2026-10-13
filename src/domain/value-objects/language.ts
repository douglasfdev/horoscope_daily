export class Language {
  public readonly value: string;

  constructor(language: string) {
    if (!['pt', 'en', 'es', 'fr', 'it'].includes(language)) {
      throw new Error('Idioma não suportado');
    }
    this.value = language;
  }

  toString(): string {
    return this.value;
  }
}