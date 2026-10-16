import type { ZodiacSign } from '@/types/auth';

/**
 * Zodiac sign information
 * Used for UI display and sign calculation
 */
export const zodiacSigns = {
  aries: {
    name: 'Áries',
    dates: [21, 19],
    emoji: '♈',
    color: 'red',
    element: 'Fogo',
    symbol: '0',
  },
  taurus: {
    name: 'Touro',
    dates: [20, 20],
    emoji: '♉',
    color: 'green',
    element: 'Terra',
    symbol: 'III',
  },
  gemini: {
    name: 'Gêmeos',
    dates: [21, 20],
    emoji: '♊',
    color: 'yellow',
    element: 'Ar',
    symbol: 'VI',
  },
  cancer: {
    name: 'Câncer',
    dates: [21, 22],
    emoji: '♋',
    color: 'silver',
    element: 'Água',
    symbol: 'IV',
  },
  leo: {
    name: 'Leão',
    dates: [23, 22],
    emoji: '♌',
    color: 'orange',
    element: 'Fogo',
    symbol: 'V',
  },
  virgo: {
    name: 'Virgem',
    dates: [23, 22],
    emoji: '♍',
    color: 'teal',
    element: 'Terra',
    symbol: 'VI',
  },
  libra: {
    name: 'Libra',
    dates: [23, 22],
    emoji: '♎',
    color: 'blue',
    element: 'Ar',
    symbol: 'VII',
  },
  scorpio: {
    name: 'Escorpião',
    dates: [23, 21],
    emoji: '♏',
    color: 'purple',
    element: 'Água',
    symbol: 'VIII',
  },
  sagittarius: {
    name: 'Sagitário',
    dates: [22, 21],
    emoji: '♐',
    color: 'purple',
    element: 'Fogo',
    symbol: 'IX',
  },
  capricorn: {
    name: 'Capricórnio',
    dates: [22, 19],
    emoji: '♑',
    color: 'blue',
    element: 'Terra',
    symbol: 'X',
  },
  aquarius: {
    name: 'Aquário',
    dates: [20, 18],
    emoji: '♒',
    color: 'blue',
    element: 'Ar',
    symbol: 'XI',
  },
  pisces: {
    name: 'Peixes',
    dates: [19, 20],
    emoji: '♓',
    color: 'violet',
    element: 'Água',
    symbol: 'XII',
  },
} as const;

/**
 * Get sign name by sign key
 */
export function getSignName(sign: ZodiacSign): string {
  return zodiacSigns[sign].name;
}

/**
 * Get sign emoji by sign key
 */
export function getSignEmoji(sign: ZodiacSign): string {
  return zodiacSigns[sign].emoji;
}

/**
 * Get sign color by color name
 */
export function getSignColor(color: string): string {
  const colorMap: Record<string, string> = {
    red: 'red',
    green: 'emerald',
    yellow: 'yellow',
    silver: 'gray',
    orange: 'orange',
    teal: 'teal',
    blue: 'blue',
    purple: 'purple',
    violet: 'violet',
  };
  return colorMap[color] || 'blue';
}

/**
 * Calculate zodiac sign from birth date
 * @param birthDate - Date of birth
 * @returns Zodiac sign
 */
export function calculateZodiacSign(birthDate: Date): ZodiacSign {
  const month = birthDate.getMonth() + 1; // 1-12
  const day = birthDate.getDate();

  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return 'aries';
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return 'taurus';
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return 'gemini';
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return 'cancer';
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return 'leo';
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return 'virgo';
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return 'libra';
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return 'scorpio';
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return 'sagittarius';
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return 'capricorn';
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return 'aquarius';
  return 'pisces';
}

/**
 * Get birth date range for a zodiac sign
 */
export function getSignDateRange(sign: ZodiacSign): { start: string; end: string } {
  const signInfo = zodiacSigns[sign];
  const year = new Date().getFullYear();
  
  const startDate = new Date(year, getMonthForSign(sign, true), signInfo.dates[0]);
  const endDate = new Date(year, getMonthForSign(sign, false), signInfo.dates[1]);
  
  return {
    start: startDate.toISOString().split('T')[0],
    end: endDate.toISOString().split('T')[0],
  };
}

/**
 * Helper to get the month for a sign
 */
function getMonthForSign(sign: ZodiacSign, isStart: boolean): number {
  const signMonths: Record<ZodiacSign, [number, number]> = {
    aries: [2, 3],
    taurus: [3, 4],
    gemini: [4, 5],
    cancer: [5, 6],
    leo: [6, 7],
    virgo: [7, 8],
    libra: [8, 9],
    scorpio: [9, 10],
    sagittarius: [10, 11],
    capricorn: [11, 0],
    aquarius: [0, 1],
    pisces: [1, 2],
  };
  
  const months = signMonths[sign];
  return months[isStart ? 0 : 1];
}