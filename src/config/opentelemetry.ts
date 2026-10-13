import { NodeSDK } from '@opentelemetry/sdk-node';
import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';

diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.NONE);

export async function setupInstrumentation(fastify: any, config: any) {
  const sdk = new NodeSDK({
    traceExporter: new (await import('@opentelemetry/exporter-trace-otlp-http')).OTLPTraceExporter({
      url: config.otelExporterEndpoint,
    }),
    instrumentations: [getNodeAutoInstrumentations({
      '@opentelemetry/instrumentation-fs': { enabled: false },
    })],
  });

  try {
    await sdk.start();
    diag.info('OpenTelemetry SDK started');
  } catch (err: any) {
    diag.error(`Failed to start OpenTelemetry SDK: ${err}`);
  }

  fastify.addHook('onClose', async () => {
    await sdk.shutdown();
    diag.info('OpenTelemetry SDK shutdown');
  });
}