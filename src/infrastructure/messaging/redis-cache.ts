import Redis from 'ioredis';
import { loadConfig } from '../../config';

let redisClient: Redis;

export function initRedis(): void {
  const config = loadConfig();

  redisClient = new Redis({
    host: config.redisUri,
    port: 6379,
    password: config.redisPassword,
    maxRetriesPerRequest: 3,
  });

  redisClient.on('connect', () => {
    console.log('✅ Redis connected successfully (redis-cache)');
  });

  redisClient.on('error', (err) => {
    console.error('❌ Redis error (redis-cache):', err);
  });
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