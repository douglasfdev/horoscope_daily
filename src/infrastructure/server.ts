import Fastify from 'fastify';
import fp from 'fastify-plugin';
import { initRedis, closeRedis, getWhatsAppService, isWhatsAppAvailable, getRedis } from '../infrastructure/messaging';
import { loadConfig } from '../config/index.js';
import { setupInstrumentation, diag } from '../config/opentelemetry.js';
import { AstrolinkEngineAdapter } from '../infrastructure/adapters/astro-libs/AstrolinkEngineAdapter.js';
import { HoroscopeFreeAdapter } from '../infrastructure/adapters/astro-libs/HoroscopeFreeAdapter.js';
import "dotenv/config";
async function bootstrap() {
  diag.setLogger(new (require('@opentelemetry/api').DiagConsoleLogger), require('@opentelemetry/api').DiagLogLevel.NONE);
  diag.info('🚀 Starting Daily Sorte & AstroEngine...');

  const config = loadConfig();
  diag.info(`📋 Config: NODE_ENV=${config.nodeEnv}, PORT=${config.port}`);

  const fastify = Fastify({ logger: { level: config.nodeEnv === 'development' ? 'info' : 'warn' } });

  await setupInstrumentation(fastify, config);

  initRedis();

  const horoscopeAdapter = new HoroscopeFreeAdapter();
  const astroAdapter = new AstrolinkEngineAdapter();

  fp(async (instance: any) => {
    await routes(instance, {
      getDailyHoroscopeUseCase: new (await import('../application/use-cases/get-daily-horoscope.use-case.js')).GetDailyHoroscopeUseCase(horoscopeAdapter),
      generateNatalChartUseCase: new (await import('../application/use-cases/generate-advanced-natal-chart.use-case.js')).GenerateAdvancedNatalChartUseCase(astroAdapter),
    });
  });

  const listenAddr = await fastify.listen({ port: config.port, host: '0.0.0.0' });
  diag.info(`🌍 Server running at: ${listenAddr}`);

  process.on('SIGINT', async () => {
    await fastify.close();
    await closeRedis();
    process.exit(0);
  });
}

bootstrap().catch((err) => {
  diag.error('❌ Fatal error:', err);
  process.exit(1);
});
