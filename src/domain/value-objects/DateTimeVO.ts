export class DateTimeVO {
  private constructor(public readonly value: Date) {}

  static create(dateStr: string): DateTimeVO {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      throw new Error(`Data inválida: ${dateStr}`);
    }
    return new DateTimeVO(date);
  }

  toISOString(): string {
    return this.value.toISOString();
  }

  toDateString(): string {
    return this.value.toISOString().split('T')[0];
  }
}