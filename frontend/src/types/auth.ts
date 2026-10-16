export type ZodiacSign = 
  | 'aries' | 'taurus' | 'gemini' | 'cancer'
  | 'leo' | 'virgo' | 'libra' | 'scorpio'
  | 'sagittarius' | 'capricorn' | 'aquarius' | 'pisces';

export interface User {
  id: string;
  email: string;
  name: string;
  preferredUsername: string;
  preferredLanguage: string;
  expiresAt: number;
}

export interface Profile {
  userId: string;
  birthDate: string;
  phone: string | null;
  sign: ZodiacSign;
  preferredLanguage: string;
  notificationOptIn: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Horoscope {
  sign: ZodiacSign;
  language: string;
  date: string;
  prediction: string;
  luckyNumber: number;
  color: string;
  compatibility: string[];
  generatedAt: string;
}