import { NodeSDK } from '@opentelemetry/sdk-node';
import { diag, DiagConsoleLogger, DiagLogger, getNodeAutoInstrumentations } from '@opentelemetry/api';

diag.setLogger(new DiagConsoleLogger(), DiagLogger.NONE);

export async function setupInstrumentation(fastify: any, config: any) {
  const sdk = new NodeSDK({
    traceExporter: new (await import('@opentelemetry/exporter-trace-otlp-http')).OTLPTraceExporter({
      url: config.otelExporterEndpoint,
    }),
    instrumentations: [getNodeAutoInstrumentations({
      enabledInterceptors: ['fetch', 'http'],
    })],
  });

  await sdk.start().then(() => {
    diag.info('OpenTelemetry SDK started');
  }).catch((err) => {
    diag.error(`Failed to start OpenTelemetry SDK: ${err}`);
  });

  fastify.addHook('onClose', async (instance: any, next: any) => {
    await sdk.shutdown();
    diag.info('OpenTelemetry SDK shutdown');
    next();
  });
}