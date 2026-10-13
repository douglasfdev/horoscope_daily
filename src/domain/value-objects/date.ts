import { Language } from '../value-objects/language';

export class BirthDate {
  public readonly value: Date;

  constructor(date: string | Date, language: Language) {
    const parsedDate = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(parsedDate.getTime())) {
      throw new Error('Data inválida');
    }
    this.value = parsedDate;
  }

  format(format: 'short' | 'long' = 'short'): string {
    if (format === 'long') {
      return this.value.toLocaleDateString(undefined, { 
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
      });
    }
    return this.value.toLocaleDateString(undefined, { 
      year: 'numeric', month: '2-digit', day: '2-digit' 
    });
  }
}