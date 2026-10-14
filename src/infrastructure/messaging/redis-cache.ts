import Redis from 'ioredis';
import { loadConfig } from '../../config';
import { Profile } from '../database/models/profile.model';
import { WhatsAppService, WhatsAppMessage, WhatsAppSendResult } from '../services/whatsapp.service';

let redisClient: Redis;
let whatsAppService: WhatsAppService | null = null;

/**
 * Inicializa o Redis e opcionalmente o WhatsApp Service.
 * O WhatsApp Service será inicializado somente quando houver credencials configuradas.
 */
export function initRedis(config?: any): void {
  redisClient = new Redis({
    host: loadConfig().redisUri?.replace('rediss://', '') || 'localhost',
    port: 6379,
    maxRetriesPerRequest: 3,
  });

  redisClient.on('connect', () => {
    console.log('✅ Redis connected successfully (redis-cache)');
  });

  redisClient.on('error', (err) => {
    console.error('❌ Redis error (redis-cache):', err);
  });

  // Inicializa WhatsApp Service se tiver token e phoneNumberId
  // Em produção, esses valores viriam do painel administrativo ou .env
  const whatsappToken = process.env.WHATSAPP_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (whatsappToken && phoneNumberId) {
    whatsAppService = new WhatsAppService(whatsappToken, phoneNumberId);
    console.log('✅ WhatsApp Service initialized (production mode)');
  } else {
    console.log('⚠️ WhatsApp Service not initialized - missing credentials');
    console.log('   - WHATSAPP_TOKEN: ' + (whatsappToken ? 'set' : 'missing'));
    console.log('   - WHATSAPP_PHONE_NUMBER_ID: ' + (phoneNumberId ? 'set' : 'missing'));
  }
}

export function getRedis(): Redis {
  if (!redisClient) {
    throw new Error('Redis client not initialized. Call initRedis() first.');
  }
  return redisClient;
}

export function closeRedis(): Promise<void> {
  return new Promise((resolve) => {
    if (redisClient) {
      redisClient.quit();
      resolve();
    } else {
      resolve();
    }
  });
}

/**
 * Obtém o WhatsApp Service instanciado (se disponível)
 */
export function getWhatsAppService(): WhatsAppService | null {
  return whatsAppService;
}

/**
 * Verifica se o WhatsApp Service está disponível
 */
export function isWhatsAppAvailable(): boolean {
  return whatsAppService != null;
}