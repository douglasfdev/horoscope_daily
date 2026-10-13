import { diag, DiagConsoleLogger, DiagSeverity } from '@opentelemetry/api';
import { NodeTracerProvider } from '@opentelemetry/tracing';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { FastifyInstrumentation } from '@opentelemetry/instrumentation-fastify';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { envInstrumentationConfig } from '@opentelemetry/instrumentation';

// Configuração de logging de diagnóstico
diag.setLogger(new DiagConsoleLogger(), DiagSeverity.WARN);

export class OpenTelemetryTracer {
  private sdk;

  constructor() {
    this.sdk = new NodeSDK({
      traceExporter: new OTLPTraceExporter({
        url: process.env.OTEL_EXPORTER_OTLP_URL || 'http://localhost:4318/v1/traces',
      }),
      instrumentations: [
        new FastifyInstrumentation({
          atOutgoingHook: true,
        }),
        // Instrumentação automática para http, mysql, etc.
      ],
    });

    this.sdk.start();
  }

  startSpan(name: string) {
    const tracer = this.sdk.getTracer('daily-sorte-astroengine');
    const span = tracer.startSpan(name);
    return { span, tracer };
  }
}