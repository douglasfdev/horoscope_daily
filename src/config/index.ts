export interface IConfig {
  nodeEnv: string;
  port: number;
  supabaseUrl: string;
  supabaseAnonKey: string;
  redisUri: string;
  redisPassword: string;
  rabbitMqUrl: string;
  otelExporterEndpoint: string;
  serviceName: string;
}

const {
  NODE_ENV,
  PORT,
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  REDIS_URI,
  
  RABBITMQ_URL,
  OTEL_EXPORTER_OTLP_ENDPOINT,
  OTEL_SERVICE_NAME
} = process.env;

export function loadConfig(): IConfig {
  return {
    nodeEnv: NODE_ENV || 'development',
    port: parseInt(PORT || '3000', 10),
    supabaseUrl: SUPABASE_URL || 'https://your-project.supabase.co',
    supabaseAnonKey: SUPABASE_ANON_KEY || 'your-anon-key',
    redisUri: REDIS_URI || 'redis://localhost:6379',
    redisPassword: REDIS_URI ?? '',
    rabbitMqUrl: RABBITMQ_URL || 'amqp://localhost:5672',
    otelExporterEndpoint: OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4317',
    serviceName: OTEL_SERVICE_NAME || 'daily-sorte-astroengine',
  };
}