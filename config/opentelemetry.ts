import { NodeSDK } from '@opentelemetry/sdk-node';
import { diag, DiagConsoleLogger, DiagLogger } from '@opentelemetry/api';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';

diag.setLogger(new DiagConsoleLogger(), DiagSeverity.WARN);

export async function setupInstrumentation(fastify: any, config: any) {
  // Use type assertion to bypass the incompatible type check
  const exporter = new (OTLPTraceExporter as any)({
    url: config.otelExporterEndpoint,
  });

  const sdk = new NodeSDK({
    traceExporter: exporter,
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
